import { api } from './api';

const parseResponse = async (response) => {
  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('El servidor devolvió una respuesta inválida.');
    }
  }

  if (!response.ok) {
    const error = new Error(
      data.detail ||
      data.error ||
      data.message ||
      `Error HTTP ${response.status}`
    );

    error.status = response.status;

    throw error;
  }

  return data;
};

export const dashboardService = {
  async fetchSuministros(token, baseUrl) {
    const response = await api.get(
      '/suministros',
      token,
      baseUrl
    );

    const data = await parseResponse(response);

    if (!Array.isArray(data)) {
      throw new Error('La respuesta del inventario no es válida.');
    }

    return data;
  }
};