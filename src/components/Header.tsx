import React, { useState } from 'react';
import logoApp from '../assets/icon.jpeg';

interface HeaderProps {
  usuario: any;
  onAbrirLogin: () => void;
  onCerrarSesion: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  usuario,
  onAbrirLogin,
  onCerrarSesion,
}) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = () => {
    setMenuAbierto(false);
    onCerrarSesion();
  };

  return (
    <header className="app-header">
      <div className="logo">
        <img src={logoApp} alt="Logo de la aplicación" />
      </div>

      <div className="auth-actions">
        {usuario ? (
          <div className="user-menu">
            <button
              className="user-trigger"
              type="button"
              aria-expanded={menuAbierto}
              aria-haspopup="true"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              Dr/a. {usuario.apellido || usuario.nombre}
            </button>

            {menuAbierto && (
              <div className="dropdown-menu">
                <button
                  className="btn"
                  type="button"
                  onClick={cerrarSesion}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn" type="button" onClick={onAbrirLogin}>
            Iniciar sesión
          </button>
        )}
      </div>
    </header>
  );
};
