import { getLayout, getSectorDetalle } from '../api.js';
import { openModal, escHtml, sectorCls, badgePale, formatFecha, loadingHtml, emptyHtml } from '../ui.js';

// Definición de filas del almacén real (almacenjh)
const FILAS = ['A','B','C','D','E','F','G','H','J','K'];

// Para la fila E, E01-E07 están anulados; E08-E10 son los activos.
// Mostramos huecos vacíos en las posiciones 01-07 para mantener la alineación visual.
const E_OFFSET = 7; // número de huecos antes de E08

export async function render(container) {
  container.style.padding = '';
  container.style.maxWidth = '';

  container.innerHTML = `
    <div class="page-header flex-between">
      <div>
        <h1 class="page-title">🗺 Layout del Almacén</h1>
        <p class="page-sub">Plano real · Sectores A–K · CrossDocking · Cuarentena · Buffer</p>
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

  // Categorizar sectores por zona
  const almacen      = sectores.filter(s => /^[A-KA-K]/.test(s.codigo) && !/^(Q|W|ZF)/.test(s.codigo));
  const crossdocking = sectores.filter(s => s.codigo.startsWith('W'));
  const cuarentena   = sectores.filter(s => s.codigo.startsWith('Q'));
  const buffer       = sectores.filter(s => s.codigo.startsWith('ZF'));

  // Agrupar almacén por letra de fila
  const porFila = {};
  FILAS.forEach(f => { porFila[f] = []; });
  almacen.forEach(s => {
    const letra = s.codigo.charAt(0);
    if (porFila[letra]) porFila[letra].push(s);
  });
  // Ordenar sectores dentro de cada fila por número
  FILAS.forEach(f => porFila[f].sort((a,b) => a.codigo.localeCompare(b.codigo)));

  contentEl.innerHTML = `
    <div class="layout-page">

      <!-- ── KPIs globales ───────────────────────────────── -->
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
          <div class="kpi-icon ${resumen.ocupacion_global >= 90 ? 'warning' : resumen.ocupacion_global >= 70 ? 'accent' : 'success'}">📊</div>
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

      <!-- ── Leyenda ──────────────────────────────────────── -->
      <div class="card" style="padding:.75rem 1.25rem">
        <div class="legend">
          <span class="legend-item"><span class="legend-dot" style="background:#bbf7d0;border:1px solid #16a34a"></span>Libre (0%)</span>
          <span class="legend-item"><span class="legend-dot" style="background:#d9f99d;border:1px solid #65a30d"></span>Bajo (&lt;50%)</span>
          <span class="legend-item"><span class="legend-dot" style="background:#fef08a;border:1px solid #ca8a04"></span>Medio (&lt;75%)</span>
          <span class="legend-item"><span class="legend-dot" style="background:#fed7aa;border:1px solid #ea580c"></span>Alto (&lt;95%)</span>
          <span class="legend-item"><span class="legend-dot" style="background:#fecaca;border:1px solid #dc2626"></span>Crítico (≥95%)</span>
          <span class="text-muted" style="margin-left:auto;font-size:.78rem">Clic en un sector para ver sus palés</span>
        </div>
      </div>

      <!-- ── Zona superior: CrossDocking + Playas ─────────── -->
      <div class="zonas-superiores">
        <!-- CrossDocking -->
        <div class="card zona-card zona-crossdocking">
          <div class="zona-titulo">⚓ CrossDocking</div>
          <div class="zona-sectores">
            ${crossdocking.map(s => sectorCell(s)).join('')}
          </div>
        </div>
        <!-- Entry Yard (estático, no es un sector WMS) -->
        <div class="card zona-card zona-playa-entrada">
          <div class="zona-titulo">🟡 Entry Yard Location</div>
          <div class="zona-info-text">Zona de descarga de camiones.<br>Palés pendientes de ubicar.</div>
        </div>
        <!-- Departure Yard (estático) -->
        <div class="card zona-card zona-playa-salida">
          <div class="zona-titulo">🟣 Departure Yard Location</div>
          <div class="zona-info-text">Zona de carga para expedición.<br>Palés preparados para embarque.</div>
        </div>
      </div>

      <!-- ── Nave principal: filas A-K ────────────────────── -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🏭 Nave Principal — Filas A–K</span>
          <span class="text-muted" style="font-size:.8rem">${almacen.length} sectores</span>
        </div>
        <div class="almacen-nave" id="sector-grid">
          ${FILAS.map(f => renderFila(f, porFila[f])).join('')}
        </div>
      </div>

      <!-- ── Cuarentena ────────────────────────────────────── -->
      ${cuarentena.length ? `
      <div class="card">
        <div class="card-header">
          <span class="card-title" style="color:#b91c1c">🚫 Cuarentena</span>
          <span class="text-muted" style="font-size:.8rem">${cuarentena.length} sectores</span>
        </div>
        <div class="zona-grid-q">
          ${cuarentena.map(s => sectorCell(s, 'cuarentena')).join('')}
        </div>
      </div>` : ''}

      <!-- ── Buffer ────────────────────────────────────────── -->
      ${buffer.length ? `
      <div class="card">
        <div class="card-header">
          <span class="card-title" style="color:#a16207">🟡 Buffer</span>
          <span class="text-muted" style="font-size:.8rem">${buffer.length} sectores</span>
        </div>
        <div class="zona-grid-buf">
          ${buffer.map(s => sectorCell(s)).join('')}
        </div>
      </div>` : ''}

    </div>`;

  // Eventos de clic en todos los sectores
  container.querySelectorAll('.sector-cell[data-id]').forEach(cell => {
    cell.addEventListener('click', () => openSectorDetail(cell.dataset.id, cell.dataset.codigo));
  });
}

// Renderiza una fila completa (ej: fila A con A01-A11)
function renderFila(letra, sectores) {
  if (!sectores.length && letra !== 'E') return '';

  // Para la fila E: insertar 7 huecos antes de E08 para mantener alineación visual
  let cells = '';
  if (letra === 'E') {
    for (let i = 0; i < E_OFFSET; i++) {
      cells += `<div class="sector-cell-gap"></div>`;
    }
  }
  cells += sectores.map(s => sectorCell(s)).join('');

  return `
    <div class="almacen-fila">
      <div class="fila-label">${letra}</div>
      <div class="fila-sectores">
        ${cells}
      </div>
    </div>`;
}

// Genera el HTML de una celda de sector
function sectorCell(s, zonaClass = '') {
  const cls   = sectorCls(s);
  const extra = zonaClass ? ` zona-${zonaClass}` : '';
  return `
    <div class="sector-cell ${cls}${extra}" data-id="${s.id}" data-codigo="${escHtml(s.codigo)}"
         title="${escHtml(s.nombre)} · ${s.ocupacion_actual}/${s.capacidad_max} palés (${s.porcentaje_ocupacion}%)">
      <span class="s-code">${escHtml(s.codigo)}</span>
      <span class="s-occ">${s.ocupacion_actual}/${s.capacidad_max}</span>
      <span class="s-pct">${s.porcentaje_ocupacion}%</span>
    </div>`;
}

// Abre el modal de detalle de sector
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
          <div class="text-muted">${sector.ocupacion_actual} de ${sector.capacidad_max} palés · ${libre} libres</div>
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
