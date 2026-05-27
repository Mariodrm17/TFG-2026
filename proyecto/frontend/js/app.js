import * as LoginPage      from './pages/login.js';
import * as LayoutPage     from './pages/layout.js';
import * as OperacionesPage from './pages/operaciones.js';
import * as InventarioPage from './pages/inventario.js';
import * as DashboardPage  from './pages/dashboard.js';
import * as IncidenciasPage from './pages/incidencias.js';
import * as UsuariosPage   from './pages/usuarios.js';

// ── State ─────────────────────────────────────────────────────
export let currentUser = null;

function loadUser() {
  const raw = localStorage.getItem('wms_usuario');
  try { currentUser = raw ? JSON.parse(raw) : null; } catch { currentUser = null; }
}

export function setSession(token, user) {
  localStorage.setItem('wms_token', token);
  localStorage.setItem('wms_usuario', JSON.stringify(user));
  currentUser = user;
}

export function clearSession() {
  localStorage.removeItem('wms_token');
  localStorage.removeItem('wms_usuario');
  currentUser = null;
}

export function hasRole(...roles) {
  return currentUser && roles.includes(currentUser.rol);
}

// ── Routes ────────────────────────────────────────────────────
const ROUTES = {
  '/login':       { page: LoginPage,       auth: false, roles: null },
  '/layout':      { page: LayoutPage,      auth: true,  roles: null },
  '/inventario':  { page: InventarioPage,  auth: true,  roles: null },
  '/operaciones': { page: OperacionesPage, auth: true,  roles: ['operario','gerente','administrador'] },
  '/dashboard':   { page: DashboardPage,   auth: true,  roles: ['gerente','administrador'] },
  '/incidencias': { page: IncidenciasPage, auth: true,  roles: ['gerente','administrador'] },
  '/usuarios':    { page: UsuariosPage,    auth: true,  roles: ['administrador'] },
};

// ── Navbar ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { hash: '#/layout',      label: 'Layout',      icon: '🗺',  roles: null },
  { hash: '#/inventario',  label: 'Inventario',  icon: '📦',  roles: null },
  { hash: '#/operaciones', label: 'Operaciones', icon: '⚙️',  roles: ['operario','gerente','administrador'] },
  { hash: '#/dashboard',   label: 'Dashboard',   icon: '📊',  roles: ['gerente','administrador'] },
  { hash: '#/incidencias', label: 'Incidencias', icon: '⚠️',  roles: ['gerente','administrador'] },
  { hash: '#/usuarios',    label: 'Usuarios',    icon: '👥',  roles: ['administrador'] },
];

function renderNavbar() {
  const nav = document.getElementById('navbar');
  if (!currentUser) { nav.style.display = 'none'; return; }

  const items = NAV_ITEMS.filter(i =>
    i.roles === null || i.roles.includes(currentUser.rol)
  );

  const currentHash = window.location.hash || '#/layout';
  const initials = currentUser.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const ROL_LABEL = { visualizador: 'Visualizador', operario: 'Operario', gerente: 'Gerente', administrador: 'Admin' };

  nav.style.display = 'flex';
  nav.innerHTML = `
    <a class="nav-brand" href="#/layout">
      <div class="nav-logo">ISS</div>
      <div class="nav-titles">
        <strong>WMS Santander</strong>
        <span>James Hardie</span>
      </div>
    </a>
    <ul class="nav-links">
      ${items.map(i => `
        <li>
          <button class="nav-link ${currentHash === i.hash ? 'active' : ''}"
                  onclick="window.location.hash='${i.hash}'">
            <span class="nav-icon">${i.icon}</span>${i.label}
          </button>
        </li>`).join('')}
    </ul>
    <div class="nav-right">
      <div class="nav-user">
        <div class="nav-avatar">${initials}</div>
        <div class="nav-user-info">
          <div class="u-name">${currentUser.nombre}</div>
          <div class="u-role">${ROL_LABEL[currentUser.rol] || currentUser.rol}</div>
        </div>
      </div>
      <button class="btn-logout" id="btn-logout">⏻ Salir</button>
    </div>`;

  document.getElementById('btn-logout').addEventListener('click', () => {
    clearSession();
    window.location.hash = '#/login';
  });
}

// ── Router ────────────────────────────────────────────────────
async function navigate() {
  loadUser();
  const raw = window.location.hash || '#/login';
  const path = raw.replace(/^#/, '') || '/login';

  const route = ROUTES[path];

  if (!route) {
    window.location.hash = currentUser ? '#/layout' : '#/login';
    return;
  }

  // Redirect logged-in user away from login
  if (!route.auth && currentUser) {
    window.location.hash = '#/layout';
    return;
  }

  // Redirect unauthenticated user to login
  if (route.auth && !currentUser) {
    window.location.hash = '#/login';
    return;
  }

  // Role check
  if (route.roles && !route.roles.includes(currentUser?.rol)) {
    window.location.hash = '#/layout';
    return;
  }

  renderNavbar();

  const container = document.getElementById('app');
  try {
    await route.page.render(container);
  } catch (err) {
    console.error('Error rendering page:', err);
    container.innerHTML = `
      <div class="empty-state" style="padding:4rem">
        <div class="empty-icon">⚠️</div>
        <p>Error al cargar la página: ${err.message}</p>
      </div>`;
  }
}

// ── Init ──────────────────────────────────────────────────────
window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);
navigate();
