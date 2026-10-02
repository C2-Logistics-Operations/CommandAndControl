<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
    <div class="hud-panel" style="width: 350px;">
      <h2 style="text-align: center; margin-top: 0;">[ C2 VUE COMMAND ]</h2>
      <p style="font-size: 12px; text-align: center; color: #8b949e;">AUTENTICACIÓN DE OPERADOR</p>

      <div v-if="error" style="color: var(--danger-red); margin-bottom: 15px; font-size: 12px;">⚠️ {{ error }}</div>

      <form @submit.prevent="handleLogin">
        <label style="font-size: 12px;">USUARIO:</label>
        <input v-model="username" type="text" class="hud-input" required />

        <label style="font-size: 12px;">CLAVE DE ACCESO:</label>
        <input v-model="password" type="password" class="hud-input" required />

        <label style="font-size: 12px;">SERVIDOR TARGET:</label>
        <select v-model="selectedBackend" class="hud-input" @change="setBackend(selectedBackend)">
          <option value="http://localhost:8000/api/v1">BACKEND B (FastAPI - 8000)</option>
          <option value="http://localhost:3000/api/v1">BACKEND A (Express - 3000)</option>
        </select>

        <button type="submit" class="hud-button" style="width: 100%;">CONECTAR</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';

const username = ref('');
const password = ref('');
const error = ref('');
const { state, login, setBackend } = useAuth();
const selectedBackend = ref(state.apiBaseUrl);
const router = useRouter();

const handleLogin = async () => {
  error.value = '';
  try {
    const res = await fetch(`${state.apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.error || 'Credenciales inválidas');
    
    login(data.token, data.usuario);
    router.push('/dashboard');
  } catch (err) {
    error.value = err.message;
  }
};
</script>