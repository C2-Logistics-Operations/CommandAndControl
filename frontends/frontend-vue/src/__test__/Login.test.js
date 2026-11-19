import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../views/Login.vue';

// Mock global de WebSocket para entornos de CI/CD (Vitest / JSDOM)
global.WebSocket = vi.fn().mockImplementation(() => ({
  send: vi.fn(),
  close: vi.fn(),
  onmessage: null,
  onerror: null,
  onopen: null,
}));

// Mock de vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

describe('Suite de Pruebas: Componente Login Vue (Frontend B)', () => {
  it('Debe renderizar la interfaz HUD del panel de login en Vue', () => {
    const wrapper = mount(Login);
    expect(wrapper.text()).toContain('[ C2 VUE COMMAND ]');
  });
});