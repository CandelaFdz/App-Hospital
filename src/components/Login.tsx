import React, { useState } from 'react';
import { API_URL } from '../config/api';

interface LoginProps {
  onLoginSuccess: (usuario: any) => void;
  onCancelar: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onCancelar }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');

  const handleIngresar = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        onLoginSuccess(data.usuario);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <section className="protocol-form-section" style={{ maxWidth: '400px', margin: '2rem auto', width: '100%' }}>
      <div className="form-container" style={{ backgroundColor: 'var(--blanco-puro)', padding: '2rem 1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid var(--borde-claro)' }}>
        
        <h2 className="form-title" style={{ textAlign: 'center', marginTop: 0 }}>
          Iniciar Sesión
        </h2>
        
        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: 'var(--rojo-alerta)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        <div className="input-group">
          <label>Nombre de Usuario</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Ej: jperez"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
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
            placeholder="********"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        <div className="form-actions" style={{ marginTop: '1rem' }}>
          <button className="btn-guardar" onClick={handleIngresar}>
            Ingresar
          </button>
          <button className="btn" onClick={onCancelar} style={{ textAlign: 'center' }}>
            Cancelar
          </button>
        </div>
      </div>
    </section>
  );
};