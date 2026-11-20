import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../pages/Dashboard';
import { AuthContext } from '../context/AuthContext';
import * as apiModule from '../services/api';

vi.mock('../services/api', () => ({
  fetchConAuth: vi.fn(),
  api: { post: vi.fn(), get: vi.fn() }
}));

describe('Dashboard C2 y Subcomponentes (React)', () => {
  const mockLogout = vi.fn();
  const comandanteUser = { username: 'cmd_alpha', rol: 'COMANDANTE' };
  const operadorUser = { username: 'op_bravo', rol: 'OPERADOR' };
  let wsInstance = null;

  const mockMisiones = [
    { id: 1, nombre: 'Operación Norte', rango_peligro: 'CRITICO', estado: 'READY' },
    { id: 2, nombre: 'Patrulla Sur', rango_peligro: 'BAJO', estado: 'HOLD' }
  ];
  const mockSuministros = [
    { id: 10, item: 'Botiquín Táctico', categoria: 'EQUIPAMIENTO', stock_disponible: 15 },
    { id: 11, item: 'Ración Seca', categoria: 'ALIMENTO', stock_disponible: 0 }
  ];
  const mockEscuadrones = [
    { id: 5, nombre_codigo: 'ALFA-1', especialidad: 'LOGÍSTICA', mision_id: 1 },
    { id: 6, nombre_codigo: 'BRAVO-2', especialidad: 'RECONOCIMIENTO', mision_id: null }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    wsInstance = null;

    class MockWebSocket {
      constructor() {
        this.onmessage = null;
        this.close = vi.fn();
        wsInstance = this;
      }
    }
    global.WebSocket = MockWebSocket;

    apiModule.fetchConAuth.mockImplementation((endpoint) => {
      if (endpoint === '/misiones') return Promise.resolve(mockMisiones);
      if (endpoint === '/suministros') return Promise.resolve(mockSuministros);
      if (endpoint === '/escuadrones') return Promise.resolve(mockEscuadrones);
      return Promise.resolve({ ok: true });
    });
  });

  test('renderiza datos iniciales, navega entre las 3 pestañas y actualiza estado vía WebSocket', async () => {
    render(
      <AuthContext.Provider value={{ usuario: comandanteUser, logout: mockLogout }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    expect(screen.getByText('[ CENTRO DE CONTROL C2 ]')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('Operación Norte')).toBeTruthy();
      expect(screen.getByText('[ REGISTRAR MISION ]')).toBeTruthy();
    });

    act(() => {
      wsInstance.onmessage({
        data: JSON.stringify({
          event: 'MISSION_STATE_CHANGED',
          mision_id: 2,
          nuevo_estado: 'READY'
        })
      });
    });

    fireEvent.click(screen.getByText('ARSENAL / STOCK'));
    expect(screen.getByText('Botiquín Táctico')).toBeTruthy();
    expect(screen.getByText('[ INGRESO DE SUMINISTRO ]')).toBeTruthy();

    fireEvent.click(screen.getByText('ESCUADRONES'));
    expect(screen.getByText('ALFA-1')).toBeTruthy();
    expect(screen.getByText('SIN ASIGNAR')).toBeTruthy();

    fireEvent.click(screen.getByText('MISIONES'));
    expect(screen.getByText('[ OPERACIONES TÁCTICAS ]')).toBeTruthy();
  });

  test('oculta paneles de creación para rol OPERADOR y ejecuta logout', async () => {
    render(
      <AuthContext.Provider value={{ usuario: operadorUser, logout: mockLogout }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Patrulla Sur')).toBeTruthy();
    });
    expect(screen.queryByText('[ REGISTRAR MISION ]')).toBeNull();

    fireEvent.click(screen.getByText('DESCONECTAR'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('permite crear misión, suministro y asignar manifiesto con todos sus campos', async () => {
    const { container } = render(
      <AuthContext.Provider value={{ usuario: comandanteUser, logout: mockLogout }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => expect(screen.getByText('Operación Norte')).toBeTruthy());

    const textInputs = container.querySelectorAll('input[type="text"]');
    const selectsMisiones = container.querySelectorAll('select');
    fireEvent.change(textInputs[0], { target: { value: 'Misión Delta' } });
    fireEvent.change(selectsMisiones[0], { target: { value: 'CRITICO' } });
    fireEvent.click(screen.getByText('DESPLEGAR MISIÓN'));

    await waitFor(() => {
      expect(apiModule.fetchConAuth).toHaveBeenCalledWith(
        '/misiones',
        expect.objectContaining({ method: 'POST' })
      );
    });

    const qtyInput = container.querySelector('input[type="number"]');
    fireEvent.change(selectsMisiones[1], { target: { value: '1' } });
    fireEvent.change(selectsMisiones[2], { target: { value: '10' } });
    fireEvent.change(qtyInput, { target: { value: '5' } });
    fireEvent.click(screen.getByText('CARGAR AL MANIFIESTO'));

    await waitFor(() => {
      expect(apiModule.fetchConAuth).toHaveBeenCalledWith(
        '/misiones/1/manifiesto',
        expect.objectContaining({ method: 'POST' })
      );
    });

    fireEvent.click(screen.getByText('ARSENAL / STOCK'));
    const sumInput = container.querySelector('input[type="text"]');
    const sumCatSelect = container.querySelector('select');
    const sumStockInput = container.querySelector('input[type="number"]');
    fireEvent.change(sumInput, { target: { value: 'Radio VHF' } });
    fireEvent.change(sumCatSelect, { target: { value: 'EQUIPAMIENTO' } });
    fireEvent.change(sumStockInput, { target: { value: '20' } });
    fireEvent.click(screen.getByText('INGRESAR AL ARSENAL'));

    await waitFor(() => {
      expect(apiModule.fetchConAuth).toHaveBeenCalledWith(
        '/suministros',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  test('muestra banner de error cuando falla la carga inicial', async () => {
    apiModule.fetchConAuth.mockRejectedValueOnce(new Error('Fallo de red C2'));

    render(
      <AuthContext.Provider value={{ usuario: operadorUser, logout: mockLogout }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Fallo de red C2/)).toBeTruthy();
    });
  });

  test('muestra alertas cuando fallan las mutaciones POST de misión, manifiesto y suministro', async () => {
    const { container } = render(
      <AuthContext.Provider value={{ usuario: comandanteUser, logout: mockLogout }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => expect(screen.getByText('Operación Norte')).toBeTruthy());

    // Fallo al crear misión
    apiModule.fetchConAuth.mockRejectedValueOnce(new Error('Error creando misión'));
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'Fallida' } });
    fireEvent.click(screen.getByText('DESPLEGAR MISIÓN'));
    await waitFor(() => expect(screen.getByText(/Error creando misión/)).toBeTruthy());

    // Fallo al asignar manifiesto (con selects ya poblados)
    apiModule.fetchConAuth.mockRejectedValueOnce(new Error('Error en manifiesto'));
    const selects = container.querySelectorAll('select');
    fireEvent.change(selects[1], { target: { value: '1' } });
    fireEvent.change(selects[2], { target: { value: '10' } });
    fireEvent.click(screen.getByText('CARGAR AL MANIFIESTO'));
    await waitFor(() => expect(screen.getByText(/Error en manifiesto/)).toBeTruthy());

    // Fallo al crear suministro
    fireEvent.click(screen.getByText('ARSENAL / STOCK'));
    apiModule.fetchConAuth.mockRejectedValueOnce(new Error('Error creando suministro'));
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'Item Fallido' } });
    fireEvent.click(screen.getByText('INGRESAR AL ARSENAL'));
    await waitFor(() => expect(screen.getByText(/Error creando suministro/)).toBeTruthy());
  });
});
