import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { mostrarConfirmacion, mostrarToast } from './Alertas';

export interface DiagnosticoAsociado {
  id: string;
  titulo: string;
}

interface EspecialidadDb {
  id: string;
  nombre: string;
  diagnosticos?: DiagnosticoAsociado[];
}

interface GestionEspecialidadesProps {
  onVolver: () => void; 
  onEditarDiagnostico: (diagnostico: DiagnosticoAsociado) => void;
}

export const GestionEspecialidades: React.FC<GestionEspecialidadesProps> = ({ onVolver, onEditarDiagnostico }) => {
  const [vistaLocal, setVistaLocal] = useState<'lista' | 'formulario'>('lista');
  const [busqueda, setBusqueda] = useState('');
  const [nombre, setNombre] = useState('');
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [especialidadesDb, setEspecialidadesDb] = useState<EspecialidadDb[]>([]);
  const [diagnosticosVinculados, setDiagnosticosVinculados] = useState<DiagnosticoAsociado[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resEsp, resDiag] = await Promise.all([
        fetch(`${API_URL}/especialidades`),
        fetch(`${API_URL}/diagnosticos`)
      ]);
      
      let especialidades: EspecialidadDb[] = [];
      let diagnosticosTotales: any[] = [];

      if (resEsp.ok) especialidades = await resEsp.json();
      if (resDiag.ok) diagnosticosTotales = await resDiag.json();

      const especialidadesCompletas = especialidades.map(esp => {
        if (esp.diagnosticos) return esp; 
        
        const vinculados = diagnosticosTotales.filter(diag => 
          diag.especialidades?.some((e: any) => e.id === esp.id)
        );
        return { ...esp, diagnosticos: vinculados };
      });

      setEspecialidadesDb(especialidadesCompletas);
    } catch (error) {
      console.error("Error de conexión al cargar datos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const especialidadesFiltradas = especialidadesDb.filter(esp => 
    esp.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  
  const handleAbrirNuevo = () => {
    setIdEditando(null);
    setNombre('');
    setDiagnosticosVinculados([]);
    setVistaLocal('formulario');
  };

  const handleAbrirEdicion = (esp: EspecialidadDb) => {
    setIdEditando(esp.id);
    setNombre(esp.nombre);
    setDiagnosticosVinculados(esp.diagnosticos || []);
    setVistaLocal('formulario');
  };

  const handleGuardarEspecialidad = async () => {
    if (nombre.trim() === '') {
      mostrarToast("Error: El nombre de la especialidad es obligatorio.", "error");
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
        mostrarToast(isEdicion ? "Especialidad actualizada con éxito." : "Especialidad guardada con éxito.", "success");
        setNombre('');
        setIdEditando(null);
        setVistaLocal('lista');
        cargarDatos(); 
      } else {
        const errorData = await response.json();
        mostrarToast(`Error al guardar: ${errorData.message || 'Error en el servidor'}`, "error");
      }
    } catch (error) {
      mostrarToast("Error de conexión con el backend.", "error");
    }
  };

  const handleEliminarEspecialidad = async () => {
    if (!idEditando) return;
    
    if (diagnosticosVinculados.length > 0) {
      mostrarToast(`No puedes eliminar "${nombre}" porque tiene ${diagnosticosVinculados.length} diagnóstico(s) vinculados.`, 'error');
      return;
    }

   mostrarConfirmacion(
      'Eliminar Especialidad',
      `¿Seguro que deseas eliminar la especialidad "${nombre}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'warning'
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${API_URL}/especialidades/${idEditando}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            mostrarToast("Especialidad eliminada correctamente.", "success");
            setNombre('');
            setIdEditando(null);
            setVistaLocal('lista');
            cargarDatos();
          } else {
            mostrarToast("No se pudo eliminar por un error en el servidor.", "error");
          }
        } catch (error) {
          mostrarToast("Error de conexión al intentar eliminar.", "error");
        }
      }
    });
  };


  const handleDesasociarDiagnostico = (diag: DiagnosticoAsociado) => {
    mostrarConfirmacion(
      'Para desasociar este diagnóstico de la especialidad, debes editarlo.',
      `¿Deseas ir a editar el diagnóstico "${diag.titulo}" para desvincularlo de esta especialidad? Saldrás de esta pantalla.`,
      'Sí, ir a editar'
    ).then((result) => {
      if (result.isConfirmed) {
        onEditarDiagnostico(diag);
      }
    });
  };

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

            
            {idEditando && (
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label>Diagnósticos Asociados a esta Especialidad ({diagnosticosVinculados.length})</label>
                
                {diagnosticosVinculados.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: 'var(--gris)', margin: '0.5rem 0' }}>
                    No hay diagnósticos vinculados a esta especialidad todavía.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {diagnosticosVinculados.map((diag) => (
                      <div 
                        className="usuario-card"
                        key={diag.id} 
                      >
                        <span style={{ fontWeight: '600', color: 'var(--azul-profundo)', fontSize: '0.9rem' }}>
                          {diag.titulo}
                        </span>
                        
                        <button 
                          className="btn"
                          type="button"
                          onClick={() => handleDesasociarDiagnostico(diag)}
                          style={{ background: 'none', border: 'none', color: 'var(--celeste)', cursor: 'pointer', padding: 0 }}
                        >
                          Editar 
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn-guardar" onClick={handleGuardarEspecialidad}>
                {idEditando ? 'Guardar Cambios' : 'Crear Especialidad'}
              </button>

              {idEditando && (
                <button 
                  className="btn-eliminar"
                  type="button"
                  onClick={handleEliminarEspecialidad} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
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