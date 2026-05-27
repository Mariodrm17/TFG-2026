const BASE = '/api';

function getToken() {
  return localStorage.getItem('wms_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(BASE + path, opts);
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('wms_token');
    localStorage.removeItem('wms_usuario');
    window.location.hash = '#/login';
    throw new Error('Sesión expirada. Inicia sesión de nuevo.');
  }

  let data;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

const get  = (path)        => request('GET',  path);
const post = (path, body)  => request('POST', path, body);
const put  = (path, body)  => request('PUT',  path, body);

function qs(params) {
  if (!params) return '';
  const q = Object.entries(params)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return q ? '?' + q : '';
}

// Auth
export const login = (email, password) => post('/auth/login', { email, password });

// Sectores
export const getLayout        = ()          => get('/sectores');
export const getSectorDetalle = (id)        => get(`/sectores/${id}`);
export const actualizarSector = (id, data)  => put(`/sectores/${id}`, data);

// Palés
export const listarPales  = (params)        => get('/pales' + qs(params));
export const detallePale  = (id)            => get(`/pales/${id}`);
export const entradaPale  = (data)          => post('/pales/entrada', data);
export const salidaPale   = (id, notas)     => post(`/pales/${id}/salida`, { notas });
export const reubicarPale = (id, data)      => put(`/pales/${id}/reubicar`, data);

// Stats
export const getDashboard = () => get('/stats');

// Incidencias
export const crearIncidencia    = (data)        => post('/incidencias', data);
export const listarIncidencias  = (params)      => get('/incidencias' + qs(params));
export const resolverIncidencia = (id, data)    => put(`/incidencias/${id}/resolver`, data);

// Usuarios
export const listarUsuarios    = ()             => get('/usuarios');
export const crearUsuario      = (data)         => post('/usuarios', data);
export const actualizarUsuario = (id, data)     => put(`/usuarios/${id}`, data);

// Mercancía
export const listarMercancias = () => get('/mercancia');
