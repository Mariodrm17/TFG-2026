import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inyectar token JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirigir a login si el token expira
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('wms_token');
      localStorage.removeItem('wms_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// ── Sectores / Layout ─────────────────────────────────────
export const getLayout        = ()      => api.get('/sectores');
export const getSectorDetalle = (id)    => api.get(`/sectores/${id}`);

// ── Palés ─────────────────────────────────────────────────
export const listarPales   = (params) => api.get('/pales', { params });
export const detallePale   = (id)     => api.get(`/pales/${id}`);
export const entradaPale   = (data)   => api.post('/pales/entrada', data);
export const salidaPale    = (id, notas) => api.post(`/pales/${id}/salida`, { notas });
export const reubicarPale  = (id, data)  => api.put(`/pales/${id}/reubicar`, data);

// ── Stats ─────────────────────────────────────────────────
export const getDashboard = () => api.get('/stats');

// ── Incidencias ───────────────────────────────────────────
export const crearIncidencia    = (data)   => api.post('/incidencias', data);
export const listarIncidencias  = (params) => api.get('/incidencias', { params });
export const resolverIncidencia = (id, data) => api.put(`/incidencias/${id}/resolver`, data);

// ── Usuarios ──────────────────────────────────────────────
export const listarUsuarios   = ()          => api.get('/usuarios');
export const crearUsuario     = (data)      => api.post('/usuarios', data);
export const actualizarUsuario = (id, data) => api.put(`/usuarios/${id}`, data);

// ── Mercancía ─────────────────────────────────────────────
export const listarMercancias = () => api.get('/mercancia');

export default api;
