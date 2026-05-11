import { getDashboard } from '../api.js';
import { escHtml, loadingHtml, emptyHtml } from '../ui.js';

export async function render(container) {
  container.style.padding = '';
  container.style.maxWidth = '';

  container.innerHTML = `
    <div class="page-header flex-between">
      <div>
        <h1 class="page-title">📊 Dashboard Estadístico</h1>
        <p class="page-sub">UC-05 · KPIs operativos en tiempo real · Actualizable manualmente</p>
      </div>
      <button class="btn btn-outline btn-sm" id="btn-refresh-dash">↻ Actualizar</button>
    </div>
    <div id="dash-content">${loadingHtml()}</div>`;

  document.getElementById('btn-refresh-dash').addEventListener('click', cargarDashboard);
  await cargarDashboard();
}

async function cargarDashboard() {
  const el = document.getElementById('dash-content');
  if (!el) return;
  el.innerHTML = loadingHtml();

  try {
    const { kpis, movimientos7d, topSectores, estadosPales } = await getDashboard();
    el.innerHTML = buildDashboard(kpis, movimientos7d, topSectores, estadosPales);
  } catch (err) {
    el.innerHTML = `<div class="alert alert-error">Error al cargar estadísticas: ${escHtml(err.message)}</div>`;
  }
}

function buildDashboard(kpis, movimientos7d, topSectores, estadosPales) {
  const ocupColor = kpis.ocupacion_media_pct >= 90 ? 'warning'
    : kpis.ocupacion_media_pct >= 70 ? 'accent' : 'success';

  // Group movimientos by tipo for the 7d chart
  const dayMap = {};
  movimientos7d.forEach(m => {
    if (!dayMap[m.fecha]) dayMap[m.fecha] = { entrada: 0, salida: 0, reubicacion: 0, ajuste: 0 };
    dayMap[m.fecha][m.tipo] = (dayMap[m.fecha][m.tipo] || 0) + m.total;
  });
  const dias = Object.keys(dayMap).sort();

  const maxBarra = Math.max(...topSectores.map(s => s.pct), 1);

  const ESTADO_LABELS = {
    recepcionado: 'Recepcionado', emplazado: 'Emplazado',
    en_reubicacion: 'En reubicación', en_preparacion: 'En preparación', expedido: 'Expedido',
  };
  const ESTADO_BADGE = {
    emplazado: 'badge-success', expedido: 'badge-gray',
    recepcionado: 'badge-info', en_reubicacion: 'badge-warning', en_preparacion: 'badge-warning',
  };

  return `
    <!-- KPIs -->
    <div class="grid grid-4 mb-md" style="margin-bottom:1.5rem">
      <div class="kpi-card">
        <div class="kpi-icon">📦</div>
        <div>
          <div class="kpi-value">${kpis.pales_en_almacen}</div>
          <div class="kpi-label">Palés en almacén</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon success">⬇</div>
        <div>
          <div class="kpi-value">${kpis.entradas_hoy}</div>
          <div class="kpi-label">Entradas hoy</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon accent">⬆</div>
        <div>
          <div class="kpi-value">${kpis.salidas_hoy}</div>
          <div class="kpi-label">Salidas hoy</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon info">↔</div>
        <div>
          <div class="kpi-value">${kpis.reubicaciones_hoy}</div>
          <div class="kpi-label">Reubicaciones hoy</div>
        </div>
      </div>
    </div>

    <!-- Ocupación global + Distribución estados -->
    <div class="grid grid-2" style="margin-bottom:1.5rem">
      <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:.75rem">
        <div class="kpi-label" style="font-size:.8rem">Ocupación media del almacén</div>
        <div style="font-size:2.5rem;font-weight:800;color:var(--primary);line-height:1">
          ${kpis.ocupacion_media_pct ?? 0}%
        </div>
        <div style="width:100%;background:var(--bg);border-radius:6px;height:10px;overflow:hidden;border:1px solid var(--border)">
          <div style="height:100%;width:${kpis.ocupacion_media_pct ?? 0}%;
            background:${kpis.ocupacion_media_pct >= 90 ? 'var(--danger)' : kpis.ocupacion_media_pct >= 70 ? 'var(--warning)' : 'var(--success)'};
            border-radius:6px;transition:width .5s"></div>
        </div>
        <div class="text-muted" style="font-size:.78rem">Media de ocupación de los 38 sectores</div>
      </div>
      <div class="card" style="box-shadow:none">
        <div class="card-title" style="margin-bottom:.875rem">Distribución por estado</div>
        <div style="display:flex;flex-direction:column;gap:.5rem">
          ${estadosPales.map(e => `
            <div class="flex-between">
              <span class="badge ${ESTADO_BADGE[e.estado] || 'badge-gray'}">${ESTADO_LABELS[e.estado] || e.estado}</span>
              <strong style="color:var(--primary)">${e.total} palés</strong>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Movimientos 7 días -->
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-header">
        <span class="card-title">📅 Movimientos — últimos 7 días</span>
      </div>
      ${dias.length === 0
        ? emptyHtml('Sin movimientos en los últimos 7 días')
        : `<div class="table-wrapper">
            <table>
              <thead><tr>
                <th>Fecha</th>
                <th>⬇ Entradas</th>
                <th>⬆ Salidas</th>
                <th>↔ Reubicaciones</th>
                <th>Total</th>
              </tr></thead>
              <tbody>
                ${dias.map(fecha => {
                  const d = dayMap[fecha];
                  const total = (d.entrada||0) + (d.salida||0) + (d.reubicacion||0) + (d.ajuste||0);
                  const [, mm, dd] = fecha.split('-');
                  return `<tr>
                    <td><strong>${dd}/${mm}</strong></td>
                    <td>${d.entrada || 0}</td>
                    <td>${d.salida || 0}</td>
                    <td>${d.reubicacion || 0}</td>
                    <td><strong>${total}</strong></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`}
    </div>

    <!-- Top 5 sectores más ocupados -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">🏆 Top 5 sectores más ocupados</span>
      </div>
      ${topSectores.length === 0
        ? emptyHtml('Sin datos de sectores')
        : `<div class="bar-chart">
            ${topSectores.map(s => {
              const w = Math.round((s.pct / maxBarra) * 100);
              const color = s.pct >= 95 ? 'var(--danger)' : s.pct >= 75 ? 'var(--warning)' : 'var(--primary)';
              return `<div class="bar-row">
                <span class="bar-lbl">${escHtml(s.codigo)}</span>
                <div class="bar-track">
                  <div class="bar-fill" style="width:${w}%;background:${color}">
                    ${w > 15 ? `<span class="bar-fill-val">${s.ocupacion_actual}/${s.capacidad_max}</span>` : ''}
                  </div>
                </div>
                <span class="bar-pct">${s.pct}%</span>
              </div>`;
            }).join('')}
          </div>`}
    </div>`;
}
