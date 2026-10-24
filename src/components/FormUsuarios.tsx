import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

interface FormularioUsuarioProps {
  onVolver: () => void;
  modoEdicion?: boolean; 
  datosIniciales?: any; 
}

export const FormularioUsuario: React.FC<FormularioUsuarioProps> = ({ onVolver, modoEdicion, datosIniciales }) => {
  const [nombre, setNombre] = useState(datosIniciales?.nombre || '');
  const [apellido, setApellido] = useState(datosIniciales?.apellido || '');
  const [username, setUsername] = useState(datosIniciales?.username || '');
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(datosIniciales?.is_admin || false);
  
  const [especialidades, setEspecialidades] = useState<string[]>(
    datosIniciales?.especialidades ? datosIniciales.especialidades.map((e: any) => e.nombre || e) : []
  );
  
  const [busquedaEsp, setBusquedaEsp] = useState('');
  const [mostrarLista, setMostrarLista] = useState(false);

  useEffect(() => {
    setNombre(datosIniciales?.nombre || '');
    setApellido(datosIniciales?.apellido || '');
    setUsername(datosIniciales?.username || '');
    setIsAdmin(datosIniciales?.is_admin || false);
    setEspecialidades(
      datosIniciales?.especialidades 
        ? datosIniciales.especialidades.map((e: any) => e.nombre || e) 
        : []
    );
    
    setPassword('');
    setConfirmPassword('');
  }, [datosIniciales]);
  
  const opcionesEspecialidad = ['Cardiología', 'Neurología', 'Neumonología', 'Terapia Intensiva', 'Pediatría', 'Traumatología', 'Ginecología', 'Cirugía General'];

  const opcionesFiltradas = opcionesEspecialidad.filter(esp => 
    esp.toLowerCase().includes(busquedaEsp.toLowerCase()) && !especialidades.includes(esp)
  );

  const handleSeleccionarEspecialidad = (seleccion: string) => {
    setEspecialidades([...especialidades, seleccion]);
    setBusquedaEsp(''); 
    setMostrarLista(false); 
  };

  const handleQuitarEspecialidad = (espQuitar: string) => {
    setEspecialidades(especialidades.filter(esp => esp !== espQuitar));
  };

  const handleGuardarUsuario = async () => {
    if (password !== confirmPassword) {
      alert("Error: Las contraseñas no coinciden. Por favor, verifícalas.");
      return;
    }

    // la contraseña solo es obligatoria si es un usuario nuevo, no se si es coveniente que se vea la anterior o no
    if (!modoEdicion && password.trim() === '') {
      alert("Error: La contraseña es obligatoria para un nuevo usuario.");
      return;
    }

    if (!username.trim()) {
      alert("Error: El nombre de usuario es obligatorio.");
      return;
    }
    
    const datosUsuario: any = {
      username,
      nombre,
      apellido,
      is_admin: isAdmin,
      especialidades
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
        alert(modoEdicion ? "¡Usuario actualizado con éxito!" : "¡Usuario creado con éxito en la base de datos!");
        onVolver();
      } else {
        const errorData = await response.json();
        console.error("Detalles del error del servidor:", errorData);
        alert(`Error al guardar el usuario: ${errorData.message || 'Revisa la consola'}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor (backend).");
    }
  };

  const handleEliminarUsuario = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario @${username}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/usuarios/${datosIniciales.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert("Usuario eliminado correctamente.");
        onVolver();
      } else {
        alert("Error al intentar eliminar el usuario.");
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
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
                  key={esp} 
                  className="dropdown-item"
                  onClick={() => handleSeleccionarEspecialidad(esp)}
                >
                  {esp}
                </li>
              ))}
            </ul>
          )}
          
          <div className="tags-display">
            {especialidades.map(esp => (
              <span key={esp} className="tag-item">
                {esp}
                <button 
                  onClick={() => handleQuitarEspecialidad(esp)}
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