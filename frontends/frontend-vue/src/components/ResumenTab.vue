<template>
  <section>
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
          @click="$emit('ver-inventario')"
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
</template>

<script setup>
defineProps({
  suministros: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  totalUnidades: { type: Number, default: 0 },
  articulosSinStock: { type: Number, default: 0 },
  getStock: { type: Function, required: true }
});

defineEmits(['ver-inventario']);
</script>

<style scoped>
.hud-panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 20px;
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

@media (max-width: 700px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>