import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Login from '../views/Login.vue';

describe('Suite de Pruebas: Componente Login Vue 3 (Frontend B)', () => {
  it('Debe renderizar la interfaz HUD del panel de login de Vue', () => {
    const wrapper = mount(Login);

    expect(wrapper.text()).toContain('[ C2 VUE COMMAND ]');
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('CONECTAR');
  });

  it('Debe permitir cambiar el servidor target en el selector', async () => {
    const wrapper = mount(Login);
    const select = wrapper.find('select');

    await select.setValue('http://localhost:3000/api/v1');
    expect(select.element.value).toBe('http://localhost:3000/api/v1');
  });
});