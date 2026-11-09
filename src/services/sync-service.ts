import { higaDb } from '../db/higa-db';
import type { DiagnosticoLocal, ProtocoloLocal } from '../db/types';
import { API_URL } from '../config/api';

interface SyncResponse {
  nro_sync: string;
  last_sync_at: string;
  reset: boolean;
  diagnosticos: DiagnosticoRemoto[];
  protocolos: ProtocoloRemoto[];
  deleted: {
    diagnosticos: string[];
    protocolos: string[];
  };
  usuario_actualizado: UsuarioSesion | null;
  usuario_eliminado: boolean;
}

export interface SyncResult {
  huboCambios: boolean;
  usuarioEliminado: boolean;
  usuarioActualizado: UsuarioSesion | null;
}

export interface UsuarioSesion {
  id: string | number;
  nombre?: string;
  apellido?: string;
  is_admin?: boolean;
}

type ProtocoloRemoto = Omit<ProtocoloLocal, 'id_diagnostico'> & {
  id_diagnostico?: string | number;
};

type DiagnosticoRemoto = DiagnosticoLocal & {
  protocolo?: ProtocoloRemoto;
};

const SYNC_CURSOR_KEY = 'sync_cursor';
const SYNC_LAST_SYNC_AT_KEY = 'sync_last_sync_at';
const SYNC_USER_ID_KEY = 'sync_user_id';

const validarRespuesta = (respuesta: unknown): SyncResponse => {
  if (!respuesta || typeof respuesta !== 'object') {
    throw new Error('La respuesta de sincronización no tiene el formato esperado');
  }

  const datos = respuesta as Partial<SyncResponse>;
  if (
    typeof datos.nro_sync !== 'string' ||
    typeof datos.last_sync_at !== 'string' ||
    typeof datos.reset !== 'boolean' ||
    !Array.isArray(datos.diagnosticos) ||
    !Array.isArray(datos.protocolos) ||
    !datos.deleted ||
    !Array.isArray(datos.deleted.diagnosticos) ||
    !Array.isArray(datos.deleted.protocolos) ||
    typeof datos.usuario_eliminado !== 'boolean' ||
    (datos.usuario_actualizado !== null &&
      (typeof datos.usuario_actualizado !== 'object' || !datos.usuario_actualizado))
  ) {
    throw new Error('La respuesta de sincronización no tiene el formato esperado');
  }

  return datos as SyncResponse;
};

const guardarDiagnostico = (diagnostico: DiagnosticoRemoto) => {
  const { protocolo, ...diagnosticoLocal } = diagnostico;
  return {
    diagnosticoLocal,
    protocolo: protocolo
      ? { ...protocolo, id_diagnostico: String(protocolo.id_diagnostico ?? diagnostico.id) }
      : undefined
  };
};

export const sincronizarDatos = async (usuario: UsuarioSesion | null): Promise<SyncResult> => {
  if (!usuario?.id) {
    throw new Error('No se puede sincronizar sin una sesión iniciada');
  }

  const metadata = await higaDb.metadata.get(SYNC_CURSOR_KEY);
  const ultimaSincronizacion = await higaDb.metadata.get(SYNC_LAST_SYNC_AT_KEY);
  const usuarioSincronizado = await higaDb.metadata.get(SYNC_USER_ID_KEY);
  const [diagnosticosLocales, protocolosLocales] = await Promise.all([
    higaDb.diagnosticos.count(),
    higaDb.protocolos.count()
  ]);
  const cambioDeUsuario = usuarioSincronizado?.valor !== String(usuario.id);
  const necesitaCargaInicial =
    cambioDeUsuario || diagnosticosLocales === 0 || protocolosLocales === 0;
  const cursor = necesitaCargaInicial ? '0' : metadata?.valor ?? '0';
  const parametros = new URLSearchParams({
    id: String(usuario.id),
    sync: cursor
  });
  if (!necesitaCargaInicial && ultimaSincronizacion?.valor) {
    parametros.set('last_sync_at', ultimaSincronizacion.valor);
  }
  const response = await fetch(
    `${API_URL}/sync?${parametros.toString()}`
  );

  if (!response.ok) {
    throw new Error(`La sincronización falló (${response.status})`);
  }

  const data = validarRespuesta(await response.json());
  const diagnosticosRemotos = data.diagnosticos;
  const protocolosRemotos = data.protocolos;
  const huboCambios =
    cambioDeUsuario ||
    data.reset ||
    data.usuario_eliminado ||
    data.usuario_actualizado !== null ||
    diagnosticosRemotos.length > 0 ||
    protocolosRemotos.length > 0 ||
    data.deleted.diagnosticos.length > 0 ||
    data.deleted.protocolos.length > 0;

  const diagnosticos = diagnosticosRemotos
    .map(guardarDiagnostico);
  const protocolosPorId = new Map<string, ProtocoloLocal>();
  for (const protocolo of protocolosRemotos) {
    if (protocolo.id_diagnostico !== undefined) {
      protocolosPorId.set(String(protocolo.id), {
        ...protocolo,
        id_diagnostico: String(protocolo.id_diagnostico)
      });
    }
  }
  for (const { protocolo } of diagnosticos) {
    if (protocolo) {
      protocolosPorId.set(String(protocolo.id), protocolo);
    }
  }
  const protocolos = [...protocolosPorId.values()];

  await higaDb.transaction(
    'rw',
    higaDb.diagnosticos,
    higaDb.protocolos,
    higaDb.metadata,
    async () => {
      if (data.usuario_eliminado) {
        await higaDb.diagnosticos.clear();
        await higaDb.protocolos.clear();
        await higaDb.metadata.clear();
      } else {
        if (data.reset || cambioDeUsuario) {
          await higaDb.diagnosticos.clear();
          await higaDb.protocolos.clear();
        }

        await higaDb.diagnosticos.bulkPut(diagnosticos.map(({ diagnosticoLocal }) => diagnosticoLocal));
        await higaDb.protocolos.bulkPut(protocolos);

        for (const { protocolo } of diagnosticos) {
          if (protocolo) {
            await higaDb.protocolos.put(protocolo);
          }
        }

        await higaDb.protocolos.bulkDelete(data.deleted.protocolos);
        await higaDb.diagnosticos.bulkDelete(data.deleted.diagnosticos);
        await higaDb.metadata.put({ clave: SYNC_CURSOR_KEY, valor: data.nro_sync });
        await higaDb.metadata.put({ clave: SYNC_LAST_SYNC_AT_KEY, valor: data.last_sync_at });
        await higaDb.metadata.put({ clave: SYNC_USER_ID_KEY, valor: String(usuario.id) });
      }
    }
  );

  return {
    huboCambios,
    usuarioEliminado: data.usuario_eliminado,
    usuarioActualizado: data.usuario_actualizado
  };
};
