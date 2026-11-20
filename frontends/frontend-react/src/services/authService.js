import { api } from './api';

export const authService = {
  async login(credentials) {
    return api.post('/auth/login', credentials);
  }
};
