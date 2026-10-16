import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';
import { describe, it, expect } from 'vitest';

describe('Suite de Pruebas: Componente Login React (Frontend A)', () => {
  it('Debe renderizar la interfaz HUD del panel de login', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('[ C2 COMMAND SYSTEM ]')).toBeInTheDocument();
    expect(screen.getByLabelText(/OPERADOR \/ USUARIO:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CLAVE DE ACCESO:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /INICIAR SESION/i })).toBeInTheDocument();
  });
});