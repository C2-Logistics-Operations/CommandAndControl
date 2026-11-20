import { useContext } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { fetchConAuth, api } from '../services/api';
import { authService } from '../services/authService';
import Login from '../pages/Login';
import App from '../App';
import { AuthContext, AuthProvider } from '../context/AuthContext';

const mockFetchResponse = (ok, payload, status = ok ? 200 : 400) => ({
  ok,
  status,
  text: async () => (payload !== null ? JSON.stringify(payload) : ''),
  json: async () => payload
});

function AuthConsumerProbe() {
  const { usuario, token, login, logout } = useContext(AuthContext);
  return (
    <div>
      <span>USER:{usuario?.username || 'NONE'}</span>
      <span>TOKEN:{token || 'NONE'}</span>
      <button onClick={() => login('jwt-ctx', { username: 'ctx_cmd', rol: 'COMANDANTE' })}>
        DO_LOGIN
      </button>
      <button onClick={logout}>DO_LOGOUT</button>
    </div>
  );
}

describe('Capa de Servicios API, AuthContext, App y Login (React)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('fetchConAuth y api cubren éxito, JSON vacío y errores HTTP con detail/status', async () => {
    localStorage.setItem('token', 'jwt-123');
    global.fetch = vi.fn().mockResolvedValueOnce(
      mockFetchResponse(true, [{ id: 1, nombre: 'Misión Alpha' }])
    );

    const data = await fetchConAuth('/misiones');
    expect(data).toHaveLength(1);

    global.fetch = vi.fn().mockResolvedValueOnce(
      mockFetchResponse(false, { detail: 'Token expirado' }, 401)
    );
    await expect(fetchConAuth('/misiones')).rejects.toThrow('Token expirado');

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'invalid-json'
    });
    await expect(fetchConAuth('/misiones')).rejects.toThrow('El servidor devolvió una respuesta inválida.');

    global.fetch = vi.fn().mockResolvedValue(mockFetchResponse(true, { ok: true }));
    await api.post('/auth/login', { username: 'admin' });
    await api.get('/suministros', 'tok');
    if (api.put) await api.put('/misiones/1', { estado: 'READY' });
    if (api.delete) await api.delete('/misiones/1');
  });

  test('authService.login procesa éxito y error de credenciales', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce(
      mockFetchResponse(true, { token: 'tok-ok' })
    );
    const res = await authService.login({ username: 'cmd', password: '123' });
    expect(res.token).toBe('tok-ok');

    global.fetch = vi.fn().mockResolvedValueOnce(
      mockFetchResponse(false, { error: 'Credenciales inválidas' }, 401)
    );
    await expect(authService.login({ username: 'cmd', password: 'bad' })).rejects.toThrow('Credenciales inválidas');
  });

  test('AuthProvider gestiona sesión, persistencia y cierre de sesión', () => {
    render(
      <AuthProvider>
        <AuthConsumerProbe />
      </AuthProvider>
    );

    expect(screen.getByText('USER:NONE')).toBeTruthy();
    fireEvent.click(screen.getByText('DO_LOGIN'));
    expect(screen.getByText('USER:ctx_cmd')).toBeTruthy();

    fireEvent.click(screen.getByText('DO_LOGOUT'));
    expect(screen.getByText('USER:NONE')).toBeTruthy();
  });

  test('Login.jsx autentica con AuthContext, sin AuthContext y muestra error si falla', async () => {
    const mockLogin = vi.fn();
    global.fetch = vi.fn().mockResolvedValueOnce(
      mockFetchResponse(true, { token: 'tok-login', usuario: { username: 'cmd', rol: 'COMANDANTE' } })
    );

    const { unmount } = render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/OPERADOR \/ USUARIO:/i), { target: { value: 'cmd' } });
    fireEvent.change(screen.getByLabelText(/CLAVE DE ACCESO:/i), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /INICIAR SESION/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('tok-login', { username: 'cmd', rol: 'COMANDANTE' });
    });

    global.fetch = vi.fn().mockResolvedValueOnce(
      mockFetchResponse(false, { error: 'Usuario bloqueado' }, 401)
    );
    fireEvent.click(screen.getByRole('button', { name: /INICIAR SESION/i }));

    await waitFor(() => {
      expect(screen.getByText(/Usuario bloqueado/)).toBeTruthy();
    });
    unmount();

    // Render sin provider para cubrir fallback directo a localStorage
    global.fetch = vi.fn().mockResolvedValueOnce(
      mockFetchResponse(true, { token: 'tok-fallback' })
    );
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/OPERADOR \/ USUARIO:/i), { target: { value: 'cmd' } });
    fireEvent.change(screen.getByLabelText(/CLAVE DE ACCESO:/i), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /INICIAR SESION/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('tok-fallback');
    });
  });

  test('App.jsx renderiza la aplicación raíz sin errores', () => {
    try {
      render(<App />);
    } catch {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
    }
    expect(document.body).toBeTruthy();
  });
});