```vue
<template>
  <div class="login-container">
    <div class="hud-panel login-panel">

      <h2 class="login-title">[ C2 VUE COMMAND ]</h2>

      <p class="login-subtitle">
        AUTENTICACIÓN DE OPERADOR
      </p>

      <div
        v-if="error"
        class="login-error"
        role="alert"
      >
        ⚠️ {{ error }}
      </div>

      <form @submit.prevent="handleLogin">

        <label for="username">
          USUARIO:
        </label>

        <input
          id="username"
          v-model.trim="username"
          type="text"
          class="hud-input"
          placeholder="Ingrese su usuario"
          autocomplete="username"
          required
          :disabled="loading"
        />

        <label for="password">
          CLAVE DE ACCESO:
        </label>

        <input
          id="password"
          v-model="password"
          type="password"
          class="hud-input"
          placeholder="Ingrese su contraseña"
          autocomplete="current-password"
          required
          :disabled="loading"
        />

        <label for="backend">
          SERVIDOR TARGET:
        </label>

        <select
          id="backend"
          v-model="selectedBackend"
          class="hud-input"
          :disabled="loading"
          @change="handleBackendChange"
        >
          <option :value="backendFastAPI">
            BACKEND B (FastAPI - 8000)
          </option>

          <option :value="backendExpress">
            BACKEND A (Express - 3000)
          </option>
        </select>

        <button
          type="submit"
          class="hud-button login-button"
          :disabled="loading"
        >
          {{ loading ? 'AUTENTICANDO...' : 'CONECTAR' }}
        </button>

      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';

const router = useRouter();

const {
  state,
  authenticate,
  setBackend
} = useAuth();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const backendFastAPI =
  import.meta.env.VITE_FASTAPI_API_URL ||
  'http://localhost:8000/api/v1';

const backendExpress =
  import.meta.env.VITE_EXPRESS_API_URL ||
  'http://localhost:3000/api/v1';

const selectedBackend = ref(state.apiBaseUrl);

const handleBackendChange = () => {
  setBackend(selectedBackend.value);
  error.value = '';
};

const handleLogin = async () => {
  if (loading.value) return;

  error.value = '';
  loading.value = true;

  try {
    await authenticate({
      username: username.value,
      password: password.value
    });

    await router.push('/dashboard');

  } catch (err) {
    error.value =
      err.message || 'Credenciales inválidas.';

  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-panel {
  width: 350px;
  max-width: 100%;
}

.login-title {
  text-align: center;
  margin-top: 0;
}

.login-subtitle {
  font-size: 12px;
  text-align: center;
  color: #8b949e;
}

.login-panel label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
}

.login-panel .hud-input {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 15px;
}

.login-error {
  color: var(--danger-red);
  margin-bottom: 15px;
  font-size: 12px;
}

.login-button {
  width: 100%;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```