import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { API_URL } from '../config/api';

interface FormularioCreacionProps {
  tipoInicial: 'protocolo' | 'diagnostico';
  modoEdicion?: boolean;
  datosIniciales?: any;
  onVolver: () => void;
}

interface DiagnosticoOption {
  id: string | number;
  titulo: string;
}

interface EspecialidadOption {
  id: string;
  nombre: string;
}

export const FormularioCreacion: React.FC<FormularioCreacionProps> = ({tipoInicial, modoEdicion = false, datosIniciales, onVolver}) => {
  const [tipoAgregar, setTipoAgregar] = useState<string>(tipoInicial);
  const [inputTitulo, setInputTitulo] = useState('');
  const [inputSubtitulo, setInputSubtitulo] = useState('');
  const [diagnosticoId, setDiagnosticoId] = useState('');
  const [inputEtiquetas, setInputEtiquetas] = useState('');
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoOption[]>([]);
  const [eliminando, setEliminando] = useState(false);
  const [especialidadesDB, setEspecialidadesDB] = useState<EspecialidadOption[]>([]);
  const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] = useState<EspecialidadOption[]>([]);
  const [busquedaEsp, setBusquedaEsp] = useState('');
  const [mostrarListaEsp, setMostrarListaEsp] = useState(false);

  const editorRef = useRef<Editor>(null);

  useEffect(() => {
    setTipoAgregar(tipoInicial);
    setInputTitulo(datosIniciales?.titulo ?? datosIniciales?.diagnosticoTitulo ?? '');
    setInputSubtitulo(datosIniciales?.subtitulo ?? '');
    setDiagnosticoId(String(datosIniciales?.id_diagnostico ?? ''));
    setInputEtiquetas(datosIniciales?.etiquetas ? datosIniciales.etiquetas.join(', ') : '');
    
    if (datosIniciales?.especialidades) {
      setEspecialidadesSeleccionadas(datosIniciales.especialidades);
    }
  }, [tipoInicial, datosIniciales]);

  // Si el formulario es para cargar Protocolo, se van a buscar los diagnósticos disponibles para el desplegable de opciones
    useEffect(() => {
      if (tipoInicial !== 'protocolo') return;
      fetch(`${API_URL}/diagnosticos`) 
        .then((response) => response.ok ? response.json() : Promise.reject(response.status))
        .then((data: DiagnosticoOption[]) => setDiagnosticos(data))
        .catch((error) => console.error('Error al cargar diagnósticos:', error));
    }, [tipoInicial]);

    useEffect(() => {
    fetch(`${API_URL}/especialidades`)
      .then((response) => response.ok ? response.json() : Promise.reject(response.status))
      .then((data: EspecialidadOption[]) => setEspecialidadesDB(data))
      .catch((error) => console.error('Error al cargar especialidades:', error));
  }, []);

  const opcionesEspecialidadesFiltradas = especialidadesDB.filter(esp => 
    esp.nombre.toLowerCase().includes(busquedaEsp.toLowerCase()) && 
    !especialidadesSeleccionadas.some(seleccionada => seleccionada.id === esp.id)
  );

  const handleSeleccionarEspecialidad = (esp: EspecialidadOption) => {
    setEspecialidadesSeleccionadas([...especialidadesSeleccionadas, esp]);
    setBusquedaEsp('');
    setMostrarListaEsp(false);
  };

  const handleQuitarEspecialidad = (idQuitar: string) => {
    setEspecialidadesSeleccionadas(especialidadesSeleccionadas.filter(esp => esp.id !== idQuitar));
  };

  //Función para eliminar protocolos o diagnósticos
  const handleEliminar = async () => {
    const id = datosIniciales?.id;
    if (!modoEdicion || !id) {
      console.error('No se puede eliminar el recurso: falta el identificador');
      return;
    }

    //El endpoint se define según el valor de tipoAgregar (si es diagnóstico o si es protocolo)
    const recurso = tipoAgregar === 'diagnostico' ? 'diagnosticos' : 'protocolos';
    const nombreRecurso = tipoAgregar === 'diagnostico' ? 'diagnóstico' : 'protocolo';

    //Mensaje de alerta antes de eliminar (no se puede deshacer)
    if (!window.confirm(`¿Está seguro de que desea eliminar este ${nombreRecurso}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setEliminando(true);
    try {
      const response = await fetch(`${API_URL}/${recurso}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(errorResponse?.message || `Falló la eliminación (${response.status})`);
      }

      onVolver();
    } catch (error) {
      console.error(`Error al eliminar el ${nombreRecurso}:`, error);
      window.alert(error instanceof Error ? error.message : `No se pudo eliminar el ${nombreRecurso}.`);
    } finally {
      setEliminando(false);
    }
  };

  
  //Función para guardar protocolos o diagnósticos:
  const handleGuardarSubmit = async () => {
    try {
      const markdownGenerado = editorRef.current?.getInstance().getMarkdown() || '';

      //El endpoint se define según el valor de tipoAgregar (si es diagnóstico o si es protocolo)
      const recurso = tipoAgregar === 'diagnostico' ? 'diagnosticos' : 'protocolos';

      //Si se está en modo edición, el endpoint se configurará con el id del recurso seleccionado
      const id = modoEdicion ? `/${datosIniciales?.id}` : '';
      
      const endpoint = `${API_URL}/${recurso}${id}`;

      const etiquetasArray = inputEtiquetas
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      const bodyData = tipoAgregar === 'diagnostico'
        ? { titulo: inputTitulo, desc: markdownGenerado, etiquetas: etiquetasArray, especialidades: especialidadesSeleccionadas.map(esp => esp.id) }
        : { subtitulo: inputSubtitulo, desc: markdownGenerado, id_diagnostico: diagnosticoId };

      const response = await fetch(endpoint, {
        method: modoEdicion ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        setInputTitulo('');
        setInputSubtitulo('');
        setDiagnosticoId('');
        setEspecialidadesSeleccionadas([]);
        editorRef.current?.getInstance().setMarkdown('');

        if (!modoEdicion && tipoAgregar === 'diagnostico') {
          setTipoAgregar('diagnostico_exito');
        } else {
          onVolver();
        }
      } else {
        console.error("Error al guardar en la base de datos");
      }
    } catch (error) {
      console.error("Error de conexión con el backend:", error);
    }
  };

  return (
    <section className="protocol-form-section">
      {tipoAgregar !== 'diagnostico_exito' && (
        <button className="btn" onClick={onVolver}>⬅ Cancelar y volver</button>
      )}
      
      {tipoAgregar === 'diagnostico_exito' ? (
        <div className="form-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h2 className="form-title">¡Diagnóstico guardado con éxito!</h2>
          <p style={{ color: 'var(--gris)', marginBottom: '1rem' }}>¿Desea redactar y asociar un protocolo a este diagnóstico ahora mismo?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <button className="btn-guardar" style={{ width: '100%', maxWidth: '300px' }} onClick={() => setTipoAgregar('protocolo')}>
              Sí, agregar protocolo
            </button>
            <button className="btn" style={{ width: '100%', maxWidth: '300px'}} onClick={onVolver}>
              No, volver al inicio
            </button>
          </div>
        </div>

      ) : (
        <div className="form-container">
          <h2 className="form-title">{modoEdicion ? 'Editar' : 'Nuevo'} {tipoAgregar === 'diagnostico' ? 'Diagnóstico' : 'Protocolo'}</h2>

          {tipoAgregar === 'protocolo' && (
            <div className="input-group">
              <label>Asociar a Diagnóstico Existente</label>
              <select 
                className="form-select"
                value={diagnosticoId}
                onChange={(e) => setDiagnosticoId(e.target.value)}
              >
                <option value="">Seleccione un diagnóstico...</option>
                {diagnosticos.map((diagnostico) => (
                  <option key={diagnostico.id} value={diagnostico.id}>
                    {diagnostico.titulo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tipoAgregar === 'diagnostico' ? (
            <>
            <div className="input-group">
              <label>Título</label>
              <input type="text" placeholder="Ej: Crisis Asmática..." className="form-input" value={inputTitulo} onChange={(e) => setInputTitulo(e.target.value)} />
            </div>
            <div className="input-group multi-select-group" style={{ position: 'relative' }}>
                <label>Vincular Especialidades</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Buscar especialidad para asociar..."
                  value={busquedaEsp}
                  onChange={e => {
                    setBusquedaEsp(e.target.value);
                    setMostrarListaEsp(true);
                  }}
                  onFocus={() => setMostrarListaEsp(true)}
                  onBlur={() => setTimeout(() => setMostrarListaEsp(false), 200)} 
                />
                
                {mostrarListaEsp && opcionesEspecialidadesFiltradas.length > 0 && (
                  <ul className="dropdown-opciones">
                    {opcionesEspecialidadesFiltradas.map(esp => (
                      <li key={esp.id} className="dropdown-item" onClick={() => handleSeleccionarEspecialidad(esp)}>
                        {esp.nombre}
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="tags-display">
                  {especialidadesSeleccionadas.map(esp => (
                    <span key={esp.id} className="tag-item">
                      {esp.nombre}
                      <button type="button" onClick={() => handleQuitarEspecialidad(esp.id)} className="tag-close">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="input-group">
              <label>Subtítulo</label>
              <input type="text" placeholder="Ej: Pasos a seguir en urgencias..." className="form-input" value={inputSubtitulo} onChange={(e) => setInputSubtitulo(e.target.value)} />
            </div>
          )}

          <div className="input-group">
            <label>Info</label>
            <div className="editor-wrapper">
              <Editor
                ref={editorRef}
                initialValue={datosIniciales?.desc ?? ''}
                previewStyle="vertical"
                height="350px" 
                initialEditType="wysiwyg"
                hideModeSwitch={true} 
                useCommandShortcut={true}
                toolbarItems={[
                  ['heading', 'bold', 'italic'],
                  ['hr', 'quote'],
                  ['ul', 'ol'],
                  ['table']
                ]}
                />
                </div>
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
                value={inputEtiquetas} 
                onChange={(e) => setInputEtiquetas(e.target.value)} 
              />
            </div>
          )}

          <div className="form-actions">
            <button className="btn-guardar" onClick={handleGuardarSubmit} disabled={eliminando}>
              {modoEdicion ? 'Guardar cambios' : `Guardar ${tipoAgregar === 'diagnostico' ? 'Diagnóstico' : 'Protocolo'}`}
            </button>
            {modoEdicion && (
              <button
                className="btn-eliminar"
                type="button"
                onClick={() => void handleEliminar()}
                disabled={eliminando}
              >
                {eliminando ? 'Eliminando...' : `Eliminar ${tipoAgregar === 'diagnostico' ? 'diagnóstico' : 'protocolo'}`}
              </button>
            )}
          </div>
        </div>
      
      )}
    </section>
  );
};
