import { test, expect } from '@playwright/test';

// Función auxiliar con reintentos para asegurar conexión con la API Express
async function registerUserWithRetry(request, username, password) {
  let attempts = 10;
  while (attempts > 0) {
    try {
      const res = await request.post('http://localhost:3000/api/v1/auth/register', {
        data: { username, password, rol: 'COMANDANTE' }
      });
      if ([201, 400, 409].includes(res.status())) {
        return res;
      }
    } catch (err) {
      // Esperar 1 segundo si la API aún está iniciando
    }
    attempts--;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('No se pudo conectar al Backend Express en http://localhost:3000. Revisa "docker compose ps".');
}

test.describe('Pruebas E2E: Flujo Táctico C2 Command System', () => {

  test('Flujo E2E Completo en Frontend React (Puerto 8080)', async ({ page, request }) => {
    const timestamp = Date.now();
    const username = `comandante_react_${timestamp}`;
    const password = 'password123';

    // 1. Crear usuario único con tolerancia a reintentos
    await registerUserWithRetry(request, username, password);

    // 2. Acceso a la SPA React
    const response = await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
    expect(response.status()).toBe(200);

    // 3. Validación de presencia del encabezado HUD
    await expect(page.getByText('[ C2 COMMAND SYSTEM ]')).toBeVisible({ timeout: 10000 });

    // 4. Autenticación en el formulario
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();

    // 5. Verificación de redirección SPA e interfaz del Dashboard React
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText(/CENTRO DE CONTROL|C2/i);
  });

  test('Flujo E2E Completo en Frontend Vue 3 (Puerto 8081)', async ({ page, request }) => {
    const timestamp = Date.now();
    const username = `comandante_vue_${timestamp}`;
    const password = 'password123';

    // 1. Crear usuario único con tolerancia a reintentos
    await registerUserWithRetry(request, username, password);

    // 2. Acceso a la SPA Vue 3
    const response = await page.goto('http://localhost:8081/', { waitUntil: 'domcontentloaded' });
    expect(response.status()).toBe(200);

    // 3. Validación del título HUD de Login en Vue
    await expect(page.getByText('[ C2 VUE COMMAND ]')).toBeVisible({ timeout: 10000 });

    // 4. Autenticación en el formulario
    await page.locator('input[type="text"]').fill(username);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').click();

    // 5. Verificación de redirección SPA y tablero HUD Vue
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    await expect(page.getByText('[ TERMINAL VUE 3 - C2 ]')).toBeVisible({ timeout: 10000 });
  });

});