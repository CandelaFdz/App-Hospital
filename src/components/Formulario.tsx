import React, { useState } from 'react';

interface FormularioCreacionProps {
  tipoInicial: 'protocolo' | 'diagnostico' | 'especialidad' | 'usuario';
  onVolver: () => void;
}

export const FormularioCreacion: React.FC<FormularioCreacionProps> = ({ tipoInicial, onVolver }) => {
  const [tipoAgregar, setTipoAgregar] = useState<string>(tipoInicial);
  
  // Estados para capturar los datos reales que irán al backend
  const [inputTitulo, setInputTitulo] = useState('');
  const [inputSubtitulo, setInputSubtitulo] = useState('');
  const [inputDesc, setInputDesc] = useState('');
  const [diagnosticoId, setDiagnosticoId] = useState('');

  const handleGuardarSubmit = async () => {
    try {
      // 1. Definimos la ruta de NestJS
      const endpoint = tipoAgregar === 'diagnostico' 
        ? 'http://localhost:3000/diagnosticos' 
        : 'http://localhost:3000/protocolos';

      // 2. Estructuramos el DTO para el backend
      const bodyData = tipoAgregar === 'diagnostico'
        ? { 
            titulo: inputTitulo, 
            desc: inputDesc 
          }
        : { 
            titulo: inputTitulo, 
            subtitulo: inputSubtitulo, 
            desc: inputDesc,
            diagnosticoId: diagnosticoId ? parseInt(diagnosticoId) : undefined
          };

      // 3. Petición real por la red (visible en la pestaña Network)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        // Limpiamos los campos sin agregar mocks visuales
        setInputTitulo('');
        setInputSubtitulo('');
        setInputDesc('');
        setDiagnosticoId('');

        if (tipoAgregar === 'diagnostico') {
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

      ) : (tipoAgregar === 'protocolo' || tipoAgregar === 'diagnostico') ? (
        <div className="form-container">
          <h2 className="form-title">Nuevo {tipoAgregar === 'diagnostico' ? 'Diagnóstico' : 'Protocolo'}</h2>

          {tipoAgregar === 'protocolo' && (
            <div className="input-group">
              <label>Asociar a Diagnóstico Existente</label>
              <select 
                className="form-select"
                value={diagnosticoId}
                onChange={(e) => setDiagnosticoId(e.target.value)}
              >
                <option value="">Seleccione un diagnóstico...</option>
                <option value="1">Crisis Asmática</option>
                <option value="2">ACV Isquémico</option>
                <option value="3">Infarto Agudo de Miocardio</option>
              </select>
            </div>
          )}
          
          <div className="input-group">
            <label>Título</label>
            <input type="text" placeholder="Ej: Manejo de Crisis Asmática..." className="form-input" value={inputTitulo} onChange={(e) => setInputTitulo(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Subtítulo</label>
            <input type="text" placeholder="Ej: Pasos a seguir en urgencias..." className="form-input" value={inputSubtitulo} onChange={(e) => setInputSubtitulo(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Info</label>
            <textarea rows={6} placeholder="Escribe el paso a paso aquí..." className="form-input form-textarea" value={inputDesc} onChange={(e) => setInputDesc(e.target.value)}></textarea>
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
            Guardar {tipoAgregar === 'diagnostico' ? 'Diagnóstico' : 'Protocolo'}
          </button>
        </div>
      ) : (
        <div className="form-container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h2 className="form-title" style={{ border: 'none', backgroundColor: 'transparent' }}>
            {tipoAgregar === 'especialidad' ? 'Gestión de Especialidades' : 'Gestión de Usuarios'}
          </h2>
          <p style={{ color: 'var(--gris)' }}>Interfaz en construcción. Próximamente disponible.</p>
        </div>
      )}
    </section>
  );
};