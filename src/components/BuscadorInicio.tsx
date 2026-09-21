import React, { useState } from 'react';

interface BuscadorInicioProps {
  tarjetas: any[];
  onCardClick: (tarjeta: any) => void;
}

export const BuscadorInicio: React.FC<BuscadorInicioProps> = ({ tarjetas, onCardClick }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  return (
    <>
      <section className="search-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar diagnóstico o protocolo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar protocolos por diagnóstico"
          />
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </section>

      <section className="action-section">
        {tarjetas.map((tarjeta) => (
          <button 
            key={tarjeta.id}
            className="protocol-card" 
            onClick={() => onCardClick(tarjeta)}
            aria-label="Ir a la pantalla de protocolos"
            style={{ marginBottom: '1rem' }}
          >
            <div className="card-text">
              <h2>{tarjeta.titulo}</h2>
              <p>{tarjeta.subtitulo}</p>
            </div>
            <div className="card-arrow">➔</div>
          </button>
        ))}
      </section>
    </>
  );
};