// Corregido para evitar fallos de case-sensitivity en Linux / Docker
import { api } from '../services/api';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchConAuth } from '../services/api';
import DashboardHeader from '../components/DashboardHeader';
import MisionesTab from '../components/MisionesTab';
import SuministrosTab from '../components/SuministrosTab';
import EscuadronesTab from '../components/EscuadronesTab';


export default function Dashboard() {
  const { usuario, logout } = useContext(AuthContext);
  const [tab, setTab] = useState('misiones');

  const [misiones, setMisiones] = useState([]);
  const [suministros, setSuministros] = useState([]);
  const [escuadrones, setEscuadrones] = useState([]);
  const [error, setError] = useState('');

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
    const ws = new WebSocket('ws://localhost:3000');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'MISSION_STATE_CHANGED') {
        setMisiones((prevMisiones) =>
          prevMisiones.map((mision) =>
            mision.id === data.mision_id ? { ...mision, estado: data.nuevo_estado } : mision
          )
        );
      }
    };

    return () => ws.close();
  }, []);

  const handleCrearMision = async (nuevaMision) => {
    try {
      await fetchConAuth('/misiones', {
        method: 'POST',
        body: JSON.stringify(nuevaMision)
      });
      await cargarDatos();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleCrearSuministro = async (nuevoSuministro) => {
    try {
      await fetchConAuth('/suministros', {
        method: 'POST',
        body: JSON.stringify(nuevoSuministro)
      });
      await cargarDatos();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleAsignarManifiesto = async (manifiestoData) => {
    try {
      await fetchConAuth(`/misiones/${manifiestoData.mision_id}/manifiesto`, {
        method: 'POST',
        body: JSON.stringify({
          suministro_id: parseInt(manifiestoData.suministro_id, 10),
          cantidad_requerida: parseInt(manifiestoData.cantidad_requerida, 10)
        })
      });
      await cargarDatos();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <DashboardHeader
        usuario={usuario}
        logout={logout}
        error={error}
        tab={tab}
        setTab={setTab}
      />

      {tab === 'misiones' && (
        <MisionesTab
          misiones={misiones}
          suministros={suministros}
          esComandante={esComandante}
          onCrearMision={handleCrearMision}
          onAsignarManifiesto={handleAsignarManifiesto}
        />
      )}

      {tab === 'suministros' && (
        <SuministrosTab
          suministros={suministros}
          esComandante={esComandante}
          onCrearSuministro={handleCrearSuministro}
        />
      )}

      {tab === 'escuadrones' && (
        <EscuadronesTab escuadrones={escuadrones} />
      )}
    </div>
  );
}