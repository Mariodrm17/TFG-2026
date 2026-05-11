import { useState, useEffect, useCallback } from 'react';
import { listarIncidencias, resolverIncidencia } from '../services/api';

const TIPO_LABEL = {
  daño:           'Daño físico',
  perdida:        'Pérdida',
  error_registro: 'Error de registro',
  otro:           'Otro',
};

export default function IncidenciasPage() {
  const [incidencias, setIncidencias] = useState([]);
  const [total, setTotal]             = useState(0);
  const [filtroEstado, setFiltroEstado] = useState('abierta');
  const [pagina, setPagina]           = useState(1);
  const [cargando, setCargando]       = useState(true);
  const [modalResolucion, setModalResolucion] = useState(null);
  const [notasResolucion, setNotasResolucion] = useState('');
  const [resolviendo, setResolviendo] = useState(false);
  const [snackbar, setSnackbar]       = useState('');
  const LIMITE = 15;

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await listarIncidencias({ estado: filtroEstado || undefined, pagina, limite: LIMITE });
      setIncidencias(data.incidencias);
      setTotal(data.total);
    } catch {
      /* silencioso */
    } finally {
      setCargando(false);
    }
  }, [filtroEstado, pagina]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { setPagina(1); }, [filtroEstado]);

  function mostrarSnackbar(msg) {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(''), 3500);
  }

  async function confirmarResolucion() {
    if (!modalResolucion) return;
    setResolviendo(true);
    try {
      await resolverIncidencia(modalResolucion.id, { notas_resolucion: notasResolucion || null });
      mostrarSnackbar('✅ Incidencia resuelta. Palé devuelto a estado emplazado.');
      setModalResolucion(null);
      setNotasResolucion('');
      cargar();
    } catch (err) {
      mostrarSnackbar('❌ ' + (err.response?.data?.error || 'Error al resolver la incidencia'));
    } finally {
      setResolviendo(false);
    }
  }

  const totalPaginas = Math.ceil(total / LIMITE);

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Incidencias Operativas</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem', marginTop: '.2rem' }}>
          UC-08 · Registro y resolución de incidencias sobre palés
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {['abierta', 'resuelta', ''].map(est => (
          <button
            key={est || 'todas'}
            onClick={() => setFiltroEstado(est)}
            className="btn btn-sm"
            style={{
              background: filtroEstado === est ? 'var(--color-primary)' : 'var(--color-surface)',
              color:      filtroEstado === est ? 'white' : 'var(--color-text)',
              border:     filtroEstado === est ? 'none' : '1px solid var(--color-border)',
              fontWeight: filtroEstado === est ? 600 : 400,
            }}
          >
            {est === 'abierta' ? '⚠️ Abiertas' : est === 'resuelta' ? '✅ Resueltas' : 'Todas'}
          </button>
        ))}
        <span style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
          {total} incidencia{total !== 1 ? 's' : ''}
        </span>
        <button className="btn btn-secondary btn-sm" onClick={cargar}>↻ Refrescar</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Palé</th>
                <th>Sector</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Reportada por</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="loading"><div className="spinner" />Cargando...</div>
                </td></tr>
              ) : incidencias.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No hay incidencias {filtroEstado === 'abierta' ? 'abiertas' : filtroEstado === 'resuelta' ? 'resueltas' : ''}
                </td></tr>
              ) : incidencias.map(inc => (
                <tr key={inc.id}>
                  <td style={{ color: '#94a3b8', fontSize: '.8rem' }}>#{inc.id}</td>
                  <td><strong style={{ fontFamily: 'monospace' }}>{inc.pale_codigo}</strong></td>
                  <td>{inc.sector_codigo || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                  <td>
                    <span style={{
                      background: '#fef9c3', color: '#854d0e',
                      padding: '.2rem .5rem', borderRadius: 4, fontSize: '.78rem', fontWeight: 500,
                    }}>
                      {TIPO_LABEL[inc.tipo] || inc.tipo}
                    </span>
                  </td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '.85rem' }}>
                    {inc.descripcion}
                  </td>
                  <td style={{ fontSize: '.82rem' }}>{inc.usuario_reporta}</td>
                  <td style={{ fontSize: '.8rem', whiteSpace: 'nowrap', color: '#64748b' }}>
                    {new Date(inc.fecha_creacion).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td>
                    {inc.estado === 'abierta' ? (
                      <span style={{ background: '#fee2e2', color: '#991b1b', padding: '.2rem .6rem', borderRadius: 4, fontSize: '.78rem', fontWeight: 600 }}>
                        Abierta
                      </span>
                    ) : (
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '.2rem .6rem', borderRadius: 4, fontSize: '.78rem', fontWeight: 600 }}>
                        Resuelta
                      </span>
                    )}
                  </td>
                  <td>
                    {inc.estado === 'abierta' && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => { setModalResolucion(inc); setNotasResolucion(''); }}
                      >
                        Resolver
                      </button>
                    )}
                    {inc.estado === 'resuelta' && inc.notas_resolucion && (
                      <span style={{ fontSize: '.75rem', color: '#64748b', fontStyle: 'italic' }}
                        title={inc.notas_resolucion}>
                        Nota ✓
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.5rem', padding: '.875rem', borderTop: '1px solid var(--color-border)' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>
              ← Anterior
            </button>
            <span style={{ fontSize: '.85rem', color: 'var(--color-text-muted)' }}>
              Página {pagina} de {totalPaginas}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Modal de resolución */}
      {modalResolucion && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={() => setModalResolucion(null)}
        >
          <div
            style={{ background: 'white', borderRadius: 12, padding: '1.5rem', maxWidth: 480, width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Resolver incidencia #{modalResolucion.id}</h2>
              <button onClick={() => setModalResolucion(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '.4rem .7rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, padding: '1rem', marginBottom: '1rem', fontSize: '.875rem' }}>
              <div><strong>Palé:</strong> {modalResolucion.pale_codigo}</div>
              <div><strong>Tipo:</strong> {TIPO_LABEL[modalResolucion.tipo]}</div>
              <div style={{ marginTop: '.5rem' }}>{modalResolucion.descripcion}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Notas de resolución (opcional)</label>
              <textarea
                className="form-control"
                placeholder="Describe las acciones correctoras tomadas..."
                value={notasResolucion}
                onChange={e => setNotasResolucion(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setModalResolucion(null)}>
                Cancelar
              </button>
              <button className="btn btn-success" onClick={confirmarResolucion} disabled={resolviendo}>
                {resolviendo ? 'Resolviendo...' : '✅ Marcar como resuelta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {snackbar && <div className="snackbar">{snackbar}</div>}
    </div>
  );
}
