```jsx
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Fallo de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}
    >
      <div className="hud-panel" style={{ width: '350px' }}>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>
          [ C2 COMMAND SYSTEM ]
        </h2>

        <p
          style={{
            fontSize: '12px',
            textAlign: 'center',
            color: '#8b949e'
          }}
        >
          INGRESE CREDENCIALES DE ACCESO
        </p>

        {error && (
          <div
            role="alert"
            style={{
              color: 'var(--danger-red)',
              marginBottom: '15px',
              fontSize: '12px'
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username" style={{ fontSize: '12px' }}>
            OPERADOR / USUARIO:
          </label>

          <input
            id="username"
            type="text"
            className="hud-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            disabled={loading}
          />

          <label htmlFor="password" style={{ fontSize: '12px' }}>
            CLAVE DE ACCESO:
          </label>

          <input
            id="password"
            type="password"
            className="hud-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={loading}
          />

          <button
            type="submit"
            className="hud-button"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'AUTENTICANDO...' : 'INICIAR SESION'}
          </button>
        </form>
      </div>
    </div>
  );
}
```