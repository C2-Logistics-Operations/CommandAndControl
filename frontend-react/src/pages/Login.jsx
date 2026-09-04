import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fallo de autenticación');
      }

      login(data.token, data.usuario);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="hud-panel" style={{ width: '350px' }}>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>[ C2 COMMAND SYSTEM ]</h2>
        <p style={{ fontSize: '12px', textAlign: 'center', color: '#8b949e' }}>INGRESE CREDENCIALES DE ACCESO</p>

        {error && <div style={{ color: 'var(--danger-red)', marginBottom: '15px', fontSize: '12px' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '12px' }}>OPERADOR / USUARIO:</label>
          <input 
            type="text" 
            className="hud-input" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />

          <label style={{ fontSize: '12px' }}>CLAVE DE ACCESO:</label>
          <input 
            type="password" 
            className="hud-input" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />

          <button type="submit" className="hud-button" style={{ width: '100%' }}>INICIAR SESION</button>
        </form>
      </div>
    </div>
  );
}