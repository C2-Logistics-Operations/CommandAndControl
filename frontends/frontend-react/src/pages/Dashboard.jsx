import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import DashboardHeader from '../components/DashboardHeader';
import SupplyTable from '../components/SupplyTable';

export default function Dashboard() {
  const { token, usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [suministros, setSuministros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarInventario = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/suministros');
      if (!Array.isArray(data)) {
        throw new Error('La respuesta del inventario no tiene un formato válido.');
      }
      setSuministros(data);
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message || 'No se pudo cargar el inventario.');
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    cargarInventario();
  }, [token, navigate, cargarInventario]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const totalUnidades = suministros.reduce(
    (total, item) => total + Number(item.stock_disponible ?? item.cantidad ?? 0),
    0
  );
  const sinStock = suministros.filter(
    (item) => Number(item.stock_disponible ?? item.cantidad ?? 0) <= 0
  ).length;

  return (
    <div className="dashboard-container">
      <DashboardHeader
        title="[ GESTIÓN DE INVENTARIO ]"
        usuario={usuario}
        onLogout={handleLogout}
      />
      <main>
        <div className="dashboard-section-heading">
          <h2>Inventario de suministros</h2>
          <button
            type="button"
            className="hud-button"
            onClick={cargarInventario}
            disabled={loading}
          >
            {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
          </button>
        </div>

        {error && <p className="error-message" role="alert">{error}</p>}

        <section className="dashboard-grid" aria-label="Resumen del inventario">
          <article className="hud-panel">
            <h3>ARTÍCULOS REGISTRADOS</h3>
            <p className="summary-value">{suministros.length}</p>
          </article>
          <article className="hud-panel">
            <h3>UNIDADES DISPONIBLES</h3>
            <p className="summary-value">{totalUnidades}</p>
          </article>
          <article className="hud-panel">
            <h3>ARTÍCULOS SIN STOCK</h3>
            <p className="summary-value">{sinStock}</p>
          </article>
        </section>

        <section className="hud-panel">
          <SupplyTable items={suministros} loading={loading} />
        </section>
      </main>
    </div>
  );
}
