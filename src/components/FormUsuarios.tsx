import React, { useState } from 'react';

interface FormularioUsuarioProps {
  onVolver: () => void;
}

export const FormularioUsuario: React.FC<FormularioUsuarioProps> = ({ onVolver }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  
  // Estados para las contraseñas y para mostrar/ocultar
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [especialidades, setEspecialidades] = useState<string[]>([]);

  
  const [busquedaEsp, setBusquedaEsp] = useState('');
  const [mostrarLista, setMostrarLista] = useState(false);

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
    // Validación básica antes de enviar al backend
    if (password !== confirmPassword) {
      alert("Error: Las contraseñas no coinciden. Por favor, verifícalas.");
      return;
    }

    const nuevoUsuario = {
      nombre,
      apellido,
      pass_hash: password,
      is_admin: isAdmin,
      especialidades
    };
    
    console.log("Enviando al backend:", nuevoUsuario);
    alert("Usuario simulado con éxito. Revisa la consola.");
    onVolver();
  };

  return (
    <section className="protocol-form-section">
      <button className="btn" onClick={onVolver}>⬅ Cancelar y volver</button>
      
      <div className="form-container">
        <h2 className="form-title">Nuevo Usuario</h2>

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
            Contraseña
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
          
          {/* Contenedor de Etiquetas (Tags) */}
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

        <button className="btn-guardar" onClick={handleGuardarUsuario}>
          Guardar Usuario
        </button>
      </div>
    </section>
  );
};