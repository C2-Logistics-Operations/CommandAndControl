import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login({ username, password });
      if (auth?.login) {
        auth.login(data.token, data.usuario);
      } else if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container hud-panel">
      <h2>[ C2 COMMAND SYSTEM ]</h2>
      <p className="login-subtitle">INGRESE CREDENCIALES DE ACCESO</p>
      {error && (
        <div className="error" role="alert">
          ⚠️ {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">OPERADOR / USUARIO:</label>
        <input
          id="username"
          type="text"
          className="hud-input"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />

        <label htmlFor="password">CLAVE DE ACCESO:</label>
        <input
          id="password"
          type="password"
          className="hud-input"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" className="hud-button" disabled={loading}>
          {loading ? 'VERIFICANDO...' : 'INICIAR SESION'}
        </button>
      </form>
    </div>
  );
}
