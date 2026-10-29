import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    sourcemap: false,
    server: {
      deps: {
        inline: [/@exodus\/bytes/, /html-encoding-sniffer/]
      }
    }
  }
});