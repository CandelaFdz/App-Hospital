export interface DiagnosticoLocal {
  id: string;
  titulo: string;
  desc: string;
  creado?: string;
  modificado?: string;
}

export interface ProtocoloLocal {
  id: string;
  subtitulo: string;
  desc: string;
  id_diagnostico: string;
  creado?: string;
  modificado?: string;
}

export interface DiagnosticoConProtocolo extends DiagnosticoLocal {
  protocolo?: ProtocoloLocal;
}
