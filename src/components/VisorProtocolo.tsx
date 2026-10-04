import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface VisorProtocoloProps {
  protocolo: any;
  onVolver: () => void;
  onCrearProtocolo?: () => void;
  onEditarProtocolo?: () => void;
  onEditarDiagnostico?: () => void;
}

export const VisorProtocolo: React.FC<VisorProtocoloProps> = ({
  protocolo,
  onVolver,
  onCrearProtocolo,
  onEditarProtocolo,
  onEditarDiagnostico
}) => {
  const protocoloAsociado = protocolo?.protocolo;
  const imagenesDiagnostico = protocolo?.imagenes ?? (protocolo?.imagen ? [protocolo.imagen] : []);

  return (
    <section className="protocol-info-">
      <div className="visor-acciones">
        <button className="btn" onClick={onVolver}>
          ⬅ Volver al inicio
        </button>

        <details className="editar-menu">
          <summary>Editar</summary>
          <div className="editar-menu-opciones">
            {protocoloAsociado && (
              <button className="btn" onClick={onEditarProtocolo}>
                Editar protocolo
              </button>
            )}
            <button className="btn" onClick={onEditarDiagnostico}>
              Editar diagnóstico
            </button>
          </div>
        </details>
      </div>

      <details className="diagnostico-detalle">
        <summary>Ver detalle del diagnóstico</summary>
        <div className="diagnostico-detalle-contenido">
          <div className="contenido-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{protocolo?.desc || 'Detalle del diagnóstico no disponible'}</ReactMarkdown>
          </div>
          
          {imagenesDiagnostico.length > 0 && (
            <div className="diagnostico-imagenes">
              {imagenesDiagnostico.map((imagen: string, indice: number) => (
                <img key={`${imagen}-${indice}`} src={imagen} alt={`Imagen del diagnóstico ${protocolo?.titulo}`} />
              ))}
            </div>
          )}
        </div>
      </details>

      <div className="protocol-texto" >
        {protocoloAsociado ? (
          <>
            <h2>Protocolo de actuación: {protocolo?.titulo}</h2>
            <h3>{protocoloAsociado.subtitulo || 'Subtítulo no disponible'}</h3>

            <div className="contenido-markdown" style={{ marginTop: '1rem' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{protocoloAsociado.desc || 'Contenido del protocolo no disponible'}</ReactMarkdown>
            </div>
          </>
        ) : (
          <>
            <h2>{protocolo?.titulo}</h2>
            <p className="sin-protocolo-mensaje">Aún no se asoció un protocolo a este diagnóstico</p>
            <button className="btn-guardar" onClick={onCrearProtocolo}>
              Crear protocolo
            </button>
          </>
        )}
      </div>


      <div className="protocol-multi" >
        <h3>Imagenes o cuadros van aca con un subtitulo</h3>
      </div>
    </section>
  );
};
