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

export const FormularioCreacion: React.FC<FormularioCreacionProps> = ({
  tipoInicial,
  modoEdicion = false,
  datosIniciales,
  onVolver
}) => {
  const [tipoAgregar, setTipoAgregar] = useState<string>(tipoInicial);
  const [inputTitulo, setInputTitulo] = useState('');
  const [inputSubtitulo, setInputSubtitulo] = useState('');
  const [diagnosticoId, setDiagnosticoId] = useState('');
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoOption[]>([]);

  const editorRef = useRef<Editor>(null);

  useEffect(() => {
    setTipoAgregar(tipoInicial);
    setInputTitulo(datosIniciales?.titulo ?? datosIniciales?.diagnosticoTitulo ?? '');
    setInputSubtitulo(datosIniciales?.subtitulo ?? '');
    setDiagnosticoId(String(datosIniciales?.id_diagnostico ?? ''));
  }, [tipoInicial, datosIniciales]);

  useEffect(() => {
    if (tipoInicial !== 'protocolo') return;
    fetch(`${API_URL}/diagnosticos`)
      .then((response) => response.ok ? response.json() : Promise.reject(response.status))
      .then((data: DiagnosticoOption[]) => setDiagnosticos(data))
      .catch((error) => console.error('Error al cargar diagnósticos:', error));
  }, [tipoInicial]);

  //La opción de guardar se comporta de forma distinta según el formulario esté en modo edición o no
  const handleGuardarSubmit = async () => {
    try {
      const markdownGenerado = editorRef.current?.getInstance().getMarkdown() || '';

      const recurso = tipoAgregar === 'diagnostico' ? 'diagnosticos' : 'protocolos';
      const id = modoEdicion ? `/${datosIniciales?.id}` : '';
      const endpoint = `${API_URL}/${recurso}${id}`;
      const bodyData = tipoAgregar === 'diagnostico'
        ? { titulo: inputTitulo, desc: markdownGenerado }
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
            <div className="input-group">
              <label>Título</label>
              <input type="text" placeholder="Ej: Crisis Asmática..." className="form-input" value={inputTitulo} onChange={(e) => setInputTitulo(e.target.value)} />
            </div>
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
              <input type="text" placeholder="Ej: asma, ACV, EVC, TVP" className="form-input" />
            </div>
          )}

          <button className="btn-guardar" onClick={handleGuardarSubmit}>
            {modoEdicion ? 'Guardar cambios' : `Guardar ${tipoAgregar === 'diagnostico' ? 'Diagnóstico' : 'Protocolo'}`}
          </button>
        </div>
      
      )}
    </section>
  );
};
