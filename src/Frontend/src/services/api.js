import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5136/api';

const api = axios.create({
  baseURL: API_URL,
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

// Interceptor de Respuestas: Manejo global de 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- SERVICIOS DE LA API ---

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const inventarioService = {
  obtenerPorLocal: (localId) => api.get(`/inventario/local/${localId}`),
  actualizarStockManual: (data) => api.put('/inventario/stock', data),
};

export const comprasService = {
  registrarCompra: (data) => api.post('/compras', data),
  obtenerHistorial: (localId) => {
    const params = localId ? { localId } : {};
    return api.get('/compras', { params });
  },
};

export const pagosService = {
  registrarPago: (data) => api.post('/pagos', data),
  obtenerPorLocal: (localId) => api.get(`/pagos/local/${localId}`),
  obtenerPorVendedor: (vendedorId) => api.get(`/pagos/vendedor/${vendedorId}`),
};

export const ventasService = {
  registrarVentaDiaria: (data) => api.post('/ventas/diaria', data),
  obtenerPorLocal: (localId) => api.get(`/ventas/local/${localId}`),
  obtenerHistorial: (localId) => {
    const params = localId ? { localId } : {};
    return api.get('/ventas', { params });
  },
  obtenerDetalle: (id) => api.get(`/ventas/${id}`),
};

export const estadisticasService = {
  obtenerDashboard: (fechaInicio, fechaFin) => {
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    return api.get('/estadisticas/dashboard', { params });
  },
};

export default api;
