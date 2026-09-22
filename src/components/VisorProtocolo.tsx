import React from 'react';

interface VisorProtocoloProps {
  protocolo: any;
  onVolver: () => void;
}

export const VisorProtocolo: React.FC<VisorProtocoloProps> = ({ protocolo, onVolver }) => {
  return (
    <section className="protocol-info-">
      <button className="btn" onClick={onVolver}>
        ⬅ Volver al inicio
      </button>

     <div className="protocol-texto" >
      <h2>{protocolo?.titulo || 'Título no disponible'}</h2>
      <h3>{protocolo?.subtitulo || 'Subtítulo no disponible'}</h3>
      <p>{protocolo?.desc || 'Cargando contenido del protocolo...'}</p>
      </div>
      
      <div className="protocol-multi" >
        <h3>Imagenes o cuadros van aca con un subtitulo</h3>
      </div>
    </section>
  );
};
