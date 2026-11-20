import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'json', 'json-summary', 'lcov'],
      include: ['src/**/*.{js,vue}'],
      exclude: [
        'src/main.js',
        'src/**/__test__/**',
        'src/**/__tests__/**',
        'src/**/*.spec.{js,ts}',
        'src/**/*.test.{js,ts}'
      ]
    }
  }
});