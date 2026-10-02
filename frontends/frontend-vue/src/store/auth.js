import { reactive, computed } from 'vue';

const state = reactive({
  token: localStorage.getItem('c2_token') || null,
  usuario: JSON.parse(localStorage.getItem('c2_user')) || null,
  apiBaseUrl: localStorage.getItem('c2_backend') || 'http://localhost:8000/api/v1' // Por defecto FastAPI
});

export const useAuth = () => {
  const login = (tokenData, userData) => {
    state.token = tokenData;
    state.usuario = userData;
    localStorage.setItem('c2_token', tokenData);
    localStorage.setItem('c2_user', JSON.stringify(userData));
  };

  const logout = () => {
    state.token = null;
    state.usuario = null;
    localStorage.removeItem('c2_token');
    localStorage.removeItem('c2_user');
  };

  const setBackend = (url) => {
    state.apiBaseUrl = url;
    localStorage.setItem('c2_backend', url);
  };

  return {
    state,
    isAuth: computed(() => !!state.token),
    esComandante: computed(() => state.usuario?.rol === 'COMANDANTE'),
    login,
    logout,
    setBackend
  };
};