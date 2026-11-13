import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Si la API necesitara clave:
// apiClient.defaults.headers.common['X-API-Key'] = import.meta.env.VITE_API_KEY;

export default apiClient;