import { getLayout, getSectorDetalle } from '../api.js';
import { openModal, closeModal, escHtml, sectorCls, badgePale, formatFecha, loadingHtml, emptyHtml } from '../ui.js';

export async function render(container) {
  container.style.padding = '';
  container.style.maxWidth = '';

  container.innerHTML = `
    <div class="page-header flex-between">
      <div>
        <h1 class="page-title">🗺 Layout del Almacén</h1>
        <p class="page-sub">Distribución de los 38 sectores · Semáforo de ocupación en tiempo real</p>
      </div>
      <button class="btn btn-outline btn-sm" id="btn-refresh">↻ Actualizar</button>
    </div>
    <div id="layout-content">${loadingHtml()}</div>`;

  document.getElementById('btn-refresh').addEventListener('click', () => loadLayout(container));
  await loadLayout(container);
}

async function loadLayout(container) {
  const contentEl = document.getElementById('layout-content');
  if (!contentEl) return;
  contentEl.innerHTML = loadingHtml();

  let data;
  try {
    data = await getLayout();
  } catch (err) {
    contentEl.innerHTML = `<div class="alert alert-error">Error al cargar el layout: ${escHtml(err.message)}</div>`;
    return;
  }

  const { sectores, resumen } = data;
  const normales  = sectores.filter(s => !s.codigo.startsWith('ESP'));
  const especiales = sectores.filter(s => s.codigo.startsWith('ESP'));

  contentEl.innerHTML = `
    <div class="layout-page">
      <!-- Resumen global -->
      <div class="grid grid-4">
        <div class="kpi-card">
          <div class="kpi-icon">📦</div>
          <div>
            <div class="kpi-value">${resumen.total_pales}</div>
            <div class="kpi-label">Palés en almacén</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon accent">🏭</div>
          <div>
            <div class="kpi-value">${resumen.capacidad_total}</div>
            <div class="kpi-label">Capacidad total</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon ${resumen.ocupacion_global >= 90 ? 'warning' : resumen.ocupacion_global >= 70 ? 'accent' : 'success'}">
            📊
          </div>
          <div>
            <div class="kpi-value">${resumen.ocupacion_global}%</div>
            <div class="kpi-label">Ocupación global</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon info">🗂</div>
          <div>
            <div class="kpi-value">${resumen.total_sectores}</div>
            <div class="kpi-label">Sectores activos</div>
          </div>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="card" style="padding:1rem 1.5rem">
        <div class="legend">
          <span class="legend-item"><span class="legend-dot" style="background:#bbf7d0;border:1px solid #16a34a"></span>Libre (0%)</span>
          <span class="legend-item"><span class="legend-dot" style="background:#d9f99d;border:1px solid #65a30d"></span>Bajo (&lt;50%)</span>
          <span class="legend-item"><span class="legend-dot" style="background:#fef08a;border:1px solid #ca8a04"></span>Medio (&lt;75%)</span>
          <span class="legend-item"><span class="legend-dot" style="background:#fed7aa;border:1px solid #ea580c"></span>Alto (&lt;95%)</span>
          <span class="legend-item"><span class="legend-dot" style="background:#fecaca;border:1px solid #dc2626"></span>Crítico (≥95%)</span>
          <span class="text-muted" style="margin-left:auto;font-size:.78rem">Clic en un sector para ver sus palés</span>
        </div>
      </div>

      <!-- Grid sectores A-F (6x6) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Sectores A–F (Nave principal)</span>
        </div>
        <div class="sector-grid" id="sector-grid">
          ${normales.map(s => sectorCell(s)).join('')}
        </div>
      </div>

      <!-- Sectores especiales -->
      ${especiales.length ? `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Zonas especiales</span>
        </div>
        <div class="sector-special-row">
          ${especiales.map(s => sectorCell(s)).join('')}
        </div>
      </div>` : ''}
    </div>`;

  // Attach click events to sector cells
  container.querySelectorAll('.sector-cell[data-id]').forEach(cell => {
    cell.addEventListener('click', () => openSectorDetail(cell.dataset.id, cell.dataset.codigo));
  });
}

function sectorCell(s) {
  const cls  = sectorCls(s);
  const libre = s.capacidad_max - s.ocupacion_actual;
  return `
    <div class="sector-cell ${cls}" data-id="${s.id}" data-codigo="${escHtml(s.codigo)}"
         title="${escHtml(s.nombre)} · ${s.ocupacion_actual}/${s.capacidad_max} palés (${s.porcentaje_ocupacion}%)">
      <span class="s-code">${escHtml(s.codigo)}</span>
      <span class="s-occ">${s.ocupacion_actual}/${s.capacidad_max}</span>
      <span class="s-pct">${s.porcentaje_ocupacion}%</span>
    </div>`;
}

async function openSectorDetail(id, codigo) {
  openModal({
    title: `Sector ${codigo}`,
    body: loadingHtml(),
  });

  try {
    const { sector, pales } = await getSectorDetalle(id);
    const libre = sector.capacidad_max - sector.ocupacion_actual;
    const pct   = sector.porcentaje_ocupacion;

    const satColors = {
      libre: '#16a34a', bajo: '#65a30d', medio: '#ca8a04', alto: '#ea580c', critico: '#dc2626'
    };
    const color = satColors[sector.estado_saturacion] || '#64748b';

    const body = `
      <div class="flex-between mb-md">
        <div>
          <div style="font-size:1.1rem;font-weight:700;color:var(--primary)">${escHtml(sector.nombre)}</div>
          <div class="text-muted">${sector.ocupacion_actual} de ${sector.capacidad_max} palés ocupados · ${libre} libres</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:1.5rem;font-weight:800;color:${color}">${pct}%</div>
          <div style="font-size:.72rem;color:${color};text-transform:uppercase;font-weight:600">${sector.estado_saturacion}</div>
        </div>
      </div>
      <div style="background:var(--bg);border-radius:6px;height:8px;margin-bottom:1.25rem;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:6px;transition:width .4s"></div>
      </div>
      ${pales.length === 0
        ? emptyHtml('No hay palés en este sector')
        : `<div class="table-wrapper">
            <table>
              <thead><tr>
                <th>Código</th><th>Mercancía</th><th>Estado</th><th>Entrada</th>
              </tr></thead>
              <tbody>
                ${pales.map(p => `<tr>
                  <td class="font-mono">${escHtml(p.codigo_ref)}</td>
                  <td>${escHtml(p.mercancia || '—')}</td>
                  <td>${badgePale(p.estado)}</td>
                  <td>${formatFecha(p.fecha_entrada)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>`}
      ${sector.notas ? `<div class="alert alert-info mt-md" style="margin-bottom:0"><small>📋 ${escHtml(sector.notas)}</small></div>` : ''}`;

    document.querySelector('.modal-body').innerHTML = body;
  } catch (err) {
    document.querySelector('.modal-body').innerHTML =
      `<div class="alert alert-error">${escHtml(err.message)}</div>`;
  }
}
