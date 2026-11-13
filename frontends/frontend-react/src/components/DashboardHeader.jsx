import React from 'react';

export default function DashboardHeader({ title, usuario, onLogout }) {
  return (
    <header className="hud-panel dashboard-header">
      <div>
        <h1>{title}</h1>
        <p className="dashboard-info">
          USUARIO: <span className="highlight">{usuario?.username || 'USUARIO'}</span>
          {' | '}
          ROL: <span className="role">{usuario?.rol || 'SIN ROL'}</span>
        </p>
      </div>
      <button type="button" onClick={onLogout} className="hud-button logout-btn">
        CERRAR SESIÓN
      </button>
    </header>
  );
}
