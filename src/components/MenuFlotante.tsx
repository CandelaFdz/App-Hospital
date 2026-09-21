import React, { useState } from 'react';

interface MenuFlotanteProps {
  onAbrirFormulario: (tipo: 'protocolo' | 'diagnostico' | 'especialidad' | 'usuario') => void;
}

export const MenuFlotante: React.FC<MenuFlotanteProps> = ({ onAbrirFormulario }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const handleSeleccion = (tipo: 'protocolo' | 'diagnostico' | 'especialidad' | 'usuario') => {
    onAbrirFormulario(tipo);
    setIsMenuOpen(false); 
  };

  return (
    <div className="fab-container">
      {isMenuOpen && (
        <div className="fab-menu">
          <button className="fab-item" onClick={() => handleSeleccion('diagnostico')}>Agregar diagnostico</button>
          <button className="fab-item" onClick={() => handleSeleccion('protocolo')}>Agregar protocolo</button>
          <button className="fab-item" onClick={() => handleSeleccion('especialidad')}>Agregar especialidad</button>
          <button className="fab-item" onClick={() => handleSeleccion('usuario')}>Gestion de usuario</button>
        </div>
      )}
      <button 
        className={`fab-button ${isMenuOpen ? 'open' : ''}`} 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Menú de opciones"
      >
        +
      </button>
    </div>
  );
};