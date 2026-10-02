const BASE_URL = 'http://localhost:3000/api/v1';

export const fetchConAuth = async (endpoint, options = {}) => {
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