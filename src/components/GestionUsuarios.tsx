import React, { useState, useEffect } from 'react';

interface GestionUsuariosProps {
  onVolver: () => void;
  onCrearUsuario: () => void;
  onEditarUsuario: (usuario: Usuario) => void; 
}

interface Usuario {
  id: string;
  username: string;
  nombre: string;
  apellido: string;
  is_admin: boolean;
}

export const GestionUsuarios: React.FC<GestionUsuariosProps> = ({ onVolver, onCrearUsuario, onEditarUsuario }) => {
  const [busqueda, setBusqueda] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:3000/usuarios');
        if (response.ok) {
          const data = await response.json();
          setUsuarios(data);
        } else {
          console.error("Error al obtener los usuarios del servidor");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter(u => 
    u.username?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.apellido?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <section className="protocol-form-section">
      <div className="titulo-en-linea">
        <button className="btn" onClick={onVolver}>⬅</button>
        <h2 className="form-title">Gestión de Usuarios</h2>
      </div>

      <div className="form-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, apellido o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <div className="lista-usuarios">
          {cargando ? (
            <p className="estado-lista">Cargando usuarios...</p>
          ) : usuariosFiltrados.length === 0 ? (
            <p className="estado-lista">No se encontraron usuarios.</p>
          ) : (
            usuariosFiltrados.map(usuario => (
              <div 
                key={usuario.id} 
                className="usuario-card"
                onClick={() => onEditarUsuario(usuario)} 
                style={{ cursor: 'pointer' }} 
              >
                <div className="card-text">
                  <p className="usuario-nombre">
                    {usuario.nombre} {usuario.apellido}
                  </p>
                  <p className="usuario-username">
                    @{usuario.username}
                  </p>
                </div>
                <div>
                  {usuario.is_admin && (
                    <span className="badge-admin">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <button className="btn-guardar" onClick={onCrearUsuario}>
          + Crear Nuevo Usuario
        </button>
      </div>
    </section>
  );
};