import { useState } from 'react';

export default function MisionesTab({ misiones, suministros, esComandante, onCrearMision, onAsignarManifiesto }) {
  const [nuevaMision, setNuevaMision] = useState({ nombre: '', rango_peligro: 'BAJO' });
  const [manifiestoData, setManifiestoData] = useState({ mision_id: '', suministro_id: '', cantidad_requerida: 1 });

  const handleSubmitMision = async (e) => {
    e.preventDefault();
    const ok = await onCrearMision(nuevaMision);
    if (ok) {
      setNuevaMision({ nombre: '', rango_peligro: 'BAJO' });
    }
  };

  const handleSubmitManifiesto = async (e) => {
    e.preventDefault();
    const ok = await onAsignarManifiesto(manifiestoData);
    if (ok) {
      setManifiestoData({ mision_id: '', suministro_id: '', cantidad_requerida: 1 });
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: esComandante ? '2fr 1fr' : '1fr', gap: '20px' }}>
      <div className="hud-panel">
        <h3>[ OPERACIONES TÁCTICAS ]</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#8b949e' }}>
              <th>ID</th>
              <th>NOMBRE</th>
              <th>PELIGRO</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {misiones.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #21262d', height: '40px' }}>
                <td>#{m.id}</td>
                <td>{m.nombre}</td>
                <td>
                  <span style={{ color: m.rango_peligro === 'CRITICO' ? 'var(--danger-red)' : 'var(--neon-green)' }}>
                    {m.rango_peligro}
                  </span>
                </td>
                <td>
                  <strong style={{
                    color: m.estado === 'READY' ? 'var(--neon-green)' : m.estado === 'HOLD' ? 'var(--warning-amber)' : '#fff',
                    padding: '2px 6px',
                    border: `1px solid ${m.estado === 'READY' ? 'var(--neon-green)' : m.estado === 'HOLD' ? 'var(--warning-amber)' : '#fff'}`
                  }}>
                    {m.estado}
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {esComandante && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="hud-panel">
            <h3>[ REGISTRAR MISION ]</h3>
            <form onSubmit={handleSubmitMision}>
              <label style={{ fontSize: '12px' }}>NOMBRE DE LA OPERACIÓN:</label>
              <input
                type="text"
                className="hud-input"
                value={nuevaMision.nombre}
                onChange={e => setNuevaMision({ ...nuevaMision, nombre: e.target.value })}
                required
              />

              <label style={{ fontSize: '12px' }}>RANGO DE PELIGRO:</label>
              <select
                className="hud-input"
                value={nuevaMision.rango_peligro}
                onChange={e => setNuevaMision({ ...nuevaMision, rango_peligro: e.target.value })}
              >
                <option value="BAJO">BAJO</option>
                <option value="MEDIO">MEDIO</option>
                <option value="CRITICO">CRÍTICO</option>
              </select>

              <button type="submit" className="hud-button" style={{ width: '100%' }}>DESPLEGAR MISIÓN</button>
            </form>
          </div>

          <div className="hud-panel">
            <h3>[ ASIGNAR MANIFIESTO ]</h3>
            <form onSubmit={handleSubmitManifiesto}>
              <label style={{ fontSize: '12px' }}>SELECCIONAR MISIÓN:</label>
              <select
                className="hud-input"
                value={manifiestoData.mision_id}
                onChange={e => setManifiestoData({ ...manifiestoData, mision_id: e.target.value })}
                required
              >
                <option value="">-- SELECCIONAR --</option>
                {misiones.map(m => (
                  <option key={m.id} value={m.id}>#{m.id} {m.nombre}</option>
                ))}
              </select>

              <label style={{ fontSize: '12px' }}>SELECCIONAR SUMINISTRO:</label>
              <select
                className="hud-input"
                value={manifiestoData.suministro_id}
                onChange={e => setManifiestoData({ ...manifiestoData, suministro_id: e.target.value })}
                required
              >
                <option value="">-- SELECCIONAR --</option>
                {suministros.map(s => (
                  <option key={s.id} value={s.id}>{s.item} (Stock: {s.stock_disponible})</option>
                ))}
              </select>

              <label style={{ fontSize: '12px' }}>CANTIDAD REQUERIDA:</label>
              <input
                type="number"
                min="1"
                className="hud-input"
                value={manifiestoData.cantidad_requerida}
                onChange={e => setManifiestoData({ ...manifiestoData, cantidad_requerida: e.target.value })}
                required
              />

              <button type="submit" className="hud-button" style={{ width: '100%' }}>CARGAR AL MANIFIESTO</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}