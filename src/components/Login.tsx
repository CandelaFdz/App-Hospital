import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (usuario: any) => void;
  onCancelar: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onCancelar }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleIngresar = async () => {
    try {
      const response = await fetch('http://localhost:3000/usuarios/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

      if (response.ok) {
        const data = await response.json();
        // data.usuario vendrá desde el backend
        onLoginSuccess(data.usuario);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title" style={{ textAlign: 'center' }}>Iniciar Sesión</h2>
      
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <div className="input-group">
        <label>Nombre de Usuario</label>
        <input 
          type="text" 
          className="form-input" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
      </div>

      <div className="input-group">
        <label>Contraseña</label>
        <input 
          type="password" 
          className="form-input" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>

      <div className="form-actions">
        <button className="btn-guardar" onClick={handleIngresar}>
          Ingresar
        </button>
        <button className="btn-guardar"  onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
};