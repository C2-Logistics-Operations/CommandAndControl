<template>
  <section class="hud-panel">
    <div class="section-header">
      <h3>[ INVENTARIO GENERAL ]</h3>

      <button
        class="hud-button"
        type="button"
        @click="$emit('actualizar')"
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
</template>

<script setup>
defineProps({
  suministros: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  getStock: { type: Function, required: true }
});

defineEmits(['actualizar']);
</script>

<style scoped>
.hud-panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 20px;
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

.hud-button:hover {
  background: #39ff1420;
}

.hud-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.status-available { color: #39ff14; }
.status-empty { color: #ff4d4d; }

.loading-message,
.empty-message {
  padding: 25px 0;
  text-align: center;
  color: #8b949e;
}

@media (max-width: 700px) {
  .table-container {
    overflow-x: auto;
  }

  table {
    min-width: 600px;
  }
}
</style>