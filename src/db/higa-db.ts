import Dexie, { type Table } from 'dexie';
import type { DiagnosticoLocal, ProtocoloLocal } from './types';

class HigaDatabase extends Dexie {
  diagnosticos!: Table<DiagnosticoLocal, string>;
  protocolos!: Table<ProtocoloLocal, string>;

  constructor() {
    super('higa-local');

    this.version(1).stores({
      diagnosticos: 'id, titulo',
      protocolos: 'id, id_diagnostico'
    });
  }
}

export const higaDb = new HigaDatabase();