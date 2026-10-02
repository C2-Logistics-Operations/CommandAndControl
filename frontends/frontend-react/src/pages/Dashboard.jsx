import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchConAuth } from '../services/api';

export default function Dashboard() {
  const { usuario, logout } = useContext(AuthContext);
  const [tab, setTab] = useState('misiones');
  
  // Estados de Datos
  const [misiones, setMisiones] = useState([]);
  const [suministros, setSuministros] = useState([]);
  const [escuadrones, setEscuadrones] = useState([]);
  const [error, setError] = useState('');

  // Estados de Formularios (Comandante)
  const [nuevaMision, setNuevaMision] = useState({ nombre: '', rango_peligro: 'BAJO' });
  const [nuevoSuministro, setNuevoSuministro] = useState({ item: '', categoria: 'ARMAMENTO', stock_disponible: 0 });
  const [manifiestoData, setManifiestoData] = useState({ mision_id: '', suministro_id: '', cantidad_requerida: 1 });

  const esComandante = usuario?.rol === 'COMANDANTE';

  const cargarDatos = async () => {
    try {
      setError('');
      const [dataMisiones, dataSuministros, dataEscuadrones] = await Promise.all([
        fetchConAuth('/misiones'),
        fetchConAuth('/suministros'),
        fetchConAuth('/escuadrones')
      ]);
      setMisiones(dataMisiones);
      setSuministros(dataSuministros);
      setEscuadrones(dataEscuadrones);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Handlers
  const handleCrearMision = async (e) => {
    e.preventDefault();
    try {
      await fetchConAuth('/misiones', {
        method: 'POST',
        body: JSON.stringify(nuevaMision)
      });
      setNuevaMision({ nombre: '', rango_peligro: 'BAJO' });
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCrearSuministro = async (e) => {
    e.preventDefault();
    try {
      await fetchConAuth('/suministros', {
        method: 'POST',
        body: JSON.stringify(nuevoSuministro)
      });
      setNuevoSuministro({ item: '', categoria: 'ARMAMENTO', stock_disponible: 0 });
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAsignarManifiesto = async (e) => {
    e.preventDefault();
    try {
      await fetchConAuth(`/misiones/${manifiestoData.mision_id}/manifiesto`, {
        method: 'POST',
        body: JSON.stringify({
          suministro_id: parseInt(manifiestoData.suministro_id),
          cantidad_requerida: parseInt(manifiestoData.cantidad_requerida)
        })
      });
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header HUD */}
      <div className="hud-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>[ CENTRO DE CONTROL C2 ]</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#8b949e' }}>
            OPERADOR: <span style={{ color: '#fff' }}>{usuario?.username}</span> | ROL: <span style={{ color: 'var(--neon-green)' }}>{usuario?.rol}</span>
          </p>
        </div>
        <button className="hud-button" onClick={logout}>DESCONECTAR</button>
      </div>

      {error && <div className="hud-panel" style={{ borderColor: 'var(--danger-red)', color: 'var(--danger-red)', marginBottom: '20px' }}>⚠️ {error}</div>}

      {/* Pestañas de Navegación */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={`hud-button ${tab === 'misiones' ? 'active' : ''}`} onClick={() => setTab('misiones')}>MISIONES</button>
        <button className={`hud-button ${tab === 'suministros' ? 'active' : ''}`} onClick={() => setTab('suministros')}>ARSENAL / STOCK</button>
        <button className={`hud-button ${tab === 'escuadrones' ? 'active' : ''}`} onClick={() => setTab('escuadrones')}>ESCUADRONES</button>
      </div>

      {/* TAB: MISIONES */}
      {tab === 'misiones' && (
        <div style={{ display: 'grid', gridTemplateColumns: esComandante ? '2fr 1fr' : '1fr', gap: '20px' }}>
          <div className="hud-panel">
            <h3>[ OPERACIONES TÁCTICAS ]</h3>
            <table style={{ width: '100%', textAling: 'left', borderCollapse: 'collapse' }}>
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
                    <td><span style={{ color: m.rango_peligro === 'CRITICO' ? 'var(--danger-red)' : 'var(--neon-green)' }}>{m.rango_peligro}</span></td>
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
                <form onSubmit={handleCrearMision}>
                  <label style={{ fontSize: '12px' }}>NOMBRE DE LA OPERACIÓN:</label>
                  <input type="text" className="hud-input" value={nuevaMision.nombre} onChange={e => setNuevaMision({...nuevaMision, nombre: e.target.value})} required />
                  
                  <label style={{ fontSize: '12px' }}>RANGO DE PELIGRO:</label>
                  <select className="hud-input" value={nuevaMision.rango_peligro} onChange={e => setNuevaMision({...nuevaMision, rango_peligro: e.target.value})}>
                    <option value="BAJO">BAJO</option>
                    <option value="MEDIO">MEDIO</option>
                    <option value="CRITICO">CRÍTICO</option>
                  </select>

                  <button type="submit" className="hud-button" style={{ width: '100%' }}>DESPLEGAR MISIÓN</button>
                </form>
              </div>

              <div className="hud-panel">
                <h3>[ ASIGNAR MANIFIESTO ]</h3>
                <form onSubmit={handleAsignarManifiesto}>
                  <label style={{ fontSize: '12px' }}>SELECCIONAR MISIÓN:</label>
                  <select className="hud-input" value={manifiestoData.mision_id} onChange={e => setManifiestoData({...manifiestoData, mision_id: e.target.value})} required>
                    <option value="">-- SELECCIONAR --</option>
                    {misiones.map(m => <option key={m.id} value={m.id}>#{m.id} - {m.nombre}</option>)}
                  </select>

                  <label style={{ fontSize: '12px' }}>SELECCIONAR SUMINISTRO:</label>
                  <select className="hud-input" value={manifiestoData.suministro_id} onChange={e => setManifiestoData({...manifiestoData, suministro_id: e.target.value})} required>
                    <option value="">-- SELECCIONAR --</option>
                    {suministros.map(s => <option key={s.id} value={s.id}>{s.item} (Stock: {s.stock_disponible})</option>)}
                  </select>

                  <label style={{ fontSize: '12px' }}>CANTIDAD REQUERIDA:</label>
                  <input type="number" min="1" className="hud-input" value={manifiestoData.cantidad_requerida} onChange={e => setManifiestoData({...manifiestoData, cantidad_requerida: e.target.value})} required />

                  <button type="submit" className="hud-button" style={{ width: '100%' }}>CARGAR AL MANIFIESTO</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: SUMINISTROS */}
      {tab === 'suministros' && (
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
              <form onSubmit={handleCrearSuministro}>
                <label style={{ fontSize: '12px' }}>NOMBRE DEL ITEM:</label>
                <input type="text" className="hud-input" value={nuevoSuministro.item} onChange={e => setNuevoSuministro({...nuevoSuministro, item: e.target.value})} required />

                <label style={{ fontSize: '12px' }}>CATEGORÍA:</label>
                <select className="hud-input" value={nuevoSuministro.categoria} onChange={e => setNuevoSuministro({...nuevoSuministro, categoria: e.target.value})}>
                  <option value="ARMAMENTO">ARMAMENTO</option>
                  <option value="ALIMENTO">ALIMENTO</option>
                  <option value="EQUIPAMIENTO">EQUIPAMIENTO</option>
                </select>

                <label style={{ fontSize: '12px' }}>STOCK INICIAL:</label>
                <input type="number" min="0" className="hud-input" value={nuevoSuministro.stock_disponible} onChange={e => setNuevoSuministro({...nuevoSuministro, stock_disponible: parseInt(e.target.value)})} required />

                <button type="submit" className="hud-button" style={{ width: '100%' }}>INGRESAR AL ARSENAL</button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB: ESCUADRONES */}
      {tab === 'escuadrones' && (
        <div className="hud-panel">
          <h3>[ ESCUADRONES REGISTRADOS ]</h3>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#8b949e' }}>
                <th>ID</th>
                <th>CÓDIGO</th>
                <th>ESPECIALIDAD</th>
                <th>MISIÓN ASIGNADA</th>
              </tr>
            </thead>
            <tbody>
              {escuadrones.map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid #21262d', height: '40px' }}>
                  <td>#{e.id}</td>
                  <td><strong>{e.nombre_codigo}</strong></td>
                  <td>{e.especialidad}</td>
                  <td>{e.mision_id ? `#${e.mision_id}` : 'SIN ASIGNAR'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}