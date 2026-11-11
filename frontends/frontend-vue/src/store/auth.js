import { reactive, computed } from 'vue';
import { authService } from '../services/authService';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('c2_user')) || null;
  } catch {
    return null;
  }
};

const state = reactive({
  token: localStorage.getItem('c2_token') || null,
  usuario: getStoredUser(),
  apiBaseUrl:
    localStorage.getItem('c2_backend') ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8000/api/v1'
});

export const useAuth = () => {

  // Guarda los datos de autenticación.
  const login = (tokenData, userData) => {
    state.token = tokenData;
    state.usuario = userData;

    localStorage.setItem('c2_token', tokenData);
    localStorage.setItem('c2_user', JSON.stringify(userData));
  };

  // Ejecuta la autenticación mediante el servicio.
  const authenticate = async (credentials) => {
    const data = await authService.login(
      credentials,
      state.apiBaseUrl
    );

    login(data.token, data.usuario);

    return data;
  };

  // Cierra la sesión.
  const logout = () => {
    state.token = null;
    state.usuario = null;

    localStorage.removeItem('c2_token');
    localStorage.removeItem('c2_user');
  };

  // Cambia el backend seleccionado.
  const setBackend = (url) => {
    state.apiBaseUrl = url;
    localStorage.setItem('c2_backend', url);
  };

  return {
    state,
    isAuth: computed(() => !!state.token),
    esComandante: computed(
      () => state.usuario?.rol === 'COMANDANTE'
    ),
    login,
    authenticate,
    logout,
    setBackend
  };
};