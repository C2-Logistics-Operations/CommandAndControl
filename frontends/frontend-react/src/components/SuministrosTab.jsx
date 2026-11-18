import { useState } from 'react';

export default function SuministrosTab({ suministros, esComandante, onCrearSuministro }) {
  const [nuevoSuministro, setNuevoSuministro] = useState({ item: '', categoria: 'ARMAMENTO', stock_disponible: 0 });

  const handleSubmitSuministro = async (e) => {
    e.preventDefault();
    const ok = await onCrearSuministro(nuevoSuministro);
    if (ok) {
      setNuevoSuministro({ item: '', categoria: 'ARMAMENTO', stock_disponible: 0 });
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: esComandante ? '2fr 1fr' : '1fr', gap: '20px' }}>
      <div className="hud-panel">
        <h3>[ INVENTARIO DE ARSENAL ]</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#8b949e' }}>
              <th>ID</th>
              <th>ITEM</th>
              <th>CATEGORÍA</th>
              <th>STOCK DISPONIBLE</th>
            </tr>
          </thead>
          <tbody>
            {suministros.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #21262d', height: '40px' }}>
                <td>#{s.id}</td>
                <td>{s.item}</td>
                <td>{s.categoria}</td>
                <td style={{ color: s.stock_disponible > 0 ? 'var(--neon-green)' : 'var(--danger-red)' }}>
                  <strong>{s.stock_disponible} UNIDADES</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {esComandante && (
        <div className="hud-panel">
          <h3>[ INGRESO DE SUMINISTRO ]</h3>
          <form onSubmit={handleSubmitSuministro}>
            <label style={{ fontSize: '12px' }}>NOMBRE DEL ITEM:</label>
            <input
              type="text"
              className="hud-input"
              value={nuevoSuministro.item}
              onChange={e => setNuevoSuministro({ ...nuevoSuministro, item: e.target.value })}
              required
            />

            <label style={{ fontSize: '12px' }}>CATEGORÍA:</label>
            <select
              className="hud-input"
              value={nuevoSuministro.categoria}
              onChange={e => setNuevoSuministro({ ...nuevoSuministro, categoria: e.target.value })}
            >
              <option value="ARMAMENTO">ARMAMENTO</option>
              <option value="ALIMENTO">ALIMENTO</option>
              <option value="EQUIPAMIENTO">EQUIPAMIENTO</option>
            </select>

            <label style={{ fontSize: '12px' }}>STOCK INICIAL:</label>
            <input
              type="number"
              min="0"
              className="hud-input"
              value={nuevoSuministro.stock_disponible}
              onChange={e => setNuevoSuministro({ ...nuevoSuministro, stock_disponible: parseInt(e.target.value, 10) || 0 })}
              required
            />

            <button type="submit" className="hud-button" style={{ width: '100%' }}>INGRESAR AL ARSENAL</button>
          </form>
        </div>
      )}
    </div>
  );
}