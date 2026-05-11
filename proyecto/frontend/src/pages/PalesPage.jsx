import { useState, useEffect, useCallback } from 'react';
import { listarPales, detallePale } from '../services/api';

const ESTADOS = ['', 'emplazado', 'recepcionado', 'en_preparacion', 'expedido'];

export default function PalesPage() {
  const [pales, setPales]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [pagina, setPagina]       = useState(1);
  const [cargando, setCargando]   = useState(true);
  const [filtros, setFiltros]     = useState({ buscar: '', estado: '' });
  const [paleDetalle, setPaleDetalle] = useState(null);
  const [historial, setHistorial]     = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const LIMITE = 15;

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await listarPales({ ...filtros, pagina, limite: LIMITE });
      setPales(data.pales);
      setTotal(data.total);
    } catch {
      /* silencioso */
    } finally {
      setCargando(false);
    }
  }, [filtros, pagina]);

  useEffect(() => { cargar(); }, [cargar]);

  // Reset página al cambiar filtros
  useEffect(() => { setPagina(1); }, [filtros]);

  async function verDetalle(pale) {
    setCargandoDetalle(true);
    setPaleDetalle(pale);
    setHistorial([]);
    try {
      const { data } = await detallePale(pale.id);
      setHistorial(data.historial);
    } catch { /* silencioso */ }
    finally { setCargandoDetalle(false); }
  }

  const totalPaginas = Math.ceil(total / LIMITE);

  const BADGE = {
    emplazado:      'badge badge-emplazado',
    recepcionado:   'badge badge-recepcionado',
    expedido:       'badge badge-expedido',
    en_preparacion: 'badge badge-en_preparacion',
    en_reubicacion: 'badge badge-recepcionado',
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Inventario de Palés</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem', marginTop: '.2rem' }}>
          {total.toLocaleString('es-ES')} registros totales
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por código..."
          value={filtros.buscar}
          onChange={e => setFiltros({ ...filtros, buscar: e.target.value })}
          style={{ maxWidth: 260, textTransform: 'uppercase' }}
        />
        <select
          className="form-control"
          value={filtros.estado}
          onChange={e => setFiltros({ ...filtros, estado: e.target.value })}
          style={{ maxWidth: 180 }}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.filter(Boolean).map(e => (
            <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={cargar}>↻ Refrescar</button>
      </div>

      {/* Tabla */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Estado</th>
                <th>Sector</th>
                <th>Mercancía</th>
                <th>Fecha entrada</th>
                <th>Fecha salida</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="loading"><div className="spinner" />Cargando...</div>
                </td></tr>
              ) : pales.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No se encontraron palés con los filtros aplicados
                </td></tr>
              ) : pales.map(pale => (
                <tr key={pale.id}>
                  <td><strong style={{ fontFamily: 'monospace' }}>{pale.codigo_ref}</strong></td>
                  <td><span className={BADGE[pale.estado] || 'badge'}>{pale.estado.replace(/_/g, ' ')}</span></td>
                  <td>{pale.sector_codigo || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pale.mercancia || <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '.85rem' }}>
                    {new Date(pale.fecha_entrada).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '.85rem', color: '#64748b' }}>
                    {pale.fecha_salida
                      ? new Date(pale.fecha_salida).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
                      : <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => verDetalle(pale)}>
                      Historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
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

      {/* Modal de historial de palé */}
      {paleDetalle && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={() => setPaleDetalle(null)}
        >
          <div
            style={{ background: 'white', borderRadius: 12, padding: '1.5rem', maxWidth: 560, width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>{paleDetalle.codigo_ref}</h2>
                <p style={{ color: '#64748b', fontSize: '.82rem' }}>Historial de movimientos</p>
              </div>
              <button onClick={() => setPaleDetalle(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '.4rem .7rem', cursor: 'pointer' }}>✕</button>
            </div>

            {cargandoDetalle ? (
              <div className="loading"><div className="spinner" />Cargando historial...</div>
            ) : historial.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem' }}>Sin movimientos registrados</p>
            ) : (
              <div style={{ position: 'relative' }}>
                {historial.map((mv, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Línea de tiempo */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                        background: mv.tipo === 'entrada' ? '#dcfce7' : mv.tipo === 'salida' ? '#fee2e2' : '#dbeafe',
                      }}>
                        {mv.tipo === 'entrada' ? '⬇' : mv.tipo === 'salida' ? '⬆' : '↔'}
                      </div>
                      {i < historial.length - 1 && <div style={{ width: 2, flex: 1, background: '#e2e8f0', marginTop: 4 }} />}
                    </div>
                    {/* Contenido */}
                    <div style={{ paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '.9rem', textTransform: 'capitalize' }}>{mv.tipo}</strong>
                        {mv.sector_origen  && <span style={{ fontSize: '.8rem', color: '#64748b' }}>desde {mv.sector_origen}</span>}
                        {mv.sector_destino && <span style={{ fontSize: '.8rem', color: '#64748b' }}>→ {mv.sector_destino}</span>}
                      </div>
                      <div style={{ fontSize: '.78rem', color: '#94a3b8', marginTop: '.2rem' }}>
                        {new Date(mv.fecha_hora).toLocaleString('es-ES')} · {mv.usuario}
                      </div>
                      {mv.notas && <div style={{ fontSize: '.82rem', color: '#475569', marginTop: '.3rem', fontStyle: 'italic' }}>{mv.notas}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
