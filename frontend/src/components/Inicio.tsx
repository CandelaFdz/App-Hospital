import React, { useState } from 'react';
import '../css/styles.css';
import logoApp from '../assets/icon.jpeg';

interface InicioProps {
  onNavigateToProtocols?: () => void;
}

export const Inicio: React.FC<InicioProps> = ({ onNavigateToProtocols }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  
  const [mostrarProtocolo, setMostrarProtocolo] = useState<boolean>(false);
  const [modoAgregar, setModoAgregar] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [tipoAgregar, setTipoAgregar] = useState<'protocolo' | 'diagnostico' | 'especialidad' | 'usuario'>('protocolo');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

 const handleCardClick = () => {
    setMostrarProtocolo(true);
    if (onNavigateToProtocols) onNavigateToProtocols();
  };

  const handleAbrirAgregarProtocolo = () => {
    setTipoAgregar('protocolo');
    setModoAgregar(true);
    setMostrarProtocolo(false);
    setIsMenuOpen(false);
  };

  const handleAbrirAgregarDiagnostico = () => {
    setTipoAgregar('diagnostico');
    setModoAgregar(true);
    setMostrarProtocolo(false);
    setIsMenuOpen(false);
  };

  const handleAbrirAgregarEspecialidad = () => {
    setTipoAgregar('especialidad');
    setModoAgregar(true);
    setMostrarProtocolo(false);
    setIsMenuOpen(false);
  };

  const handleAbrirAgregarUsuario = () => {
    setTipoAgregar('usuario');
    setModoAgregar(true);
    setMostrarProtocolo(false);
    setIsMenuOpen(false);
  };

  const handleVolver = () => {
    setMostrarProtocolo(false);
    setModoAgregar(false);
  };

  return (
    <div className="app-wrapper">
      
      <header className="app-header">
        <div className="logo">
          <img src={logoApp} alt="Logo de la aplicación" />
        </div>
      </header>

      <main className={`main-content ${(mostrarProtocolo || modoAgregar) ? 'modo-lectura' : ''}`}>
        
        {modoAgregar ? (
         <section className="protocol-form-section">
            <button className="btn" onClick={handleVolver}>
              ⬅ Volver al inicio
            </button>
            {(tipoAgregar === 'protocolo' || tipoAgregar === 'diagnostico') ? (
            <div className="form-container">
              <h2 className="form-title">Nuevo {tipoAgregar === 'diagnostico' ? 'Diagnóstico' : 'Protocolo'}
              </h2>
              
              <div className="input-group">
                <label>Título</label>
                <input type="text" placeholder="Ej: Manejo de Crisis Asmática..." className="form-input" />
              </div>

              <div className="input-group">
                <label>Subtítulo</label>
                <input type="text" placeholder="Ej: Pasos a seguir en urgencias..." className="form-input" />
              </div>

              <div className="input-group">
                <label>Info</label>
                <textarea rows={6} placeholder="Escribe el paso a paso aquí..." className="form-input form-textarea"></textarea>
              </div>

              <div className="input-group">
                <label>Agregar Imagen</label>
                <input type="file" accept="image/*" className="form-file-input" />
              </div>
              
              {tipoAgregar === 'diagnostico' && (
                  <div className="input-group">
                    <label>Etiquetas (Separadas por coma)</label>
                    <input 
                      type="text" 
                      placeholder="Ej: asma, ACV, EVC, TVP" 
                      className="form-input" 
                    />
                  </div>
                )}

              <button className="btn-guardar">Guardar {tipoAgregar === 'diagnostico' ? 'Diagnóstico' : 'Protocolo'}</button>
            </div>
            ) : (
              <div className="form-container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <h2 className="form-title" style={{ border: 'none', backgroundColor: 'transparent' }}>
                  {tipoAgregar === 'especialidad' ? 'Gestión de Especialidades' : 'Gestión de Usuarios'}
                </h2>
                <p style={{ color: 'var(--gris)' }}>
                  Interfaz en construcción. Próximamente disponible.
                </p>
              </div>
            )}
          </section>

        ) : mostrarProtocolo ? (
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

        ) : (
          <>
            <section className="search-section">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar diagnóstico o protocolo..."
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
          
          
        )}
      </main>
      <div className="fab-container">
        {isMenuOpen && (
          <div className="fab-menu">
            <button className="fab-item" onClick={handleAbrirAgregarProtocolo}>Agregar protocolo</button>
            <button className="fab-item" onClick={handleAbrirAgregarDiagnostico}>Agregar diagnostico</button>
            <button className="fab-item" onClick={handleAbrirAgregarEspecialidad}>Agregar especialidad</button>
            <button className="fab-item" onClick={handleAbrirAgregarUsuario}>Gestion de usuario</button>
          </div>
        )}
        <button 
          className={`fab-button ${isMenuOpen ? 'open' : ''}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menú de opciones"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Inicio;