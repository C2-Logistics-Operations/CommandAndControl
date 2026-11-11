import { api } from './api';

export const authService = {
  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Fallo de autenticación');
    }
    return res.json();
  }
};