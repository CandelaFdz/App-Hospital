import React, { useState } from 'react';
import logoApp from '../assets/icon.jpeg';

interface HeaderProps {
  usuario: any;
  onAbrirLogin: () => void;
  onCerrarSesion: () => void;
  ocultarBotonLogin?: boolean; // NUEVO: Propiedad para esconder el botón
}

export const Header: React.FC<HeaderProps> = ({
  usuario,
  onAbrirLogin,
  onCerrarSesion,
  ocultarBotonLogin = false,
}) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = () => {
    setMenuAbierto(false);
    onCerrarSesion();
  };

  const UserIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );

  return (
    <header className="app-header">
      <div className="logo">
        <img src={logoApp} alt="Logo de la aplicación" />
      </div>

      <div className="auth-actions">
        {usuario ? (
          <div className="user-menu">
            <button
              className="btn-login-header"
              type="button"
              aria-expanded={menuAbierto}
              aria-haspopup="true"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              <UserIcon />
              Dr/a. {usuario.apellido || usuario.nombre}
            </button>

            {menuAbierto && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  type="button"
                  onClick={cerrarSesion}
                  style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', fontWeight: 'bold', color: 'var(--rojo-alerta)' }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          
          !ocultarBotonLogin && (
            <button className="btn-login-header" type="button" onClick={onAbrirLogin}>
              Iniciar sesión
            </button>
          )
        )}
      </div>
    </header>
  );
};