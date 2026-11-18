<template>
  <div class="dashboard-container">
    <DashboardHeader
      :usuario="state.usuario"
      :api-base-url="state.apiBaseUrl"
      :tab="tab"
      :error="error"
      @update:tab="tab = $event"
      @logout="handleLogout"
    />

    <ResumenTab
      v-if="tab === 'resumen'"
      :suministros="suministros"
      :loading="loading"
      :total-unidades="totalUnidades"
      :articulos-sin-stock="articulosSinStock"
      :get-stock="getStock"
      @ver-inventario="tab = 'inventario'"
    />

    <InventarioTab
      v-if="tab === 'inventario'"
      :suministros="suministros"
      :loading="loading"
      :get-stock="getStock"
      @actualizar="cargarInventario"
    />

    <footer class="dashboard-footer">
      SISTEMA DE GESTIÓN DE INVENTARIO |
      <span>VUE 3</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';
import { dashboardService } from '../services/dashboardService';
import DashboardHeader from '../components/DashboardHeader.vue';
import ResumenTab from '../components/ResumenTab.vue';
import InventarioTab from '../components/InventarioTab.vue';

const router = useRouter();
const { state, logout } = useAuth();

const tab = ref('resumen');
const loading = ref(false);
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
  suministros.value.filter(item => getStock(item) <= 0).length
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
  cargarInventario();
});
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #c9d1d9;
}

.dashboard-footer {
  margin-top: 25px;
  text-align: center;
  color: #8b949e;
  font-size: 11px;
}

.dashboard-footer span {
  color: #58a6ff;
}
</style>