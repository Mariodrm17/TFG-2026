// Shared UI utilities — snackbar, modal, formatters

// ── Snackbar ──────────────────────────────────────────────────
let _snackTimer = null;
export function showSnackbar(msg, type = 'info') {
  const el = document.getElementById('snackbar');
  el.innerHTML = `<div class="snack ${type}">${escHtml(msg)}</div>`;
  el.classList.add('show');
  clearTimeout(_snackTimer);
  _snackTimer = setTimeout(() => el.classList.remove('show'), 3800);
}

// ── Modal ─────────────────────────────────────────────────────
export function openModal({ title, body, footer = '', large = false, onClose }) {
  const overlay = document.getElementById('modal-overlay');
  overlay.innerHTML = `
    <div class="modal ${large ? 'modal-lg' : ''}">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>`;
  overlay.style.display = 'flex';

  overlay.onclick = (e) => { if (e.target === overlay) closeModal(onClose); };
  document.getElementById('modal-close-btn').onclick = () => closeModal(onClose);
}

export function closeModal(cb) {
  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'none';
  overlay.innerHTML = '';
  if (typeof cb === 'function') cb();
}

// ── Date formatting ───────────────────────────────────────────
export function formatFecha(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export function formatFechaCorta(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── HTML escaping ─────────────────────────────────────────────
export function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Badge generators ──────────────────────────────────────────
const ESTADO_PALE_MAP = {
  recepcionado:   ['badge-info',    'Recepcionado'],
  emplazado:      ['badge-success', 'Emplazado'],
  en_reubicacion: ['badge-warning', 'En reubicación'],
  en_preparacion: ['badge-warning', 'En preparación'],
  expedido:       ['badge-gray',    'Expedido'],
};
export function badgePale(estado) {
  const [cls, label] = ESTADO_PALE_MAP[estado] || ['badge-gray', estado];
  return `<span class="badge ${cls}">${label}</span>`;
}

const TIPO_INC_MAP = {
  daño:           'Daño',
  perdida:        'Pérdida',
  error_registro: 'Error registro',
  otro:           'Otro',
};
export function labelTipoInc(tipo) {
  return TIPO_INC_MAP[tipo] || tipo;
}

export function badgeIncEstado(estado) {
  return estado === 'abierta'
    ? '<span class="badge badge-danger">Abierta</span>'
    : '<span class="badge badge-success">Resuelta</span>';
}

const SATURATION_CLS = {
  libre:   's-libre',
  bajo:    's-bajo',
  medio:   's-medio',
  alto:    's-alto',
  critico: 's-critico',
};
export function sectorCls(s) {
  if (!s.activo) return 's-inactivo';
  return SATURATION_CLS[s.estado_saturacion] || 's-libre';
}

// ── Timeline icon by tipo movimiento ─────────────────────────
const TIPO_MOV = {
  entrada:    ['⬇', 'entrada',    'Entrada'],
  salida:     ['⬆', 'salida',     'Salida'],
  reubicacion:['↔', 'reubicacion','Reubicación'],
  ajuste:     ['⚙', 'ajuste',     'Ajuste'],
};
export function tipoMovInfo(tipo) {
  return TIPO_MOV[tipo] || ['•', 'ajuste', tipo];
}

// ── Loading/empty HTML helpers ────────────────────────────────
export function loadingHtml() {
  return `<div class="loading"><div class="spinner"></div>Cargando...</div>`;
}
export function emptyHtml(msg = 'Sin datos') {
  return `<div class="empty-state"><div class="empty-icon">📭</div><p>${msg}</p></div>`;
}
