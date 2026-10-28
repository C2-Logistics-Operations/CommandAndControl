import { test, expect } from '@playwright/test';

test.describe('Pruebas E2E: Flujo Táctico C2 Command System', () => {

  test.beforeAll(async ({ request }) => {
    let retries = 5;
    let res;

    while (retries > 0) {
      try {
        res = await request.post('http://localhost:3000/api/v1/auth/register', {
          data: {
            username: 'comandante_e2e',
            password: 'password123',
            rol: 'COMANDANTE'
          }
        });

        if ([201, 400, 409].includes(res.status())) {
          break;
        }
      } catch (e) {
        // Reintento si el servidor está en proceso de arranque
      }
      retries--;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    expect([201, 400, 409]).toContain(res ? res.status() : 500);
  });

  test('Flujo E2E Completo en Frontend React (Puerto 8080)', async ({ page }) => {
    const response = await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
    expect(response.status()).toBe(200);

    await expect(page.getByText('[ C2 COMMAND SYSTEM ]')).toBeVisible({ timeout: 10000 });

    await page.locator('#username').fill('comandante_e2e');
    await page.locator('#password').fill('password123');

    const [loginResponse] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/v1/auth/login')),
      page.locator('button[type="submit"]').click()
    ]);
    expect(loginResponse.status()).toBe(200);

    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Localizar el encabezado H1 principal del Dashboard React
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText(/CENTRO DE CONTROL|C2/i);
  });

  test('Flujo E2E Completo en Frontend Vue 3 (Puerto 8081)', async ({ page }) => {
    const response = await page.goto('http://localhost:8081/', { waitUntil: 'domcontentloaded' });
    expect(response.status()).toBe(200);

    await expect(page.getByText('[ C2 VUE COMMAND ]')).toBeVisible({ timeout: 10000 });

    await page.locator('input[type="text"]').fill('comandante_e2e');
    await page.locator('input[type="password"]').fill('password123');

    const [loginResponse] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/v1/auth/login')),
      page.locator('button[type="submit"]').click()
    ]);
    expect(loginResponse.status()).toBe(200);

    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.getByText('[ TERMINAL VUE 3 - C2 ]')).toBeVisible({ timeout: 10000 });
  });

});