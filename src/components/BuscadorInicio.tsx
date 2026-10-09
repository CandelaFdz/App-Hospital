import React, { useState } from 'react';
import type { DiagnosticoConProtocolo } from '../db/types';

interface BuscadorInicioProps {
  tarjetas: DiagnosticoConProtocolo[];
  onCardClick: (tarjeta: DiagnosticoConProtocolo) => void;
}

export const BuscadorInicio: React.FC<BuscadorInicioProps> = ({ tarjetas, onCardClick }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const tarjetasFiltradas = tarjetas.filter((tarjeta) => {
  const term = searchTerm.trim().toLowerCase();
    const coincideTitulo = tarjeta.titulo.toLowerCase().includes(term);
    const coincideSubtitulo = tarjeta.protocolo?.subtitulo?.toLowerCase().includes(term);
    const coincideEtiqueta = Array.isArray(tarjeta.etiquetas) && tarjeta.etiquetas.some(
      (etiqueta) => etiqueta.toLowerCase().includes(term)
    );
    return coincideTitulo || coincideSubtitulo || coincideEtiqueta;
  });

  return (
    <>
      <section className="search-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar diagnósticos"
            style={{ marginTop: '-1rem' }}
          />
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </section>

      <section className="action-section">
        {tarjetasFiltradas.map((tarjeta) => (
          <button
            key={tarjeta.id}
            className="protocol-card"
            onClick={() => onCardClick(tarjeta)}
            aria-label="Ir a la pantalla de protocolos"
            style={{ marginBottom: '1rem' }}
          >
            <div className="card-text">
              <h2>{tarjeta.titulo}</h2>
              <p>{tarjeta.protocolo?.subtitulo || ''}</p>
              {Array.isArray(tarjeta.etiquetas) && tarjeta.etiquetas.length > 0 && (
                <div className="tags-display" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                  {tarjeta.etiquetas.map((tag, i) => (
                    <span key={i} className="tag-item" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="card-arrow">➔</div>
          </button>
        ))}
      </section>
    </>
  );
};