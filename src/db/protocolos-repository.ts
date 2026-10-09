import { higaDb } from './higa-db';
import type { DiagnosticoConProtocolo, DiagnosticoLocal } from './types';

export const obtenerDiagnosticos = (): Promise<DiagnosticoLocal[]> =>
  higaDb.diagnosticos.toArray();

export const obtenerDiagnosticosConProtocolos = async (): Promise<DiagnosticoConProtocolo[]> => {
  const [diagnosticos, protocolos] = await Promise.all([
    higaDb.diagnosticos.toArray(),
    higaDb.protocolos.toArray()
  ]);

  return diagnosticos.map((diagnostico) => ({
    ...diagnostico,
    protocolo: protocolos.find(
    (protocolo) => String(protocolo.id_diagnostico) === String(diagnostico.id)
    )
  }));
};