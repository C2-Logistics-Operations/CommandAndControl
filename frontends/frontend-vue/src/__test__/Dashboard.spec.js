import { mount, flushPromises } from '@vue/test-utils';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../views/Dashboard.vue';
import { dashboardService } from '../services/dashboardService';

const mockPush = vi.fn();
const mockLogout = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}));

vi.mock('../store/auth', () => ({
  useAuth: () => ({
    state: {
      token: 'jwt-test-token',
      apiBaseUrl: 'http://localhost:3000/api/v1',
      usuario: { username: 'operador_vue', rol: 'COMANDANTE' }
    },
    logout: mockLogout
  })
}));

vi.mock('../services/dashboardService', () => ({
  dashboardService: {
    fetchSuministros: vi.fn()
  }
}));

describe('Dashboard Vue 3 y Subcomponentes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('carga resumen e indicadores y navega a la pestaña inventario', async () => {
    dashboardService.fetchSuministros.mockResolvedValue([
      { id: 1, item: 'Generador', categoria: 'EQUIPAMIENTO', stock_disponible: 8 },
      { id: 2, nombre: 'Batería', categoria: 'ENERGÍA', cantidad: 0 }
    ]);

    const wrapper = mount(Dashboard);
    await flushPromises();

    expect(wrapper.text()).toContain('[ TERMINAL VUE 3 ]');
    expect(wrapper.text()).toContain('operador_vue');
    expect(wrapper.text()).toContain('Generador');

    // Cambiar a pestaña INVENTARIO
    const buttons = wrapper.findAll('button');
    const invBtn = buttons.find(b => b.text() === 'INVENTARIO');
    await invBtn.trigger('click');

    // Después de hacer click en INVENTARIO:
    const actualizarBtn = wrapper.findAll('button').find(b => b.text() === 'ACTUALIZAR');
    await actualizarBtn.trigger('click');
    await flushPromises();
    expect(dashboardService.fetchSuministros).toHaveBeenCalledTimes(2);

    expect(wrapper.text()).toContain('[ INVENTARIO GENERAL ]');
    expect(wrapper.text()).toContain('DISPONIBLE');
    expect(wrapper.text()).toContain('SIN STOCK');
  });

  test('redirige a /login ante error HTTP 401 y permite logout manual', async () => {
    dashboardService.fetchSuministros.mockRejectedValueOnce({ status: 401 });

    mount(Dashboard);
    await flushPromises();

    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  test('muestra alerta en pantalla ante error de red y ejecuta desconexión', async () => {
    dashboardService.fetchSuministros.mockRejectedValueOnce(new Error('Servidor no disponible'));

    const wrapper = mount(Dashboard);
    await flushPromises();

    expect(wrapper.find('[role="alert"]').text()).toContain('Servidor no disponible');

    const logoutBtn = wrapper.find('.logout-button');
    await logoutBtn.trigger('click');
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});