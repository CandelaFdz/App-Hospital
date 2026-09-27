import React, { useEffect, useState } from 'react';

interface Diagnostico {
  id: number;
  titulo: string;
}

interface FormularioCreacionProps {
  tipoInicial: 'protocolo' | 'diagnostico' | 'especialidad' | 'usuario';
  modoEdicion?: boolean;
  datosIniciales?: any;
  onVolver: () => void;
}

export const FormularioCreacion: React.FC<FormularioCreacionProps> = ({
  tipoInicial,
  modoEdicion = false,
  datosIniciales,
  onVolver
}) => {
  const [tipoAgregar, setTipoAgregar] = useState<string>(tipoInicial);

  // Estados para capturar los datos reales que irán al backend
  const [inputTitulo, setInputTitulo] = useState(datosIniciales?.titulo ?? '');
  const [inputSubtitulo, setInputSubtitulo] = useState(datosIniciales?.subtitulo ?? '');
  const [inputDesc, setInputDesc] = useState(datosIniciales?.desc ?? '');
  const [diagnosticoId, setDiagnosticoId] = useState(
    datosIniciales?.id_diagnostico ? String(datosIniciales.id_diagnostico) : ''
  );
  const [diagnosticoBusqueda, setDiagnosticoBusqueda] = useState(datosIniciales?.diagnosticoTitulo ?? '');
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);

  useEffect(() => {
    if (tipoAgregar !== 'protocolo') return;

    const cargarDiagnosticos = async () => {
      try {
        const response = await fetch('http://localhost:3000/diagnosticos');
        if (!response.ok) throw new Error('No se pudieron cargar los diagnósticos');

        setDiagnosticos(await response.json());
      } catch (error) {
        console.error('Error al cargar los diagnósticos:', error);
      }
    };

    cargarDiagnosticos();
  }, [tipoAgregar]);

  const handleGuardarSubmit = async () => {
    if (tipoAgregar === 'protocolo' && !diagnosticoId) {
      console.error('Debe seleccionar un diagnóstico para crear el protocolo');
      return;
    }

    try {
      const bodyData = tipoAgregar === 'diagnostico'
        ? {
            titulo: inputTitulo,
            desc: inputDesc
          }
        : {
            subtitulo: inputSubtitulo,
            desc: inputDesc,
            id_diagnostico: Number(diagnosticoId)
          };

      const recurso = tipoAgregar === 'diagnostico' ? 'diagnosticos' : 'protocolos';
      const endpoint = modoEdicion
        ? `http://localhost:3000/${recurso}/${datosIniciales.id}`
        : `http://localhost:3000/${recurso}`;
      const response = await fetch(endpoint, {
        method: modoEdicion ? 'PATCH' : 'POST',
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
        setDiagnosticoBusqueda('');

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

      ) : (tipoAgregar === 'protocolo' || tipoAgregar === 'diagnostico') ? (
        <div className="form-container">
          <h2 className="form-title">
            {modoEdicion ? 'Editar' : 'Nuevo'} {tipoAgregar === 'diagnostico' ? 'Diagnóstico' : 'Protocolo'}
          </h2>

          {tipoAgregar === 'protocolo' && (
            <div className="input-group">
              <label>Asociar a Diagnóstico Existente</label>
              <input
                type="text"
                className="form-input"
                list="diagnosticos-disponibles"
                placeholder="Escriba para buscar un diagnóstico..."
                value={diagnosticoBusqueda}
                onChange={(e) => {
                  const busqueda = e.target.value;
                  const diagnosticoSeleccionado = diagnosticos.find(
                    (diagnostico) => diagnostico.titulo === busqueda
                  );

                  setDiagnosticoBusqueda(busqueda);
                  setDiagnosticoId(diagnosticoSeleccionado ? String(diagnosticoSeleccionado.id) : '');
                }}
              />
              <datalist id="diagnosticos-disponibles">
                {diagnosticos.map((diagnostico) => (
                  <option key={diagnostico.id} value={diagnostico.titulo} />
                ))}
              </datalist>
            </div>
          )}

          {tipoAgregar === 'diagnostico' && (
            <div className="input-group">
              <label>Título</label>
              <input type="text" placeholder="Ej: Manejo de Crisis Asmática..." className="form-input" value={inputTitulo} onChange={(e) => setInputTitulo(e.target.value)} />
            </div>
          )}

          {tipoAgregar === 'protocolo' && (
            <div className="input-group">
              <label>Subtítulo</label>
              <input type="text" placeholder="Ej: Pasos a seguir en urgencias..." className="form-input" value={inputSubtitulo} onChange={(e) => setInputSubtitulo(e.target.value)} />
            </div>
          )}

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
            {modoEdicion ? 'Actualizar' : 'Guardar'} {tipoAgregar === 'diagnostico' ? 'Diagnóstico' : 'Protocolo'}
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