import React, { useState } from 'react';

interface GestionUsuariosProps {
  onVolver: () => void;
  onCrearUsuario: () => void;
}

export const GestionUsuarios: React.FC<GestionUsuariosProps> = ({ onVolver, onCrearUsuario }) => {
  const [busqueda, setBusqueda] = useState('');

  return (
    <section className="protocol-form-section">
      <div className="titulo-en-linea">
    <button className="btn" onClick={onVolver}>⬅</button>
    <h2 className="form-title">Gestión de Usuarios</h2>
  </div>

      <div className="form-container">
        
        <div className="search-input-wrapper" style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre de usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--gris)' }}>
          <p>Lista de usuarios.</p>
        </div>

        <button className="btn-guardar" onClick={onCrearUsuario} style={{ marginTop: '1rem' }}>
          + Crear Nuevo Usuario
        </button>
      </div>
    </section>
  );
};