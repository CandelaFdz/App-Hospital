import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

interface GestionEspecialidadesProps {
  onVolver: () => void; 
}

interface EspecialidadDb {
  id: string;
  nombre: string;
}

export const GestionEspecialidades: React.FC<GestionEspecialidadesProps> = ({ onVolver }) => {
  const [vistaLocal, setVistaLocal] = useState<'lista' | 'formulario'>('lista');
  const [busqueda, setBusqueda] = useState('');
  
  // Datos del formulario
  const [nombre, setNombre] = useState('');
  const [idEditando, setIdEditando] = useState<string | null>(null); // Guardamos el ID si estamos editando
  const [protocolosVinculados, setProtocolosVinculados] = useState<string[]>([]);
  
  // Buscador de protocolos
  const [busquedaProt, setBusquedaProt] = useState('');
  const [mostrarListaProt, setMostrarListaProt] = useState(false);
  
  // Datos de la base de datos
  const [especialidadesDb, setEspecialidadesDb] = useState<EspecialidadDb[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarEspecialidades = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/especialidades`);
      if (response.ok) {
        const data = await response.json();
        setEspecialidadesDb(data);
      }
    } catch (error) {
      console.error("Error de conexión al cargar especialidades:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEspecialidades();
  }, []);

  const opcionesProtocolos = ['Crisis Asmática', 'ACV Isquémico', 'Infarto Agudo de Miocardio', 'Trauma de Cráneo', 'Sepsis'];

  const opcionesFiltradas = opcionesProtocolos.filter(prot => 
    prot.toLowerCase().includes(busquedaProt.toLowerCase()) && !protocolosVinculados.includes(prot)
  );

  const especialidadesFiltradas = especialidadesDb.filter(esp => 
    esp.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSeleccionarProtocolo = (seleccion: string) => {
    setProtocolosVinculados([...protocolosVinculados, seleccion]);
    setBusquedaProt('');
    setMostrarListaProt(false);
  };

  const handleQuitarProtocolo = (protQuitar: string) => {
    setProtocolosVinculados(protocolosVinculados.filter(prot => prot !== protQuitar));
  };

  
  const handleAbrirNuevo = () => {
    setIdEditando(null);
    setNombre('');
    setProtocolosVinculados([]);
    setVistaLocal('formulario');
  };

 
  const handleAbrirEdicion = (esp: EspecialidadDb) => {
    setIdEditando(esp.id);
    setNombre(esp.nombre);
    setProtocolosVinculados([]); 
    setVistaLocal('formulario');
  };

  // Guardar (POST) o Actualizar (PATCH) dependiendo si tenemos idEditando
  const handleGuardarEspecialidad = async () => {
    if (nombre.trim() === '') {
      alert("Error: El nombre de la especialidad es obligatorio.");
      return;
    }

    try {
      const isEdicion = idEditando !== null;
      const url = isEdicion 
        ? `${API_URL}/especialidades/${idEditando}` 
        : `${API_URL}/especialidades`;
      
      const response = await fetch(url, {
        method: isEdicion ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });

      if (response.ok) {
        alert(isEdicion ? "Especialidad actualizada con éxito." : "Especialidad guardada con éxito.");
        setNombre('');
        setIdEditando(null);
        setProtocolosVinculados([]);
        setVistaLocal('lista');
        cargarEspecialidades(); 
      } else {
        const errorData = await response.json();
        alert(`Error al guardar: ${errorData.message || 'Error en el servidor'}`);
      }
    } catch (error) {
      alert("Error de conexión con el backend.");
    }
  };

  // Mover el botón eliminar dentro del formulario
  const handleEliminarEspecialidad = async () => {
    if (!idEditando) return;
    
    if (!window.confirm(`¿Seguro que deseas eliminar la especialidad "${nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/especialidades/${idEditando}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert("Especialidad eliminada correctamente.");
        setNombre('');
        setIdEditando(null);
        setVistaLocal('lista');
        cargarEspecialidades();
      } else {
        alert("No se pudo eliminar. Es posible que tenga diagnósticos vinculados.");
      }
    } catch (error) {
      alert("Error de conexión al intentar eliminar.");
    }
  };

  // icono de Papelera 
  const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0' }}>
              {cargando ? (
                <p style={{ textAlign: 'center', color: 'var(--gris)' }}>Cargando...</p>
              ) : especialidadesFiltradas.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--gris)' }}>No se encontraron especialidades.</p>
              ) : (
                especialidadesFiltradas.map((esp) => (
                  <div 
                    key={esp.id} 
                    className="usuario-card"
                    onClick={() => handleAbrirEdicion(esp)}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span style={{ fontWeight: 'bold', color: 'var(--texto-oscuro)' }}>{esp.nombre}</span>
                    <span style={{ color: 'var(--gris)', fontSize: '0.85rem' }}>Editar ➔</span>
                  </div>
                ))
              )}
            </div>

            <button className="btn-guardar" onClick={handleAbrirNuevo} style={{ marginTop: '1rem' }}>
              + Crear Nueva Especialidad
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="titulo-en-linea">
            <button className="btn" onClick={() => setVistaLocal('lista')}>⬅</button>
            <h2 className="form-title">{idEditando ? 'Editar Especialidad' : 'Nueva Especialidad'}</h2>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn-guardar" onClick={handleGuardarEspecialidad}>
                {idEditando ? 'Guardar Cambios' : 'Crear Especialidad'}
              </button>

              {idEditando && (
                <button 
                className="btn-eliminar"
                type="button"
                onClick={handleEliminarEspecialidad} 
                >
                  <TrashIcon /> Eliminar Especialidad
                </button>
              )}
            </div>

          </div>
        </>
      )}
    </section>
  );
};