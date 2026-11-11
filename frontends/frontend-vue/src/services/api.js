const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000/api/v1';

const normalizeBaseUrl = (baseUrl) => {
  return (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
};

export const api = {
  async post(endpoint, data, baseUrl = DEFAULT_BASE_URL) {
    return fetch(
      `${normalizeBaseUrl(baseUrl)}${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
  },

  async get(endpoint, token, baseUrl = DEFAULT_BASE_URL) {
    if (!token) {
      throw new Error('No existe una sesión autenticada.');
    }

    return fetch(
      `${normalizeBaseUrl(baseUrl)}${endpoint}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
};