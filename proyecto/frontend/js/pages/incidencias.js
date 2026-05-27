import { listarIncidencias, resolverIncidencia } from '../api.js';
import { openModal, closeModal, showSnackbar, escHtml, badgeIncEstado, labelTipoInc, formatFecha, loadingHtml, emptyHtml } from '../ui.js';
import { currentUser } from '../app.js';

let _pagina  = 1;
let _filtros = { estado: '' };

export async function render(container) {
  container.style.padding = '';
  container.style.maxWidth = '';

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">⚠️ Gestión de Incidencias</h1>
      <p class="page-sub">UC-08 · Registro y resolución de incidencias operativas</p>
    </div>
    <div class="card">
      <div class="search-row">
        <select id="f-estado-inc">
          <option value="">Todas las incidencias</option>
          <option value="abierta">Abiertas</option>
          <option value="resuelta">Resueltas</option>
        </select>
        <button class="btn btn-primary" id="btn-filtrar-inc">Filtrar</button>
        <button class="btn btn-outline"  id="btn-reset-inc">↺ Mostrar todas</button>
      </div>
      <div id="inc-tabla">${loadingHtml()}</div>
    </div>`;

  document.getElementById('btn-filtrar-inc').addEventListener('click', () => {
    _pagina = 1;
    _filtros.estado = document.getElementById('f-estado-inc').value;
    cargarIncidencias();
  });

  document.getElementById('btn-reset-inc').addEventListener('click', () => {
    _pagina = 1;
    _filtros.estado = '';
    document.getElementById('f-estado-inc').value = '';
    cargarIncidencias();
  });

  await cargarIncidencias();
}

async function cargarIncidencias() {
  const el = document.getElementById('inc-tabla');
  if (!el) return;
  el.innerHTML = loadingHtml();

  try {
    const params = { pagina: _pagina, limite: 20, ..._filtros };
    const { incidencias, total } = await listarIncidencias(params);
    renderTabla(el, incidencias, total);
  } catch (err) {
    el.innerHTML = `<div class="alert alert-error">${escHtml(err.message)}</div>`;
  }
}

function renderTabla(el, incidencias, total) {
  const limite = 20;
  const desde  = (_pagina - 1) * limite + 1;
  const hasta  = Math.min(_pagina * limite, total);
  const isAdmin = currentUser?.rol === 'administrador';

  if (incidencias.length === 0) {
    el.innerHTML = emptyHtml('No se encontraron incidencias');
    return;
  }

  el.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead><tr>
          <th>Palé</th>
          <th>Descripción</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Reportado por</th>
          <th>Fecha</th>
          <th>Resuelto por</th>
          ${isAdmin ? '<th>Acciones</th>' : ''}
        </tr></thead>
        <tbody>
          ${incidencias.map(inc => `
            <tr>
              <td class="font-mono font-bold">${escHtml(inc.pale_codigo)}</td>
              <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
                  title="${escHtml(inc.descripcion)}">${escHtml(inc.descripcion)}</td>
              <td><span class="badge badge-accent">${labelTipoInc(inc.tipo)}</span></td>
              <td>${badgeIncEstado(inc.estado)}</td>
              <td>${escHtml(inc.usuario_reporta)}</td>
              <td>${formatFecha(inc.fecha_creacion)}</td>
              <td>${inc.usuario_resuelve ? escHtml(inc.usuario_resuelve) : '—'}</td>
              ${isAdmin ? `<td>
                ${inc.estado === 'abierta'
                  ? `<button class="btn btn-success btn-sm" onclick="window.__resolverInc(${inc.id}, '${escHtml(inc.pale_codigo)}')">✔ Resolver</button>`
                  : `<span class="text-muted" style="font-size:.75rem">${formatFecha(inc.fecha_resolucion)}</span>`}
              </td>` : ''}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <span>Mostrando <strong>${desde}–${hasta}</strong> de <strong>${total}</strong></span>
      <div class="pagination-btns">
        <button class="page-btn" id="inc-prev" ${_pagina <= 1 ? 'disabled' : ''}>‹ Anterior</button>
        <button class="page-btn" id="inc-next" ${hasta >= total ? 'disabled' : ''}>Siguiente ›</button>
      </div>
    </div>`;

  document.getElementById('inc-prev')?.addEventListener('click', () => { _pagina--; cargarIncidencias(); });
  document.getElementById('inc-next')?.addEventListener('click', () => { _pagina++; cargarIncidencias(); });

  if (isAdmin) {
    window.__resolverInc = (id, codigo) => abrirModalResolver(id, codigo);
  }
}

function abrirModalResolver(incId, codigo) {
  openModal({
    title: `Resolver incidencia — Palé ${codigo}`,
    body: `
      <p class="text-muted" style="margin-bottom:1rem">
        Al resolver la incidencia el palé quedará de nuevo en estado <strong>Emplazado</strong>.
      </p>
      <div class="form-group">
        <label class="form-label">Notas de resolución (opcional)</label>
        <textarea class="form-control" id="modal-notas-res" rows="3"
                  placeholder="Describe cómo se resolvió la incidencia..."></textarea>
      </div>`,
    footer: `
      <button class="btn btn-outline" onclick="document.getElementById('modal-overlay').dispatchEvent(new MouseEvent('click'))">Cancelar</button>
      <button class="btn btn-success" id="btn-confirmar-res">✔ Confirmar resolución</button>`,
  });

  document.getElementById('btn-confirmar-res').addEventListener('click', async () => {
    const btn   = document.getElementById('btn-confirmar-res');
    const notas = document.getElementById('modal-notas-res').value.trim() || null;
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    try {
      await resolverIncidencia(incId, { notas_resolucion: notas });
      showSnackbar('Incidencia resuelta correctamente', 'success');
      closeModal();
      _pagina = 1;
      cargarIncidencias();
    } catch (err) {
      showSnackbar(err.message, 'error');
      btn.disabled = false;
      btn.textContent = '✔ Confirmar resolución';
    }
  });
}
