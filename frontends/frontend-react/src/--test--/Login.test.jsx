import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from '../pages/Login';
import { AuthContext } from '../context/AuthContext';

describe('Suite de Pruebas: Componente Login React (Frontend A)', () => {
  it('Debe renderizar la interfaz HUD del panel de login', () => {
    const mockAuth = { login: vi.fn(), usuario: null };

    render(
      <AuthContext.Provider value={mockAuth}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('[ C2 COMMAND SYSTEM ]')).toBeInTheDocument();
    expect(screen.getByLabelText(/OPERADOR \/ USUARIO:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CLAVE DE ACCESO:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /INICIAR SESION/i })).toBeInTheDocument();
  });
});