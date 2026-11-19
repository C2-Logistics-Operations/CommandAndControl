import { mount, flushPromises } from '@vue/test-utils';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../store/auth';
import Login from '../views/Login.vue';
import router from '../router';

const mockFetchResponse = (ok, payload, status = ok ? 200 : 400) => ({
  ok,
  status,
  text: async () => JSON.stringify(payload),
  json: async () => payload
});

describe('Servicios, Store Auth y Login (Vue 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('api, authService y dashboardService ejecutan peticiones y manejan errores', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce(
      mockFetchResponse(true, { token: 'vue-jwt', usuario: { username: 'op1', rol: 'OPERADOR' } })
    );

    const loginRes = await authService.login({ username: 'op1', password: '123' });
    expect(loginRes.token).toBe('vue-jwt');

    global.fetch = vi.fn().mockResolvedValueOnce(
      mockFetchResponse(true, [{ id: 1, item: 'Batería', stock_disponible: 5 }])
    );

    const items = await dashboardService.fetchSuministros('vue-jwt');
    expect(items).toHaveLength(1);

    global.fetch = vi.fn().mockResolvedValueOnce(
      mockFetchResponse(false, { error: 'No autorizado' }, 401)
    );

    await expect(dashboardService.fetchSuministros('bad-token')).rejects.toThrow();
    await api.get('/ping', 'vue-jwt');
  });

  test('useAuth gestiona login, estado de usuario y logout', () => {
    const { state, login, logout } = useAuth();
    login('tok-store', { username: 'tester', rol: 'COMANDANTE' });
    expect(state.token).toBe('tok-store');
    expect(state.usuario?.username).toBe('tester');

    logout();
    expect(state.token).toBeFalsy();
  });

  test('Login.vue envía credenciales y muestra error si falla autenticación', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce(
      mockFetchResponse(false, { error: 'Clave incorrecta' }, 401)
    );

    const wrapper = mount(Login, {
      global: { plugins: [router] }
    });

    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('operador');
    await inputs[1].setValue('wrong');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Clave incorrecta');
  });
});