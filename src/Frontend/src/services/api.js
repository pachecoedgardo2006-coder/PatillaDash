import axios from 'axios';

// Soporte flexible para URL de API en Cloud (Netlify / producción) o Proxy local
let rawApiUrl = import.meta.env.VITE_API_URL || '/api';
if (rawApiUrl && !rawApiUrl.endsWith('/api') && !rawApiUrl.endsWith('/api/')) {
  rawApiUrl = rawApiUrl.replace(/\/+$/, '') + '/api';
}

const api = axios.create({
  baseURL: rawApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Peticiones: Inyectar JWT protegido contra navegadores con storage restringido
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn('Storage no disponible para inyectar token:', e);
  }
  return config;
});

// Interceptor de Respuestas: Manejo global de 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error viene de un intento de login (/auth/login), NO redirigir ni recargar,
    // permitir que la página de Login muestre el mensaje de error normal
    if (error.config?.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        // Ignorar excepción en Safari privado
      }
      const pathname = window.location.pathname;
      if (pathname !== '/login' && pathname !== '/login/') {
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
  obtenerUsuarios: (localId) => {
    const params = localId ? { localId } : {};
    return api.get('/auth/usuarios', { params });
  },
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
  obtenerHistorial: (localId) => {
    const params = localId ? { localId } : {};
    return api.get('/pagos', { params });
  },
  obtenerPorLocal: (localId) => api.get(`/pagos/local/${localId}`),
  obtenerPorVendedor: (vendedorId) => api.get(`/pagos/vendedor/${vendedorId}`),
};

export const ventasService = {
  registrarVentaDiaria: (data) => api.post('/ventas/diaria', data),
  obtenerHistorial: (localId) => {
    const params = localId ? { localId } : {};
    return api.get('/ventas', { params });
  },
  obtenerDetalle: (id) => api.get(`/ventas/${id}`),
  obtenerPorLocal: (localId) => api.get(`/ventas/local/${localId}`),
};

export const estadisticasService = {
  obtenerDashboard: (fechaInicio, fechaFin) => {
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    return api.get('/estadisticas/dashboard', { params });
  },
};

export const productosService = {
  obtenerTodos: (incluirInactivos = false) => {
    const params = incluirInactivos ? { incluirInactivos: true } : {};
    return api.get('/productos', { params });
  },
  obtenerPorId: (id) => api.get(`/productos/${id}`),
  crear: (data) => api.post('/productos', data),
  actualizar: (id, data) => api.put(`/productos/${id}`, data),
  desactivar: (id) => api.delete(`/productos/${id}`),
  cambiarEstado: (id) => api.patch(`/productos/${id}/toggle`),
};

export default api;
