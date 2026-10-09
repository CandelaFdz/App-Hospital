import { higaDb } from '../db/higa-db';
import type { DiagnosticoLocal, ProtocoloLocal } from '../db/types';

interface SyncResponse {
  nro_sync: string;
  created: SyncChanges;
  updated: SyncChanges;
  deleted: {
    diagnosticos: string[];
    protocolos: string[];
  };
}

interface SyncChanges {
  diagnosticos: DiagnosticoRemoto[];
  protocolos: ProtocoloRemoto[];
}

export interface SyncResult {
  huboCambios: boolean;
}

type ProtocoloRemoto = Omit<ProtocoloLocal, 'id_diagnostico'> & {
  id_diagnostico?: string | number;
};

type DiagnosticoRemoto = DiagnosticoLocal & {
  protocolo?: ProtocoloRemoto;
};

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const SYNC_USER_ID = import.meta.env.VITE_SYNC_USER_ID ?? '0';
const SYNC_CURSOR_KEY = 'sync_cursor';

const validarRespuesta = (respuesta: unknown): SyncResponse => {
  if (!respuesta || typeof respuesta !== 'object' || !('nro_sync' in respuesta)) {
    throw new Error('La respuesta de sincronización no tiene el formato esperado');
  }

  return respuesta as SyncResponse;
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

export const sincronizarDatos = async (): Promise<SyncResult> => {
  const metadata = await higaDb.metadata.get(SYNC_CURSOR_KEY);
  const cursor = metadata?.valor ?? '0';
  const [diagnosticosLocales, protocolosLocales] = await Promise.all([
    higaDb.diagnosticos.count(),
    higaDb.protocolos.count()
  ]);
  const necesitaCargaInicial = diagnosticosLocales === 0 || protocolosLocales === 0;
  const response = await fetch(
    `${API_URL}/sync?id=${encodeURIComponent(SYNC_USER_ID)}&sync=${encodeURIComponent(cursor)}`
  );

  if (!response.ok) {
    throw new Error(`La sincronización falló (${response.status})`);
  }

  const data = validarRespuesta(await response.json());
  let diagnosticosRemotos = [...data.created.diagnosticos, ...data.updated.diagnosticos];
  let protocolosRemotos = [...data.created.protocolos, ...data.updated.protocolos];
  let huboCambios =
    diagnosticosRemotos.length > 0 ||
    protocolosRemotos.length > 0 ||
    data.deleted.diagnosticos.length > 0 ||
    data.deleted.protocolos.length > 0;

  // El historial puede no contener los datos existentes antes de habilitar sync.
  if (necesitaCargaInicial) {
    const [diagnosticosResponse, protocolosResponse] = await Promise.all([
      fetch(`${API_URL}/diagnosticos`),
      fetch(`${API_URL}/protocolos`)
    ]);

    if (!diagnosticosResponse.ok || !protocolosResponse.ok) {
      throw new Error('No se pudo realizar la carga inicial de datos');
    }

    diagnosticosRemotos = await diagnosticosResponse.json();
    protocolosRemotos = await protocolosResponse.json();
    huboCambios = diagnosticosRemotos.length > 0 || protocolosRemotos.length > 0;
  }

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
    }
  );

  return { huboCambios };
};
