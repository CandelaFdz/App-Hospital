import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { mostrarConfirmacion, mostrarToast } from './Alertas';

interface FormularioUsuarioProps {
  onVolver: () => void;
  modoEdicion?: boolean; 
  datosIniciales?: any; 
}

interface EspecialidadDb {
  id: string;
  nombre: string;
}

export const FormularioUsuario: React.FC<FormularioUsuarioProps> = ({ onVolver, modoEdicion, datosIniciales }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] = useState<EspecialidadDb[]>([]);
  const [especialidadesDb, setEspecialidadesDb] = useState<EspecialidadDb[]>([]);

  const [busquedaEsp, setBusquedaEsp] = useState('');
  const [mostrarLista, setMostrarLista] = useState(false);

  useEffect(() => {
    const cargarEspecialidades = async () => {
      try {
        const response = await fetch(`${API_URL}/especialidades`);
        if (response.ok) {
          const data = await response.json();
          setEspecialidadesDb(data);
        }
      } catch (error) {
        console.error("Error al cargar especialidades:", error);
      }
    };
    cargarEspecialidades();
  }, []);

  useEffect(() => {
    setNombre(datosIniciales?.nombre || '');
    setApellido(datosIniciales?.apellido || '');
    setUsername(datosIniciales?.username || '');
    setIsAdmin(datosIniciales?.is_admin || false);
    
    
    const especialidadesLimpia = (datosIniciales?.especialidades || [])
      .map((esp: any) => {
        if (esp && esp.especialidad) return esp.especialidad;
        return esp;
      })
      .filter((e: any) => typeof e === 'object' && e !== null && e.id !== undefined); 

    setEspecialidadesSeleccionadas(especialidadesLimpia);
    
    setPassword('');
    setConfirmPassword('');
  }, [datosIniciales]);
  
  const opcionesFiltradas = especialidadesDb.filter(esp => 
    esp.nombre.toLowerCase().includes(busquedaEsp.toLowerCase()) && 
    !especialidadesSeleccionadas.some(seleccionada => String(seleccionada.id) === String(esp.id))
  );

  const handleSeleccionarEspecialidad = (esp: EspecialidadDb) => {
    setEspecialidadesSeleccionadas([...especialidadesSeleccionadas, esp]);
    setBusquedaEsp(''); 
    setMostrarLista(false); 
  };

  const handleQuitarEspecialidad = (idQuitar: string) => {
    setEspecialidadesSeleccionadas(especialidadesSeleccionadas.filter(esp => String(esp.id) !== String(idQuitar)));
  };

  const handleGuardarUsuario = async () => {
    if (password !== confirmPassword) {
      mostrarToast("Las contraseñas no coinciden. Por favor, verifícalas.", "error");
      return;
    }

    if (!modoEdicion && password.trim() === '') {
      mostrarToast("Error: La contraseña es obligatoria para un nuevo usuario.", "error");
      return;
    }

    if (!username.trim()) {
      mostrarToast("Error: El nombre de usuario es obligatorio.", "error");
      return;
    }
    
    const idsEspecialidades = especialidadesSeleccionadas
      .filter(esp => esp && esp.id !== undefined) 
      .map(esp => String(esp.id));
    
    const datosUsuario: any = {
      username,
      nombre,
      apellido,
      is_admin: isAdmin,
      especialidades: idsEspecialidades
    };

    if (password.trim() !== '') {
      datosUsuario.password = password;
    }
    
    try {
      const url = modoEdicion ? `${API_URL}/usuarios/${datosIniciales.id}` : `${API_URL}/usuarios`;
      const method = modoEdicion ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosUsuario)
      });

      if (response.ok) {
        mostrarToast(modoEdicion ? "¡Usuario actualizado con éxito!" : "¡Usuario creado con éxito en la base de datos!", "success");
        onVolver();
      } else {
        const errorData = await response.json();
        console.error("Detalles del error del servidor:", errorData);
        mostrarToast(`Error al guardar el usuario: ${errorData.message || 'Revisa la consola'}`, "error");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      mostrarToast("No se pudo conectar con el servidor (backend).", "error");
    }
  };

  const handleEliminarUsuario = async () => {
    mostrarConfirmacion(
      '',
      `¿Estás seguro de que deseas eliminar al usuario @${username}? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'warning'
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${API_URL}/usuarios/${datosIniciales.id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            mostrarToast("Usuario eliminado correctamente.", "success");
            onVolver();
          } else {
            mostrarToast("Error al intentar eliminar el usuario.", "error");
          }
        } catch (error) {
          mostrarToast("Error de conexión con el servidor.", "error");
        }
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
      <button className="btn" onClick={onVolver}>⬅ Cancelar y volver</button>
      
      <div className="form-container">
        <h2 className="form-title">{modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>

        <div className="input-group">
          <label>Usuario (Para iniciar sesión)</label>
          <input type="text" className="form-input" placeholder="Ej: jperez" value={username} onChange={e => setUsername(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Nombre</label>
          <input type="text" className="form-input" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Apellido</label>
          <input type="text" className="form-input" value={apellido} onChange={e => setApellido(e.target.value)} />
        </div>

        <div className="input-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            {modoEdicion ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
            <button 
              type="button" 
              onClick={() => setMostrarPassword(!mostrarPassword)}
              style={{ background: 'none', border: 'none', color: 'var(--celeste)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', padding: 0 }}
            >
              {mostrarPassword ? "Ocultar" : "Mostrar"}
            </button>
          </label>
          <input 
            type={mostrarPassword ? "text" : "password"} 
            className="form-input" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
        </div>

        <div className="input-group">
          <label>Repetir Contraseña</label>
          <input 
            type={mostrarPassword ? "text" : "password"} 
            className="form-input"  
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
          />
        </div>

        <div className="input-group checkbox-group">
          <input 
            type="checkbox" 
            id="adminCheck"
            className="checkbox-input"
            checked={isAdmin} 
            onChange={e => setIsAdmin(e.target.checked)} 
          />
          <label htmlFor="adminCheck" className="checkbox-label">Administrador</label>
        </div>

        <div className="input-group multi-select-group" style={{ position: 'relative' }}>
          <label>Especialidades</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Escriba para buscar especialidad..."
            value={busquedaEsp}
            onChange={e => {
              setBusquedaEsp(e.target.value);
              setMostrarLista(true);
            }}
            onFocus={() => setMostrarLista(true)}
            onBlur={() => setTimeout(() => setMostrarLista(false), 200)} 
          />
          
          {mostrarLista && opcionesFiltradas.length > 0 && (
            <ul className="dropdown-opciones">
              {opcionesFiltradas.map(esp => (
                <li 
                  key={esp.id} 
                  className="dropdown-item"
                  onClick={() => handleSeleccionarEspecialidad(esp)}
                >
                  {esp.nombre}
                </li>
              ))}
            </ul>
          )}
          
          <div className="tags-display">
            {especialidadesSeleccionadas.map(esp => (
              <span key={esp.id} className="tag-item">
                {esp.nombre}
                <button 
                  type="button"
                  onClick={() => handleQuitarEspecialidad(esp.id)}
                  className="tag-close"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <button className="btn-guardar" onClick={handleGuardarUsuario}>
            {modoEdicion ? 'Guardar Cambios' : 'Guardar Usuario'}
          </button>

          {modoEdicion && (
            <button 
              className="btn-eliminar"
              type="button"
              onClick={handleEliminarUsuario} 
            >
              <TrashIcon /> Eliminar usuario
            </button>
          )}
        </div>
      </div>
    </section>
  );
};