<template>
  <div class="dashboard-container">

    <!-- ENCABEZADO -->
    <header class="hud-panel dashboard-header">
      <div>
        <h1 class="dashboard-title">[ TERMINAL VUE 3 ]</h1>

        <p class="dashboard-info">
          USUARIO:
          <span class="highlight">
            {{ state.usuario?.username || 'USUARIO' }}
          </span>

          <span class="separator">|</span>

          ROL:
          <span class="role">
            {{ state.usuario?.rol || 'SIN ROL' }}
          </span>
        </p>

        <p class="dashboard-info">
          SERVIDOR:
          <span class="server">
            {{ state.apiBaseUrl }}
          </span>
        </p>
      </div>

      <button
        class="hud-button logout-button"
        type="button"
        @click="handleLogout"
      >
        DESCONECTAR
      </button>
    </header>

    <!-- NAVEGACIÓN -->
    <nav class="dashboard-navigation">
      <button
        class="hud-button"
        :class="{ active: tab === 'resumen' }"
        @click="tab = 'resumen'"
      >
        RESUMEN
      </button>

      <button
        class="hud-button"
        :class="{ active: tab === 'inventario' }"
        @click="tab = 'inventario'"
      >
        INVENTARIO
      </button>
    </nav>

    <!-- MENSAJES -->
    <div
      v-if="error"
      class="hud-panel error-message"
      role="alert"
    >
      ⚠ {{ error }}
    </div>

    <!-- RESUMEN -->
    <section v-if="tab === 'resumen'">

      <div class="dashboard-grid">

        <article class="hud-panel summary-card">
          <h3>ARTÍCULOS REGISTRADOS</h3>
          <p class="summary-value">
            {{ suministros.length }}
          </p>
        </article>

        <article class="hud-panel summary-card">
          <h3>UNIDADES DISPONIBLES</h3>
          <p class="summary-value">
            {{ totalUnidades }}
          </p>
        </article>

        <article class="hud-panel summary-card">
          <h3>ARTÍCULOS SIN STOCK</h3>
          <p class="summary-value warning">
            {{ articulosSinStock }}
          </p>
        </article>

      </div>

      <div class="hud-panel inventory-preview">
        <div class="section-header">
          <h3>[ INVENTARIO RECIENTE ]</h3>

          <button
            class="hud-button"
            type="button"
            @click="tab = 'inventario'"
          >
            VER INVENTARIO
          </button>
        </div>

        <p v-if="!loading && suministros.length === 0">
          No hay artículos registrados.
        </p>

        <table v-else-if="suministros.length">
          <thead>
            <tr>
              <th>ID</th>
              <th>ARTÍCULO</th>
              <th>STOCK</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in suministros.slice(0, 5)"
              :key="item.id"
            >
              <td>#{{ item.id }}</td>
              <td>{{ item.item ?? item.nombre }}</td>
              <td>{{ getStock(item) }} UNIDADES</td>
            </tr>
          </tbody>
        </table>
      </div>

    </section>

    <!-- INVENTARIO -->
    <section
      v-if="tab === 'inventario'"
      class="hud-panel"
    >
      <div class="section-header">
        <h3>[ INVENTARIO GENERAL ]</h3>

        <button
          class="hud-button"
          type="button"
          @click="cargarInventario"
          :disabled="loading"
        >
          {{ loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR' }}
        </button>
      </div>

      <div v-if="loading" class="loading-message">
        CONSULTANDO INVENTARIO...
      </div>

      <div
        v-else-if="suministros.length === 0"
        class="empty-message"
      >
        NO HAY ARTÍCULOS REGISTRADOS.
      </div>

      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>ARTÍCULO</th>
              <th>CATEGORÍA</th>
              <th>STOCK DISPONIBLE</th>
              <th>ESTADO</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in suministros"
              :key="item.id"
            >
              <td>#{{ item.id }}</td>

              <td>
                {{ item.item ?? item.nombre ?? 'SIN NOMBRE' }}
              </td>

              <td>
                {{ item.categoria ?? 'SIN CATEGORÍA' }}
              </td>

              <td>
                {{ getStock(item) }} UNIDADES
              </td>

              <td>
                <strong
                  :class="getStock(item) > 0
                    ? 'status-available'
                    : 'status-empty'"
                >
                  {{ getStock(item) > 0
                    ? 'DISPONIBLE'
                    : 'SIN STOCK' }}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- PIE -->
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

const router = useRouter();

const { state, logout } = useAuth();

// Estado de la interfaz
const tab = ref('resumen');
const loading = ref(false);
const error = ref('');
const suministros = ref([]);

// Indicadores del inventario
const totalUnidades = computed(() =>
  suministros.value.reduce(
    (total, item) => total + getStock(item),
    0
  )
);

const articulosSinStock = computed(() =>
  suministros.value.filter(item => getStock(item) <= 0).length
);

// Compatibilidad con los nombres de campos de la API
const getStock = (item) => {
  const stock = Number(
    item.stock_disponible ?? item.cantidad ?? 0
  );

  return Number.isFinite(stock) ? stock : 0;
};

// Cargar inventario mediante el servicio
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

    error.value =
      err.message || 'No se pudo cargar el inventario.';
  }
};

// Cierre de sesión
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

.hud-panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.dashboard-title {
  margin: 0;
  font-size: 20px;
  color: #58a6ff;
}

.dashboard-info {
  margin: 8px 0 0;
  font-size: 12px;
  color: #8b949e;
}

.highlight {
  color: #ffffff;
}

.role {
  color: #39ff14;
}

.server {
  color: #f0b429;
  overflow-wrap: anywhere;
}

.separator {
  margin: 0 8px;
}

.dashboard-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.hud-button {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid #39ff14;
  border-radius: 4px;
  color: #39ff14;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.hud-button:hover,
.hud-button.active {
  background: #39ff1420;
}

.hud-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.logout-button {
  border-color: #ff4d4d;
  color: #ff4d4d;
}

.error-message {
  margin-bottom: 20px;
  color: #ff4d4d;
  border-color: #ff4d4d;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.summary-card h3 {
  font-size: 12px;
  color: #8b949e;
}

.summary-value {
  font-size: 30px;
  font-weight: bold;
  color: #39ff14;
  margin-bottom: 0;
}

.summary-value.warning {
  color: #f0b429;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  color: #8b949e;
  border-bottom: 1px solid #30363d;
  padding: 12px 8px;
  font-size: 12px;
}

td {
  padding: 12px 8px;
  border-bottom: 1px solid #21262d;
  height: 35px;
}

.status-available {
  color: #39ff14;
}

.status-empty {
  color: #ff4d4d;
}

.loading-message,
.empty-message {
  padding: 25px 0;
  text-align: center;
  color: #8b949e;
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

@media (max-width: 700px) {
  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-navigation {
    flex-wrap: wrap;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    min-width: 600px;
  }
}
</style>
