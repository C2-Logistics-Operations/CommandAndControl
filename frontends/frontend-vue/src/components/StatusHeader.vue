<template>
  <header class="hud-panel dashboard-header">
    <div>
      <h1 class="dashboard-title">{{ title }}</h1>
      <p class="dashboard-info">
        USUARIO: <span class="highlight">{{ username || 'USUARIO' }}</span>
        <span class="separator">|</span>
        ROL: <span class="role">{{ role || 'SIN ROL' }}</span>
      </p>
      <p v-if="server" class="dashboard-info">
        SERVIDOR: <span class="server">{{ server }}</span>
      </p>
    </div>
    <button class="hud-button logout-button" type="button" @click="$emit('logout')">
      DESCONECTAR
    </button>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  username: { type: String, default: '' },
  role: { type: String, default: '' },
  server: { type: String, default: '' }
});

defineEmits(['logout']);
</script>
