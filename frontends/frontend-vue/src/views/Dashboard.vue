<template>
  <div class="dashboard-container">
    <StatusHeader
      title="[ GESTIÓN DE INVENTARIO ]"
      :username="state.usuario?.username"
      :role="state.usuario?.rol"
      :server="state.apiBaseUrl"
      @logout="handleLogout"
    />

    <nav class="dashboard-navigation" aria-label="Secciones del inventario">
      <button
        class="hud-button"
        :class="{ active: tab === 'resumen' }"
        type="button"
        @click="tab = 'resumen'"
      >
        RESUMEN
      </button>
      <button
        class="hud-button"
        :class="{ active: tab === 'inventario' }"
        type="button"
        @click="tab = 'inventario'"
      >
        INVENTARIO
      </button>
    </nav>

    <section v-if="tab === 'resumen'" class="dashboard-grid" aria-label="Resumen del inventario">
      <article class="hud-panel summary-card">
        <h3>ARTÍCULOS REGISTRADOS</h3>
        <p class="summary-value">{{ suministros.length }}</p>
      </article>
      <article class="hud-panel summary-card">
        <h3>UNIDADES DISPONIBLES</h3>
        <p class="summary-value">{{ totalUnidades }}</p>
      </article>
      <article class="hud-panel summary-card">
        <h3>ARTÍCULOS SIN STOCK</h3>
        <p class="summary-value warning">{{ articulosSinStock }}</p>
      </article>
    </section>

    <section class="hud-panel">
      <div class="section-header">
        <h2>{{ tab === 'resumen' ? '[ INVENTARIO RECIENTE ]' : '[ INVENTARIO GENERAL ]' }}</h2>
        <button
          class="hud-button"
          type="button"
          :disabled="loading"
          @click="cargarInventario"
        >
          {{ loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR' }}
        </button>
      </div>
      <SupplyTable :items="visibleItems" :loading="loading" :error="error" />
      <button
        v-if="tab === 'resumen' && suministros.length > 5"
        class="hud-button view-all-button"
        type="button"
        @click="tab = 'inventario'"
      >
        VER INVENTARIO COMPLETO
      </button>
    </section>

    <footer class="dashboard-footer">
      SISTEMA DE GESTIÓN DE INVENTARIO | VUE 3
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';
import { dashboardService } from '../services/dashboardService';
import StatusHeader from '../components/StatusHeader.vue';
import SupplyTable from '../components/SupplyTable.vue';

const router = useRouter();
const { state, logout } = useAuth();

const tab = ref('resumen');
const loading = ref(true);
const error = ref('');
const suministros = ref([]);

const getStock = (item) => {
  const stock = Number(item.stock_disponible ?? item.cantidad ?? 0);
  return Number.isFinite(stock) ? stock : 0;
};

const totalUnidades = computed(() =>
  suministros.value.reduce((total, item) => total + getStock(item), 0)
);

const articulosSinStock = computed(() =>
  suministros.value.filter((item) => getStock(item) <= 0).length
);

const visibleItems = computed(() =>
  tab.value === 'resumen' ? suministros.value.slice(0, 5) : suministros.value
);

const cargarInventario = async () => {
  if (loading.value) return;
  loading.value = true;
  error.value = '';

  try {
    const data = await dashboardService.fetchSuministros(
      state.token,
      state.apiBaseUrl
    );
    if (!Array.isArray(data)) {
      throw new Error('La respuesta del inventario no es válida.');
    }
    suministros.value = data;
  } catch (err) {
    if (err.status === 401) {
      logout();
      await router.push('/login');
      return;
    }
    error.value = err.message || 'No se pudo cargar el inventario.';
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  logout();
  await router.push('/login');
};

onMounted(() => {
  if (!state.token) {
    router.replace('/login');
    return;
  }
  cargarInventario();
});
</script>

<style scoped>
.dashboard-container { max-width: 1200px; margin: 0 auto; padding: 20px; color: #c9d1d9; }
.hud-panel { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 20px; }
.dashboard-navigation { display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0; }
.hud-button { padding: 10px 16px; background: transparent; border: 1px solid #39ff14; border-radius: 4px; color: #39ff14; cursor: pointer; font-weight: bold; }
.hud-button:hover, .hud-button.active { background: #39ff1420; }
.hud-button:disabled { opacity: .5; cursor: not-allowed; }
.dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
.summary-card h3 { font-size: 12px; color: #8b949e; }
.summary-value { margin: 0; color: #39ff14; font-size: 30px; font-weight: bold; }
.summary-value.warning { color: #f0b429; }
.section-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.section-header h2 { margin: 0; font-size: 16px; }
.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { color: #8b949e; border-bottom: 1px solid #30363d; padding: 12px 8px; font-size: 12px; }
td { padding: 12px 8px; border-bottom: 1px solid #21262d; }
.status-available { color: #39ff14; }
.status-empty, .error-message { color: #ff4d4d; }
.loading-message, .empty-message { padding: 25px 0; text-align: center; color: #8b949e; }
.view-all-button { margin-top: 16px; }
.dashboard-footer { margin-top: 25px; text-align: center; color: #8b949e; font-size: 11px; }
@media (max-width: 700px) { .dashboard-grid { grid-template-columns: 1fr; } .section-header { align-items: flex-start; flex-direction: column; } }
</style>
