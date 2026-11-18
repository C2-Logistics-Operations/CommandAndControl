import React from 'react';

export default function DashboardHeader({ usuario, logout, error, tab, setTab }) {
  return (
    <>
      <div className="hud-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>[ CENTRO DE CONTROL C2 ]</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#8b949e' }}>
            OPERADOR: <span style={{ color: '#fff' }}>{usuario?.username}</span> | ROL: <span style={{ color: 'var(--neon-green)' }}>{usuario?.rol}</span>
          </p>
        </div>
        <button className="hud-button" onClick={logout}>DESCONECTAR</button>
      </div>

      {error && (
        <div className="hud-panel" style={{ borderColor: 'var(--danger-red)', color: 'var(--danger-red)', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={`hud-button ${tab === 'misiones' ? 'active' : ''}`} onClick={() => setTab('misiones')}>MISIONES</button>
        <button className={`hud-button ${tab === 'suministros' ? 'active' : ''}`} onClick={() => setTab('suministros')}>ARSENAL / STOCK</button>
        <button className={`hud-button ${tab === 'escuadrones' ? 'active' : ''}`} onClick={() => setTab('escuadrones')}>ESCUADRONES</button>
      </div>
    </>
  );
}