<template>
  <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
    <!-- Header HUD -->
    <div class="hud-panel" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h1 style="margin: 0; font-size: 20px;">[ TERMINAL VUE 3 - C2 ]</h1>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #8b949e;">
          OPERADOR: <span style="color: #fff;">{{ state.usuario?.username }}</span> | 
          ROL: <span style="color: var(--neon-green);">{{ state.usuario?.rol }}</span> |
          TARGET: <span style="color: var(--warning-amber);">{{ state.apiBaseUrl }}</span>
        </p>
      </div>
      <button class="hud-button" @click="handleLogout">DESCONECTAR</button>
    </div>

    <div v-if="error" class="hud-panel" style="border-color: var(--danger-red); color: var(--danger-red); margin-bottom: 20px;">⚠️ {{ error }}</div>

    <!-- Navegación por Pestañas -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
      <button class="hud-button" @click="tab = 'misiones'">MISIONES</button>
      <button class="hud-button" @click="tab = 'suministros'">ARSENAL</button>
      <button class="hud-button" @click="tab = 'escuadrones'">ESCUADRONES</button>
    </div>

    <!-- PESTAÑA: MISIONES -->
    <div v-if="tab === 'misiones'" :style="{ display: 'grid', gridTemplateColumns: esComandante ? '2fr 1fr' : '1fr', gap: '20px' }">
      <div class="hud-panel">
        <h3>[ MISIONES ACTIVAS ]</h3>
        <table style="width: 100%; text-align: left; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: #8b949e;">
              <th>ID</th><th>NOMBRE</th><th>PELIGRO</th><th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in misiones" :key="m.id" style="border-bottom: 1px solid #21262d; height: 40px;">
              <td>#{{ m.id }}</td>
              <td>{{ m.nombre }}</td>
              <td :style="{ color: m.rango_peligro === 'CRITICO' ? 'var(--danger-red)' : 'var(--neon-green)' }">{{ m.rango_peligro }}</td>
              <td>
                <strong :style="{
                  color: m.estado === 'READY' ? 'var(--neon-green)' : m.estado === 'HOLD' ? 'var(--warning-amber)' : '#fff',
                  padding: '2px 6px',
                  border: '1px solid ' + (m.estado === 'READY' ? 'var(--neon-green)' : m.estado === 'HOLD' ? 'var(--warning-amber)' : '#fff')
                }">{{ m.estado }}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Formularios Comandante -->
      <div v-if="esComandante" style="display: flex; flex-direction: column; gap: 20px;">
        <div class="hud-panel">
          <h3>[ ASIGNAR MANIFIESTO ]</h3>
          <form @submit.prevent="handleAsignarManifiesto">
            <label style="font-size: 12px;">MISIÓN:</label>
            <select v-model="manifiesto.mision_id" class="hud-input" required>
              <option value="">-- SELECCIONAR --</option>
              <option v-for="m in misiones" :key="m.id" :value="m.id">#{{ m.id }} - {{ m.nombre }}</option>
            </select>

            <label style="font-size: 12px;">SUMINISTRO:</label>
            <select v-model="manifiesto.suministro_id" class="hud-input" required>
              <option value="">-- SELECCIONAR --</option>
              <option v-for="s in suministros" :key="s.id" :value="s.id">{{ s.item }} (Stock: {{ s.stock_disponible }})</option>
            </select>

            <label style="font-size: 12px;">CANTIDAD:</label>
            <input v-model.number="manifiesto.cantidad_requerida" type="number" min="1" class="hud-input" required />

            <button type="submit" class="hud-button" style="width: 100%;">ACTUALIZAR MANIFIESTO</button>
          </form>
        </div>
      </div>
    </div>

    <!-- PESTAÑA: SUMINISTROS -->
    <div v-if="tab === 'suministros'" class="hud-panel">
      <h3>[ INVENTARIO DEL ARSENAL ]</h3>
      <table style="width: 100%; text-align: left; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); color: #8b949e;">
            <th>ID</th><th>ITEM</th><th>CATEGORÍA</th><th>STOCK DISPONIBLE</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in suministros" :key="s.id" style="border-bottom: 1px solid #21262d; height: 40px;">
            <td>#{{ s.id }}</td>
            <td>{{ s.item }}</td>
            <td>{{ s.categoria }}</td>
            <td :style="{ color: s.stock_disponible > 0 ? 'var(--neon-green)' : 'var(--danger-red)' }">
              <strong>{{ s.stock_disponible }} UNIDADES</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PESTAÑA: ESCUADRONES -->
    <div v-if="tab === 'escuadrones'" class="hud-panel">
      <h3>[ ESCUADRONES REGISTRADOS ]</h3>
      <table style="width: 100%; text-align: left; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); color: #8b949e;">
            <th>ID</th><th>CÓDIGO</th><th>ESPECIALIDAD</th><th>MISIÓN</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in escuadrones" :key="e.id" style="border-bottom: 1px solid #21262d; height: 40px;">
            <td>#{{ e.id }}</td>
            <td><strong>{{ e.nombre_codigo }}</strong></td>
            <td>{{ e.especialidad }}</td>
            <td>{{ e.mision_id ? `#${e.mision_id}` : 'SIN ASIGNAR' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';

const { state, esComandante, logout } = useAuth();
const router = useRouter();

const tab = ref('misiones');
const error = ref('');
const misiones = ref([]);
const suministros = ref([]);
const escuadrones = ref([]);

const manifiesto = ref({ mision_id: '', suministro_id: '', cantidad_requerida: 1 });

const apiFetch = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(state.token && { 'Authorization': `Bearer ${state.token}` }),
    ...options.headers
  };
  const res = await fetch(`${state.apiBaseUrl}${endpoint}`, { ...options, headers });
  if (res.status === 401) {
    logout();
    router.push('/login');
    throw new Error('Sesión revocada o expirada');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Error en solicitud');
  return data;
};

const cargarTodo = async () => {
  try {
    error.value = '';
    const [dMisiones, dSuministros, dEscuadrones] = await Promise.all([
      apiFetch('/misiones'),
      apiFetch('/suministros'),
      apiFetch('/escuadrones')
    ]);
    misiones.value = dMisiones;
    suministros.value = dSuministros;
    escuadrones.value = dEscuadrones;
  } catch (err) {
    error.value = err.message;
  }
};

const handleAsignarManifiesto = async () => {
  try {
    await apiFetch(`/misiones/${manifiesto.value.mision_id}/manifiesto`, {
      method: 'POST',
      body: JSON.stringify({
        suministro_id: Number(manifiesto.value.suministro_id),
        cantidad_requerida: Number(manifiesto.value.cantidad_requerida)
      })
    });
    cargarTodo();
  } catch (err) {
    error.value = err.message;
  }
};

const handleLogout = () => {
  logout();
  router.push('/login');
};

onMounted(() => {
  cargarTodo();
});
</script>