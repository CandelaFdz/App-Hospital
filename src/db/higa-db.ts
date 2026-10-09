import Dexie, { type Table } from 'dexie';
import type { DiagnosticoLocal, ProtocoloLocal } from './types.ts';

class HigaDatabase extends Dexie {
  diagnosticos!: Table<DiagnosticoLocal, string>;
  protocolos!: Table<ProtocoloLocal, string>;
  metadata!: Table<{ clave: string; valor: string }, string>;

  constructor() {
    super('higa-local');

    this.version(1).stores({
      diagnosticos: 'id, titulo',
      protocolos: 'id, id_diagnostico'
    });

    this.version(2).stores({
      diagnosticos: 'id, titulo',
      protocolos: 'id, id_diagnostico',
      metadata: 'clave'
    });

    // ACLARACIÓN: cuando termine el desarrollo hay que quitar el versionado de las bases locales, ya que es innecesario
    // PERO PARA EVITAR ERRORES: tenemos que borrar la base de datos de todos los dispositivos de donde abrimos la aplicación
  }
}

export const higaDb = new HigaDatabase();