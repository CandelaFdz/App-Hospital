import React, { useState } from 'react';
import '../css/styles.css';
import logoApp from '../assets/icon.jpeg';

interface InicioProps {
  onNavigateToProtocols?: () => void;
}

export const Inicio: React.FC<InicioProps> = ({ onNavigateToProtocols }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // 1. Creamos el interruptor para cambiar de entorno
  const [mostrarProtocolo, setMostrarProtocolo] = useState<boolean>(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

 const handleCardClick = () => {
    setMostrarProtocolo(true);
    if (onNavigateToProtocols) onNavigateToProtocols();
  };
  return (
    <div className="app-wrapper">
      
      <header className="app-header">
        <div className="logo">
          <img src={logoApp} alt="Logo de la aplicación" />
        </div>
      </header>

      <main className="main-content">
        
        {!mostrarProtocolo ? (
          <>
            <section className="search-section">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar diagnóstico o síntoma..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Buscar protocolos por diagnóstico"
                />
                
                <svg 
                  className="search-icon" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </section>

            <section className="action-section">
              <button 
                className="protocol-card" 
                onClick={handleCardClick}
                aria-label="Ir a la pantalla de protocolos"
              >
                <div className="card-text">
                  <h2>PROTOCOLO DEL MANEJO DE CRISIS ASMATICA  EN LA URGENCIA </h2>
                  <p>subtitulo o breve descripción del protocolo</p>
                </div>
                <div className="card-arrow">➔</div>
              </button>
            </section>
          </>
        ) : (
          
          <section className="protocol-info-">
            <button className="btn"
                onClick={() => setMostrarProtocolo(false)}>
                ⬅ Volver al inicio
              </button>

            <div className="protocol-texto" >
              <h2>PROTOCOLO DEL MANEJO DE CRISIS ASMATICA  EN LA URGENCIA </h2>
              <h3>Subtitulo ejemplo</h3>
              <p>La crisis asmática o reagudización del asma  es un episodio agudo o subagudo que se caracteriza por el aumento progresivo de la dificultad para respirar con disnea, tos, opresión torácica mayor a la habitual , sibilancias y disminución del flujo espiratorio. Puede variar desde episodios leves hasta otros muy graves o fatales que pueden llevarlo a la muerte, para ellos debemos clasificarlo.Los síntomas dependen de cómo los diversos desencadenantes, como los alergenos, la polución ambiental y/o laboral, las infecciones del tracto respiratorio (sobre todo las virales), los cambios climáticos, el estrés emocional, el consumo de drogas y otros, actúan sobre la vía aérea poniendo en marcha los mecanismos inflamatorios y la broncoconstricción, lo que da como resultado la obstrucción de la vía aérea. Durante la crisis asmática no sólo se observa broncoconstricción, sino que se destacan la inflamación, el edema de la mucosa y el aumento de la producción de secreciones. Estos mecanismos generan aumento de la resistencia y del trabajo respiratorio, ineficiencia del intercambio gaseoso y fatiga muscular, lo que puede causar insuficiencia respiratoria</p>
            </div>
            <div className="protocol-multi" >
              <h3>Imagenes o cuadros van aca con un subtitulo</h3>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Inicio;