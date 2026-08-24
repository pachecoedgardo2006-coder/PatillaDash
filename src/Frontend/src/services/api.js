import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5136/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Peticiones: Inyectar JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Respuestas con MOCK integrado para desarrollo Frontend
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Simulación para la ruta de Login
    if (originalRequest.url.includes('/auth/login')) {
      const { email } = JSON.parse(originalRequest.data || '{}');
      const isAdmin = email.toLowerCase().includes('admin');

      return Promise.resolve({
        data: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenPatillaDash",
          nombre: isAdmin ? "Admin Principal" : "Carlos Vendedor",
          email: email,
          rol: isAdmin ? "Administrador" : "Vendedor",
          localId: isAdmin ? 0 : 1
        },
        status: 200,
      });
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;