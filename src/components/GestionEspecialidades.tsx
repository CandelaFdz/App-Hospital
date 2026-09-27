import React, { useState } from 'react';

interface GestionEspecialidadesProps {
  onVolver: () => void; 
}

export const GestionEspecialidades: React.FC<GestionEspecialidadesProps> = ({ onVolver }) => {
  const [vistaLocal, setVistaLocal] = useState<'lista' | 'formulario'>('lista');
  const [busqueda, setBusqueda] = useState('');
  const [nombre, setNombre] = useState('');
  const [protocolosVinculados, setProtocolosVinculados] = useState<string[]>([]);
  const [busquedaProt, setBusquedaProt] = useState('');
  const [mostrarListaProt, setMostrarListaProt] = useState(false);

  // opciones simuladas 
  const opcionesProtocolos = ['Crisis Asmática', 'ACV Isquémico', 'Infarto Agudo de Miocardio', 'Trauma de Cráneo', 'Sepsis'];

  const opcionesFiltradas = opcionesProtocolos.filter(prot => 
    prot.toLowerCase().includes(busquedaProt.toLowerCase()) && !protocolosVinculados.includes(prot)
  );

  const handleSeleccionarProtocolo = (seleccion: string) => {
    setProtocolosVinculados([...protocolosVinculados, seleccion]);
    setBusquedaProt('');
    setMostrarListaProt(false);
  };

  const handleQuitarProtocolo = (protQuitar: string) => {
    setProtocolosVinculados(protocolosVinculados.filter(prot => prot !== protQuitar));
  };

  const handleGuardarEspecialidad = () => {
    if (nombre.trim() === '') {
      alert("Error: El nombre de la especialidad es obligatorio.");
      return;
    }

    const nuevaEspecialidad = {
      nombre,
      protocolos: protocolosVinculados 
    };
    
    console.log("Enviando al backend:", nuevaEspecialidad);
    alert("Especialidad guardada con éxito.");
    
    setNombre('');
    setProtocolosVinculados([]);
    setVistaLocal('lista');
  };

  return (
    <section className="protocol-form-section">
      {vistaLocal === 'lista' ? (
        <>
          <div className="titulo-en-linea">
            <button className="btn" onClick={onVolver} aria-label="Volver atrás">⬅</button>
            <h2 className="form-title">Especialidades</h2>
          </div>

          <div className="form-container">
            <div className="search-input-wrapper" style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar especialidad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--gris)' }}>
              <p>La lista de especialidades aparecerá aquí.</p>
            </div>

            <button className="btn-guardar" onClick={() => setVistaLocal('formulario')} style={{ marginTop: '1rem' }}>
              + Crear Nueva Especialidad
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="titulo-en-linea">
            <button className="btn" onClick={() => setVistaLocal('lista')}>⬅</button>
            <h2 className="form-title">Nueva Especialidad</h2>
          </div>
          
          <div className="form-container">
            <div className="input-group">
              <label>Nombre de la Especialidad</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ej: Cardiología, Pediatría..." 
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
              />
            </div>

            <div className="input-group multi-select-group" style={{ position: 'relative' }}>
              <label>Vincular Protocolos (Opcional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Buscar protocolo para asociar..."
                value={busquedaProt}
                onChange={e => {
                  setBusquedaProt(e.target.value);
                  setMostrarListaProt(true);
                }}
                onFocus={() => setMostrarListaProt(true)}
                onBlur={() => setTimeout(() => setMostrarListaProt(false), 200)} 
              />
              
              {mostrarListaProt && opcionesFiltradas.length > 0 && (
                <ul className="dropdown-opciones">
                  {opcionesFiltradas.map(prot => (
                    <li key={prot} className="dropdown-item" onClick={() => handleSeleccionarProtocolo(prot)}>
                      {prot}
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="tags-display">
                {protocolosVinculados.map(prot => (
                  <span key={prot} className="tag-item">
                    {prot}
                    <button type="button" onClick={() => handleQuitarProtocolo(prot)} className="tag-close">✕</button>
                  </span>
                ))}
              </div>
            </div>

            <button className="btn-guardar" onClick={handleGuardarEspecialidad}>
              Guardar Especialidad
            </button>
          </div>
        </>
      )}
    </section>
  );
};