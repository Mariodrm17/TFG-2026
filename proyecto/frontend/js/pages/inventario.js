import { listarPales, detallePale, getLayout } from '../api.js';
import { openModal, showSnackbar, escHtml, badgePale, formatFecha, tipoMovInfo, loadingHtml, emptyHtml } from '../ui.js';

let _pagina  = 1;
let _filtros = { buscar: '', estado: '', sector_id: '' };
let _sectores = [];

export async function render(container) {
  container.style.padding = '';
  container.style.maxWidth = '';

  try {
    const layoutData = await getLayout();
    _sectores = layoutData.sectores.filter(s => s.activo);
  } catch { _sectores = []; }

  const sectOpts = _sectores.map(s =>
    `<option value="${s.id}">${escHtml(s.codigo)} — ${escHtml(s.nombre)}</option>`
  ).join('');

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">📦 Inventario de Palés</h1>
      <p class="page-sub">UC-10 Búsqueda · UC-12 Historial completo de palé</p>
    </div>
    <div class="card">
      <div class="search-row">
        <input type="text" id="f-buscar" placeholder="🔍 Buscar por código de referencia..."
               value="${escHtml(_filtros.buscar)}">
        <select id="f-estado">
          <option value="">Todos los estados</option>
          <option value="recepcionado">Recepcionado</option>
          <option value="emplazado">Emplazado</option>
          <option value="en_reubicacion">En reubicación</option>
          <option value="en_preparacion">En preparación</option>
          <option value="expedido">Expedido</option>
        </select>
        <select id="f-sector">
          <option value="">Todos los sectores</option>
          ${sectOpts}
        </select>
        <button class="btn btn-primary" id="btn-buscar">Filtrar</button>
        <button class="btn btn-outline" id="btn-reset">↺ Limpiar</button>
      </div>
      <div id="tabla-pales">${loadingHtml()}</div>
    </div>`;

  document.getElementById('btn-buscar').addEventListener('click', () => {
    _pagina = 1;
    _filtros.buscar    = document.getElementById('f-buscar').value.trim();
    _filtros.estado    = document.getElementById('f-estado').value;
    _filtros.sector_id = document.getElementById('f-sector').value;
    cargarPales();
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    _pagina = 1;
    _filtros = { buscar: '', estado: '', sector_id: '' };
    document.getElementById('f-buscar').value    = '';
    document.getElementById('f-estado').value    = '';
    document.getElementById('f-sector').value    = '';
    cargarPales();
  });

  document.getElementById('f-buscar').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-buscar').click();
  });

  await cargarPales();
}

async function cargarPales() {
  const el = document.getElementById('tabla-pales');
  if (!el) return;
  el.innerHTML = loadingHtml();

  try {
    const params = { pagina: _pagina, limite: 20, ..._filtros };
    const data = await listarPales(params);
    renderTabla(el, data);
  } catch (err) {
    el.innerHTML = `<div class="alert alert-error">${escHtml(err.message)}</div>`;
  }
}

function renderTabla(el, { pales, total, pagina, limite }) {
  const desde = (pagina - 1) * limite + 1;
  const hasta = Math.min(pagina * limite, total);

  if (pales.length === 0) {
    el.innerHTML = emptyHtml('No se encontraron palés con los filtros aplicados');
    return;
  }

  el.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead><tr>
          <th>Código</th>
          <th>Mercancía</th>
          <th>Sector</th>
          <th>Estado</th>
          <th>Fecha entrada</th>
          <th>Fecha salida</th>
        </tr></thead>
        <tbody>
          ${pales.map(p => `
            <tr class="clickable" data-id="${p.id}">
              <td class="font-mono font-bold">${escHtml(p.codigo_ref)}</td>
              <td>${escHtml(p.mercancia || '—')}</td>
              <td>${p.sector_codigo ? `<span class="badge badge-primary">${escHtml(p.sector_codigo)}</span>` : '—'}</td>
              <td>${badgePale(p.estado)}</td>
              <td>${formatFecha(p.fecha_entrada)}</td>
              <td>${formatFecha(p.fecha_salida)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <span>Mostrando <strong>${desde}–${hasta}</strong> de <strong>${total}</strong> palés</span>
      <div class="pagination-btns">
        <button class="page-btn" id="btn-prev" ${pagina <= 1 ? 'disabled' : ''}>‹ Anterior</button>
        <button class="page-btn" id="btn-next" ${hasta >= total ? 'disabled' : ''}>Siguiente ›</button>
      </div>
    </div>`;

  el.querySelectorAll('tr.clickable').forEach(row => {
    row.addEventListener('click', () => abrirDetallePale(row.dataset.id));
  });

  document.getElementById('btn-prev')?.addEventListener('click', () => { _pagina--; cargarPales(); });
  document.getElementById('btn-next')?.addEventListener('click', () => { _pagina++; cargarPales(); });
}

async function abrirDetallePale(id) {
  openModal({ title: 'Detalle del palé', body: loadingHtml(), large: true });

  try {
    const { pale, historial } = await detallePale(id);

    const body = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem">
        <div>
          <div class="text-muted" style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem">Código de referencia</div>
          <div class="font-mono font-bold" style="font-size:1.1rem;color:var(--primary)">${escHtml(pale.codigo_ref)}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem">Estado actual</div>
          <div>${badgePale(pale.estado)}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem">Sector</div>
          <div><strong>${escHtml(pale.sector_codigo || '—')}</strong></div>
        </div>
        <div>
          <div class="text-muted" style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem">Mercancía</div>
          <div>${escHtml(pale.mercancia || '—')}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem">Fecha entrada</div>
          <div>${formatFecha(pale.fecha_entrada)}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem">Fecha salida</div>
          <div>${formatFecha(pale.fecha_salida)}</div>
        </div>
      </div>
      ${pale.notas ? `<div class="alert alert-info" style="margin-bottom:1.25rem"><small>📋 ${escHtml(pale.notas)}</small></div>` : ''}
      <hr class="divider">
      <div style="font-size:.9rem;font-weight:700;color:var(--primary);margin-bottom:.75rem">
        📋 Historial de movimientos (${historial.length})
      </div>
      ${historial.length === 0
        ? emptyHtml('Sin movimientos registrados')
        : `<div class="timeline">
            ${historial.map(mv => {
              const [icon, cls, label] = tipoMovInfo(mv.tipo);
              let ruta = '';
              if (mv.sector_origen && mv.sector_destino) ruta = `${mv.sector_origen} → ${mv.sector_destino}`;
              else if (mv.sector_destino) ruta = `→ ${mv.sector_destino}`;
              else if (mv.sector_origen) ruta = `${mv.sector_origen} →`;
              return `<div class="tl-item">
                <div class="tl-dot ${cls}">${icon}</div>
                <div class="tl-body">
                  <div class="tl-tipo">${label}</div>
                  <div class="tl-meta">
                    ${ruta ? `${ruta} · ` : ''}${escHtml(mv.usuario)} · ${formatFecha(mv.fecha_hora)}
                    ${mv.notas ? `<br><em>${escHtml(mv.notas)}</em>` : ''}
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>`}`;

    document.querySelector('.modal-body').innerHTML = body;
  } catch (err) {
    document.querySelector('.modal-body').innerHTML =
      `<div class="alert alert-error">${escHtml(err.message)}</div>`;
  }
}
