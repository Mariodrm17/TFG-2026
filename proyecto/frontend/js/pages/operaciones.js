import { getLayout, listarMercancias, listarPales, entradaPale, salidaPale, reubicarPale, crearIncidencia } from '../api.js';
import { showSnackbar, escHtml, badgePale, loadingHtml } from '../ui.js';

let _sectores   = [];
let _mercancias = [];

export async function render(container) {
  container.style.padding = '';
  container.style.maxWidth = '';

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">⚙️ Operaciones</h1>
      <p class="page-sub">UC-01 Entrada · UC-02 Salida · UC-04 Reubicación · UC-08 Incidencia</p>
    </div>
    <div class="card">
      <div class="tabs" id="ops-tabs">
        <button class="tab-btn active" data-tab="entrada">⬇ Entrada</button>
        <button class="tab-btn"        data-tab="salida">⬆ Salida</button>
        <button class="tab-btn"        data-tab="reubicacion">↔ Reubicación</button>
        <button class="tab-btn"        data-tab="incidencia">⚠️ Incidencia</button>
      </div>
      <div id="ops-content">${loadingHtml()}</div>
    </div>`;

  // Load shared data
  try {
    const [layoutData, mercData] = await Promise.all([getLayout(), listarMercancias()]);
    _sectores   = layoutData.sectores.filter(s => s.activo);
    _mercancias = mercData.mercancias;
  } catch {
    _sectores = []; _mercancias = [];
  }

  renderTab('entrada');

  document.getElementById('ops-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTab(btn.dataset.tab);
  });
}

function renderTab(tab) {
  const el = document.getElementById('ops-content');
  if (!el) return;
  const renderers = { entrada: tabEntrada, salida: tabSalida, reubicacion: tabReubicacion, incidencia: tabIncidencia };
  renderers[tab]?.(el);
}

// ── TAB: ENTRADA (UC-01) ──────────────────────────────────────
function tabEntrada(el) {
  const sectOpts = _sectores.map(s => {
    const full = s.ocupacion_actual >= s.capacidad_max;
    return `<option value="${s.id}" ${full ? 'disabled' : ''}>
      ${escHtml(s.codigo)} · ${s.ocupacion_actual}/${s.capacidad_max} palés${full ? ' — LLENO' : ''}
    </option>`;
  }).join('');

  const mercOpts = _mercancias.map(m =>
    `<option value="${m.id}">${escHtml(m.descripcion)} ${m.peso_kg ? `(${m.peso_kg} kg)` : ''}</option>`
  ).join('');

  el.innerHTML = `
    <div id="entrada-alert"></div>
    <form id="form-entrada">
      <div class="form-group">
        <label class="form-label">Código de referencia del palé *</label>
        <input class="form-control font-mono" type="text" id="e-codigo" required
               placeholder="Ej: JH-8819-A" autocomplete="off"
               style="text-transform:uppercase;font-size:1.05rem;letter-spacing:.04em">
        <div class="form-hint">Formato: JH-XXXX-X · Se convierte a mayúsculas automáticamente</div>
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de mercancía</label>
        <select class="form-control" id="e-mercancia">
          <option value="">— Sin especificar —</option>
          ${mercOpts}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Sector destino *</label>
        <select class="form-control" id="e-sector" required>
          <option value="">— Selecciona un sector —</option>
          ${sectOpts}
        </select>
        <div id="e-sector-preview"></div>
      </div>
      <div class="form-group">
        <label class="form-label">Notas (opcional)</label>
        <input class="form-control" type="text" id="e-notas" placeholder="Observaciones de esta entrada...">
      </div>
      <button type="submit" class="btn btn-success btn-block btn-lg" id="btn-entrada">
        ⬇ Registrar entrada de palé
      </button>
    </form>`;

  document.getElementById('e-codigo').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  document.getElementById('e-sector').addEventListener('change', (e) => {
    const s = _sectores.find(x => x.id === parseInt(e.target.value));
    const preview = document.getElementById('e-sector-preview');
    if (!s) { preview.innerHTML = ''; return; }
    const libre = s.capacidad_max - s.ocupacion_actual;
    const satBg = { libre:'#bbf7d0', bajo:'#d9f99d', medio:'#fef08a', alto:'#fed7aa', critico:'#fecaca' };
    const bg = satBg[s.estado_saturacion] || '#f1f5f9';
    preview.innerHTML = `
      <div class="pale-card" style="background:${bg};margin-top:.5rem">
        <div class="font-bold">${escHtml(s.nombre)}</div>
        <div class="text-muted" style="margin-top:.25rem">
          Libre: <strong>${libre} palés</strong> · Ocupación: <strong>${s.porcentaje_ocupacion}%</strong>
        </div>
      </div>`;
  });

  document.getElementById('form-entrada').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn     = document.getElementById('btn-entrada');
    const alertEl = document.getElementById('entrada-alert');
    alertEl.innerHTML = '';
    btn.disabled = true;
    btn.textContent = 'Registrando...';

    const codigo_ref   = document.getElementById('e-codigo').value.trim().toUpperCase();
    const sector_id    = parseInt(document.getElementById('e-sector').value);
    const mercancia_id = document.getElementById('e-mercancia').value
      ? parseInt(document.getElementById('e-mercancia').value) : null;
    const notas = document.getElementById('e-notas').value.trim() || null;

    try {
      await entradaPale({ codigo_ref, sector_id, mercancia_id, notas });
      showSnackbar(`Palé ${codigo_ref} registrado correctamente`, 'success');
      alertEl.innerHTML = `<div class="alert alert-success">✅ Palé <strong>${escHtml(codigo_ref)}</strong> registrado en el sector seleccionado.</div>`;
      document.getElementById('form-entrada').reset();
      document.getElementById('e-sector-preview').innerHTML = '';
      // Refresh sectors
      try {
        const fresh = await getLayout();
        _sectores = fresh.sectores.filter(s => s.activo);
      } catch { /* ignore */ }
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error">❌ ${escHtml(err.message)}</div>`;
      showSnackbar(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '⬇ Registrar entrada de palé';
    }
  });
}

// ── TAB: SALIDA (UC-02) ───────────────────────────────────────
function tabSalida(el) {
  let paleEncontrado = null;

  el.innerHTML = `
    <div id="salida-alert"></div>
    <div class="form-group">
      <label class="form-label">Buscar palé por código de referencia</label>
      <div class="search-row" style="margin-bottom:0">
        <input class="form-control font-mono" type="text" id="s-buscar" placeholder="Ej: JH-8819-A"
               autocomplete="off" style="text-transform:uppercase;max-width:280px">
        <button class="btn btn-primary" id="btn-buscar-salida">Buscar</button>
      </div>
    </div>
    <div id="s-pale-info"></div>
    <div id="s-form" style="display:none">
      <div class="form-group">
        <label class="form-label">Notas de salida (opcional)</label>
        <input class="form-control" type="text" id="s-notas" placeholder="Motivo de la salida, destino...">
      </div>
      <button class="btn btn-danger btn-block btn-lg" id="btn-confirmar-salida">
        ⬆ Confirmar expedición del palé
      </button>
    </div>`;

  document.getElementById('s-buscar').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  document.getElementById('btn-buscar-salida').addEventListener('click', async () => {
    const codigo = document.getElementById('s-buscar').value.trim().toUpperCase();
    if (!codigo) return;
    const infoEl = document.getElementById('s-pale-info');
    const formEl = document.getElementById('s-form');
    infoEl.innerHTML = loadingHtml();
    formEl.style.display = 'none';
    paleEncontrado = null;

    try {
      const data = await listarPales({ buscar: codigo, limite: 10 });
      const pale = data.pales.find(p => p.codigo_ref === codigo && p.estado !== 'expedido');
      if (!pale) {
        infoEl.innerHTML = `<div class="alert alert-warning">No se encontró un palé activo con código <strong>${escHtml(codigo)}</strong></div>`;
        return;
      }
      paleEncontrado = pale;
      infoEl.innerHTML = `
        <div class="pale-card mt-sm">
          <div class="pc-code">${escHtml(pale.codigo_ref)}</div>
          <div class="pc-meta">
            <span>ID: <strong>${pale.id}</strong></span>
            <span>Sector: <strong>${escHtml(pale.sector_codigo || '—')}</strong></span>
            <span>Mercancía: <strong>${escHtml(pale.mercancia || '—')}</strong></span>
            <span>Estado: ${badgePale(pale.estado)}</span>
          </div>
        </div>`;
      formEl.style.display = 'block';
    } catch (err) {
      infoEl.innerHTML = `<div class="alert alert-error">${escHtml(err.message)}</div>`;
    }
  });

  document.getElementById('btn-confirmar-salida').addEventListener('click', async () => {
    if (!paleEncontrado) return;
    const btn     = document.getElementById('btn-confirmar-salida');
    const alertEl = document.getElementById('salida-alert');
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    const notas = document.getElementById('s-notas').value.trim() || null;

    try {
      await salidaPale(paleEncontrado.id, notas);
      showSnackbar(`Palé ${paleEncontrado.codigo_ref} expedido correctamente`, 'success');
      alertEl.innerHTML = `<div class="alert alert-success">✅ Palé <strong>${escHtml(paleEncontrado.codigo_ref)}</strong> expedido. El sector ha sido actualizado.</div>`;
      document.getElementById('s-pale-info').innerHTML = '';
      document.getElementById('s-form').style.display = 'none';
      document.getElementById('s-buscar').value = '';
      paleEncontrado = null;
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error">❌ ${escHtml(err.message)}</div>`;
      showSnackbar(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '⬆ Confirmar expedición del palé';
    }
  });
}

// ── TAB: REUBICACIÓN (UC-04) ──────────────────────────────────
function tabReubicacion(el) {
  let paleEncontrado = null;

  const sectOpts = _sectores.map(s => {
    const full = s.ocupacion_actual >= s.capacidad_max;
    return `<option value="${s.id}" ${full ? 'disabled' : ''}>
      ${escHtml(s.codigo)} · ${s.ocupacion_actual}/${s.capacidad_max}${full ? ' — LLENO' : ''}
    </option>`;
  }).join('');

  el.innerHTML = `
    <div id="reub-alert"></div>
    <div class="form-group">
      <label class="form-label">Buscar palé por código de referencia</label>
      <div class="search-row" style="margin-bottom:0">
        <input class="form-control font-mono" type="text" id="r-buscar" placeholder="Ej: JH-8819-A"
               autocomplete="off" style="text-transform:uppercase;max-width:280px">
        <button class="btn btn-primary" id="btn-buscar-reub">Buscar</button>
      </div>
    </div>
    <div id="r-pale-info"></div>
    <div id="r-form" style="display:none">
      <div class="form-group">
        <label class="form-label">Sector destino *</label>
        <select class="form-control" id="r-sector">
          <option value="">— Selecciona el sector destino —</option>
          ${sectOpts}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Notas (opcional)</label>
        <input class="form-control" type="text" id="r-notas" placeholder="Motivo de la reubicación...">
      </div>
      <button class="btn btn-warning btn-block btn-lg" id="btn-confirmar-reub">
        ↔ Confirmar reubicación
      </button>
    </div>`;

  document.getElementById('r-buscar').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  document.getElementById('btn-buscar-reub').addEventListener('click', async () => {
    const codigo = document.getElementById('r-buscar').value.trim().toUpperCase();
    if (!codigo) return;
    const infoEl = document.getElementById('r-pale-info');
    const formEl = document.getElementById('r-form');
    infoEl.innerHTML = loadingHtml();
    formEl.style.display = 'none';
    paleEncontrado = null;

    try {
      const data = await listarPales({ buscar: codigo, limite: 10 });
      const pale = data.pales.find(p => p.codigo_ref === codigo && p.estado !== 'expedido');
      if (!pale) {
        infoEl.innerHTML = `<div class="alert alert-warning">No se encontró un palé activo con código <strong>${escHtml(codigo)}</strong></div>`;
        return;
      }
      paleEncontrado = pale;
      infoEl.innerHTML = `
        <div class="pale-card mt-sm">
          <div class="pc-code">${escHtml(pale.codigo_ref)}</div>
          <div class="pc-meta">
            <span>Sector actual: <strong>${escHtml(pale.sector_codigo || '—')}</strong></span>
            <span>Mercancía: <strong>${escHtml(pale.mercancia || '—')}</strong></span>
            <span>Estado: ${badgePale(pale.estado)}</span>
          </div>
        </div>`;
      formEl.style.display = 'block';
      // Pre-filter sector destino: hide current sector
      document.querySelectorAll('#r-sector option').forEach(opt => {
        if (opt.value && opt.value === String(pale.sector_id)) {
          opt.disabled = true;
          opt.text += ' (sector actual)';
        }
      });
    } catch (err) {
      infoEl.innerHTML = `<div class="alert alert-error">${escHtml(err.message)}</div>`;
    }
  });

  document.getElementById('btn-confirmar-reub').addEventListener('click', async () => {
    if (!paleEncontrado) return;
    const btn     = document.getElementById('btn-confirmar-reub');
    const alertEl = document.getElementById('reub-alert');
    const sectorDest = document.getElementById('r-sector').value;
    if (!sectorDest) { showSnackbar('Selecciona un sector destino', 'warning'); return; }

    btn.disabled = true;
    btn.textContent = 'Procesando...';

    const notas = document.getElementById('r-notas').value.trim() || null;

    try {
      await reubicarPale(paleEncontrado.id, { sector_destino_id: parseInt(sectorDest), notas });
      showSnackbar(`Palé ${paleEncontrado.codigo_ref} reubicado correctamente`, 'success');
      alertEl.innerHTML = `<div class="alert alert-success">✅ Palé <strong>${escHtml(paleEncontrado.codigo_ref)}</strong> reubicado al nuevo sector.</div>`;
      document.getElementById('r-pale-info').innerHTML = '';
      document.getElementById('r-form').style.display = 'none';
      document.getElementById('r-buscar').value = '';
      paleEncontrado = null;
      // Refresh sectors
      try { const f = await getLayout(); _sectores = f.sectores.filter(s => s.activo); } catch { /* ignore */ }
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error">❌ ${escHtml(err.message)}</div>`;
      showSnackbar(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '↔ Confirmar reubicación';
    }
  });
}

// ── TAB: INCIDENCIA (UC-08) ───────────────────────────────────
function tabIncidencia(el) {
  let paleEncontrado = null;

  el.innerHTML = `
    <div id="inc-alert"></div>
    <div class="form-group">
      <label class="form-label">Buscar palé afectado por código de referencia</label>
      <div class="search-row" style="margin-bottom:0">
        <input class="form-control font-mono" type="text" id="i-buscar" placeholder="Ej: JH-8819-A"
               autocomplete="off" style="text-transform:uppercase;max-width:280px">
        <button class="btn btn-primary" id="btn-buscar-inc">Buscar</button>
      </div>
    </div>
    <div id="i-pale-info"></div>
    <div id="i-form" style="display:none">
      <div class="form-group">
        <label class="form-label">Tipo de incidencia *</label>
        <select class="form-control" id="i-tipo">
          <option value="otro">Otro</option>
          <option value="daño">Daño físico</option>
          <option value="perdida">Pérdida</option>
          <option value="error_registro">Error de registro</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Descripción de la incidencia *</label>
        <textarea class="form-control" id="i-desc" rows="3"
                  placeholder="Describe detalladamente qué ocurrió con este palé..." required></textarea>
      </div>
      <div class="alert alert-warning" style="margin-bottom:1rem">
        ⚠️ Al registrar la incidencia el palé quedará <strong>bloqueado</strong> hasta que sea resuelto por un gerente o administrador.
      </div>
      <button class="btn btn-accent btn-block btn-lg" id="btn-confirmar-inc">
        ⚠️ Registrar incidencia
      </button>
    </div>`;

  document.getElementById('i-buscar').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  document.getElementById('btn-buscar-inc').addEventListener('click', async () => {
    const codigo = document.getElementById('i-buscar').value.trim().toUpperCase();
    if (!codigo) return;
    const infoEl = document.getElementById('i-pale-info');
    const formEl = document.getElementById('i-form');
    infoEl.innerHTML = loadingHtml();
    formEl.style.display = 'none';
    paleEncontrado = null;

    try {
      const data = await listarPales({ buscar: codigo, limite: 10 });
      const pale = data.pales.find(p => p.codigo_ref === codigo && p.estado !== 'expedido');
      if (!pale) {
        infoEl.innerHTML = `<div class="alert alert-warning">No se encontró un palé activo con código <strong>${escHtml(codigo)}</strong></div>`;
        return;
      }
      paleEncontrado = pale;
      infoEl.innerHTML = `
        <div class="pale-card mt-sm">
          <div class="pc-code">${escHtml(pale.codigo_ref)}</div>
          <div class="pc-meta">
            <span>Sector: <strong>${escHtml(pale.sector_codigo || '—')}</strong></span>
            <span>Mercancía: <strong>${escHtml(pale.mercancia || '—')}</strong></span>
            <span>Estado: ${badgePale(pale.estado)}</span>
          </div>
        </div>`;
      formEl.style.display = 'block';
    } catch (err) {
      infoEl.innerHTML = `<div class="alert alert-error">${escHtml(err.message)}</div>`;
    }
  });

  document.getElementById('btn-confirmar-inc').addEventListener('click', async () => {
    if (!paleEncontrado) return;
    const btn     = document.getElementById('btn-confirmar-inc');
    const alertEl = document.getElementById('inc-alert');
    const descripcion = document.getElementById('i-desc').value.trim();
    if (!descripcion) { showSnackbar('La descripción es obligatoria', 'warning'); return; }

    btn.disabled = true;
    btn.textContent = 'Registrando...';

    const tipo = document.getElementById('i-tipo').value;

    try {
      await crearIncidencia({ pale_id: paleEncontrado.id, descripcion, tipo });
      showSnackbar('Incidencia registrada correctamente', 'success');
      alertEl.innerHTML = `<div class="alert alert-success">✅ Incidencia registrada sobre el palé <strong>${escHtml(paleEncontrado.codigo_ref)}</strong>. Queda bloqueado hasta su resolución.</div>`;
      document.getElementById('i-pale-info').innerHTML = '';
      document.getElementById('i-form').style.display = 'none';
      document.getElementById('i-buscar').value = '';
      paleEncontrado = null;
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error">❌ ${escHtml(err.message)}</div>`;
      showSnackbar(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '⚠️ Registrar incidencia';
    }
  });
}
