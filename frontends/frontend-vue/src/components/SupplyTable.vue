<template>
  <div class="table-container">
    <p v-if="loading" class="loading-message" role="status">
      CONSULTANDO INVENTARIO...
    </p>
    <p v-else-if="error" class="error-message" role="alert">{{ error }}</p>
    <p v-else-if="items.length === 0" class="empty-message">
      NO HAY ARTÍCULOS REGISTRADOS.
    </p>
    <table v-else class="supply-table">
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
        <tr v-for="item in items" :key="item.id">
          <td>#{{ item.id }}</td>
          <td>{{ item.item ?? item.nombre ?? 'SIN NOMBRE' }}</td>
          <td>{{ item.categoria ?? 'SIN CATEGORÍA' }}</td>
          <td>{{ getStock(item) }} UNIDADES</td>
          <td>
            <strong :class="getStock(item) > 0 ? 'status-available' : 'status-empty'">
              {{ getStock(item) > 0 ? 'DISPONIBLE' : 'SIN STOCK' }}
            </strong>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' }
});

const getStock = (item) => {
  const stock = Number(item.stock_disponible ?? item.cantidad ?? 0);
  return Number.isFinite(stock) ? stock : 0;
};
</script>
