<template>
  <header class="hud-panel dashboard-header">
    <div>
      <h1 class="dashboard-title">[ TERMINAL VUE 3 ]</h1>

      <p class="dashboard-info">
        USUARIO:
        <span class="highlight">
          {{ usuario?.username || 'USUARIO' }}
        </span>

        <span class="separator">|</span>

        ROL:
        <span class="role">
          {{ usuario?.rol || 'SIN ROL' }}
        </span>
      </p>

      <p class="dashboard-info">
        SERVIDOR:
        <span class="server">
          {{ apiBaseUrl }}
        </span>
      </p>
    </div>

    <button
      class="hud-button logout-button"
      type="button"
      @click="$emit('logout')"
    >
      DESCONECTAR
    </button>
  </header>

  <nav class="dashboard-navigation">
    <button
      class="hud-button"
      :class="{ active: tab === 'resumen' }"
      @click="$emit('update:tab', 'resumen')"
    >
      RESUMEN
    </button>

    <button
      class="hud-button"
      :class="{ active: tab === 'inventario' }"
      @click="$emit('update:tab', 'inventario')"
    >
      INVENTARIO
    </button>
  </nav>

  <div
    v-if="error"
    class="hud-panel error-message"
    role="alert"
  >
    ⚠ {{ error }}
  </div>
</template>

<script setup>
defineProps({
  usuario: { type: Object, default: null },
  apiBaseUrl: { type: String, default: '' },
  tab: { type: String, required: true },
  error: { type: String, default: '' }
});

defineEmits(['logout', 'update:tab']);
</script>

<style scoped>
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

.highlight { color: #ffffff; }
.role { color: #39ff14; }
.server { color: #f0b429; overflow-wrap: anywhere; }
.separator { margin: 0 8px; }

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

.logout-button {
  border-color: #ff4d4d;
  color: #ff4d4d;
}

.error-message {
  margin-bottom: 20px;
  color: #ff4d4d;
  border-color: #ff4d4d;
}

@media (max-width: 700px) {
  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .dashboard-navigation {
    flex-wrap: wrap;
  }
}
</style>