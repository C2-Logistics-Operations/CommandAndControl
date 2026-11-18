const BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1')
    .replace(/\/+$/, '');

export const fetchConAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('El servidor devolvió una respuesta inválida.');
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.detail || data?.error || data?.message || `Error HTTP ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  return data;
};

export const api = {
  get: (endpoint, options = {}) => fetchConAuth(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    fetchConAuth(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options = {}) =>
    fetchConAuth(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options = {}) => fetchConAuth(endpoint, { ...options, method: 'DELETE' }),
};
