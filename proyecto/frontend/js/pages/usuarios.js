import { listarUsuarios, crearUsuario, actualizarUsuario } from '../api.js';
import { openModal, closeModal, showSnackbar, escHtml, formatFecha, loadingHtml, emptyHtml } from '../ui.js';
import { currentUser } from '../app.js';

export async function render(container) {
  container.style.padding = '';
  container.style.maxWidth = '';

  container.innerHTML = `
    <div class="page-header flex-between">
      <div>
        <h1 class="page-title">👥 Gestión de Usuarios</h1>
        <p class="page-sub">UC-11 · Administración completa de cuentas de acceso al sistema</p>
      </div>
      <button class="btn btn-accent" id="btn-nuevo-usuario">+ Nuevo usuario</button>
    </div>
    <div class="card">
      <div id="usuarios-tabla">${loadingHtml()}</div>
    </div>`;

  document.getElementById('btn-nuevo-usuario').addEventListener('click', abrirModalCrear);
  await cargarUsuarios();
}

async function cargarUsuarios() {
  const el = document.getElementById('usuarios-tabla');
  if (!el) return;
  el.innerHTML = loadingHtml();

  try {
    const { usuarios } = await listarUsuarios();
    renderTabla(el, usuarios);
  } catch (err) {
    el.innerHTML = `<div class="alert alert-error">${escHtml(err.message)}</div>`;
  }
}

function renderTabla(el, usuarios) {
  if (usuarios.length === 0) {
    el.innerHTML = emptyHtml('No hay usuarios registrados');
    return;
  }

  const ROL_BADGE = {
    administrador: 'badge-danger',
    gerente:       'badge-warning',
    operario:      'badge-success',
    visualizador:  'badge-info',
  };
  const ROL_LABEL = {
    administrador: 'Admin',
    gerente:       'Gerente',
    operario:      'Operario',
    visualizador:  'Visualizador',
  };

  el.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead><tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Creado</th>
          <th>Acciones</th>
        </tr></thead>
        <tbody>
          ${usuarios.map(u => {
            const esSelf = u.id === currentUser?.id;
            return `<tr class="user-table-row">
              <td><strong>${escHtml(u.nombre)}</strong>${esSelf ? ' <span class="badge badge-primary">Tú</span>' : ''}</td>
              <td>${escHtml(u.email)}</td>
              <td><span class="badge ${ROL_BADGE[u.rol] || 'badge-gray'}">${ROL_LABEL[u.rol] || u.rol}</span></td>
              <td>
                ${u.activo
                  ? '<span class="badge badge-success">Activo</span>'
                  : '<span class="badge badge-gray">Inactivo</span>'}
              </td>
              <td>${formatFecha(u.created_at)}</td>
              <td>
                <button class="btn btn-outline btn-sm" onclick="window.__editarUsuario(${u.id})">✎ Editar</button>
                ${!esSelf ? `<button class="btn btn-sm ${u.activo ? 'btn-danger' : 'btn-success'}"
                  onclick="window.__toggleActivo(${u.id}, ${u.activo})">
                  ${u.activo ? '✕ Desactivar' : '✓ Activar'}
                </button>` : ''}
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div class="text-muted mt-md" style="font-size:.78rem;padding-top:.5rem;border-top:1px solid var(--border)">
      Total: <strong>${usuarios.length}</strong> usuarios registrados
    </div>`;

  window.__editarUsuario = (id) => {
    const u = usuarios.find(x => x.id === id);
    if (u) abrirModalEditar(u);
  };

  window.__toggleActivo = async (id, activo) => {
    const accion = activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Seguro que quieres ${accion} este usuario?`)) return;
    try {
      await actualizarUsuario(id, { activo: activo ? 0 : 1 });
      showSnackbar(`Usuario ${activo ? 'desactivado' : 'activado'} correctamente`, 'success');
      await cargarUsuarios();
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };
}

function formRolesHtml(selectedRol = '') {
  const roles = [
    { val: 'visualizador', label: 'Visualizador — solo lectura' },
    { val: 'operario',     label: 'Operario — operaciones de almacén' },
    { val: 'gerente',      label: 'Gerente — estadísticas e incidencias' },
    { val: 'administrador',label: 'Administrador — control total' },
  ];
  return roles.map(r =>
    `<option value="${r.val}" ${r.val === selectedRol ? 'selected' : ''}>${r.label}</option>`
  ).join('');
}

function abrirModalCrear() {
  openModal({
    title: 'Crear nuevo usuario',
    body: `
      <div id="crear-alert"></div>
      <form id="form-crear">
        <div class="form-group">
          <label class="form-label">Nombre completo *</label>
          <input class="form-control" type="text" id="c-nombre" required placeholder="Nombre y apellidos">
        </div>
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input class="form-control" type="email" id="c-email" required placeholder="usuario@almacen.com">
        </div>
        <div class="form-group">
          <label class="form-label">Contraseña *</label>
          <input class="form-control" type="password" id="c-pass" required placeholder="Mínimo 8 caracteres">
        </div>
        <div class="form-group">
          <label class="form-label">Rol *</label>
          <select class="form-control" id="c-rol">${formRolesHtml('operario')}</select>
          <div class="form-hint">El rol determina las funcionalidades accesibles en el sistema</div>
        </div>
      </form>`,
    footer: `
      <button class="btn btn-outline" id="btn-cancel-crear">Cancelar</button>
      <button class="btn btn-accent" id="btn-confirm-crear">Crear usuario</button>`,
  });

  document.getElementById('btn-cancel-crear').addEventListener('click', closeModal);
  document.getElementById('btn-confirm-crear').addEventListener('click', async () => {
    const btn = document.getElementById('btn-confirm-crear');
    const alertEl = document.getElementById('crear-alert');
    alertEl.innerHTML = '';

    const nombre   = document.getElementById('c-nombre').value.trim();
    const email    = document.getElementById('c-email').value.trim();
    const password = document.getElementById('c-pass').value;
    const rol      = document.getElementById('c-rol').value;

    if (!nombre || !email || !password || !rol) {
      alertEl.innerHTML = '<div class="alert alert-error">Todos los campos son obligatorios</div>';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Creando...';

    try {
      await crearUsuario({ nombre, email, password, rol });
      showSnackbar(`Usuario ${nombre} creado correctamente`, 'success');
      closeModal();
      await cargarUsuarios();
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error">${escHtml(err.message)}</div>`;
      btn.disabled = false;
      btn.textContent = 'Crear usuario';
    }
  });
}

function abrirModalEditar(u) {
  openModal({
    title: `Editar usuario — ${u.nombre}`,
    body: `
      <div id="editar-alert"></div>
      <div class="form-group">
        <label class="form-label">Nombre completo</label>
        <input class="form-control" type="text" id="e-nombre" value="${escHtml(u.nombre)}" placeholder="Nombre y apellidos">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-control" type="text" value="${escHtml(u.email)}" disabled style="opacity:.6">
        <div class="form-hint">El email no puede modificarse</div>
      </div>
      <div class="form-group">
        <label class="form-label">Rol</label>
        <select class="form-control" id="e-rol">${formRolesHtml(u.rol)}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Nueva contraseña (dejar vacío para no cambiar)</label>
        <input class="form-control" type="password" id="e-pass" placeholder="Nueva contraseña opcional">
      </div>`,
    footer: `
      <button class="btn btn-outline" id="btn-cancel-edit">Cancelar</button>
      <button class="btn btn-primary" id="btn-confirm-edit">Guardar cambios</button>`,
  });

  document.getElementById('btn-cancel-edit').addEventListener('click', closeModal);
  document.getElementById('btn-confirm-edit').addEventListener('click', async () => {
    const btn = document.getElementById('btn-confirm-edit');
    const alertEl = document.getElementById('editar-alert');
    alertEl.innerHTML = '';

    const nombre   = document.getElementById('e-nombre').value.trim();
    const rol      = document.getElementById('e-rol').value;
    const password = document.getElementById('e-pass').value;

    if (!nombre) {
      alertEl.innerHTML = '<div class="alert alert-error">El nombre es obligatorio</div>';
      return;
    }

    const payload = { nombre, rol };
    if (password) payload.password = password;

    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      await actualizarUsuario(u.id, payload);
      showSnackbar('Usuario actualizado correctamente', 'success');
      closeModal();
      await cargarUsuarios();
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error">${escHtml(err.message)}</div>`;
      btn.disabled = false;
      btn.textContent = 'Guardar cambios';
    }
  });
}
