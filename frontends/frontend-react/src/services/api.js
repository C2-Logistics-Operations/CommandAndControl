const BASE_URL = 'http://localhost:3000/api/v1';
const BASE_URL = 'http://localhost:3000/api/v1';

// Función base privada con toda la lógica de seguridad y errores
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('c2_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('c2_token');
    localStorage.removeItem('c2_user');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición');
  }

  return data;
};

// Exportación limpia con métodos HTTP listos para usar
export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { 
    ...options, 
    method: 'POST', 
    body: JSON.stringify(body) 
  }),
  put: (endpoint, body, options) => request(endpoint, { 
    ...options, 
    method: 'PUT', 
    body: JSON.stringify(body) 
  }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};
