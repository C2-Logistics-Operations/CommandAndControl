import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';

const RutaProtegida = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
};

const DashboardMock = () => {
  const { usuario, logout } = useContext(AuthContext);
  return (
    <div style={{ padding: '20px' }}>
      <div className="hud-panel">
        <h1>[ CENTRO DE MANDO C2 - CONECTADO ]</h1>
        <p>OPERADOR: <strong>{usuario?.username}</strong> | ROL: <strong>{usuario?.rol}</strong></p>
        <button className="hud-button" onClick={logout}>CERRAR SESION</button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <RutaProtegida>
                <DashboardMock />
              </RutaProtegida>
            } 
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}