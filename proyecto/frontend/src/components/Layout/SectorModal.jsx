import { useEffect, useState } from 'react';
import { getSectorDetalle } from '../../services/api';

const COLOR = {
  libre: '#22c55e', bajo: '#86efac', medio: '#facc15',
  alto: '#f97316', critico: '#ef4444',
};

export default function SectorModal({ sector, onClose, onRefresh }) {
  const [detalle, setDetalle]   = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getSectorDetalle(sector.id)
      .then(r => setDetalle(r.data))
      .catch(() => setDetalle(null))
      .finally(() => setCargando(false));
  }, [sector.id]);

  const pct = sector.porcentaje_ocupacion;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(11,48,105,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '0', maxWidth: 540, width: '100%', maxHeight: '88vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera coloreada */}
        <div style={{
          background: COLOR[sector.estado_saturacion],
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: '1.25rem 1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a2b4a' }}>{sector.codigo}</h2>
            <p style={{ color: '#334155', fontSize: '.85rem', marginTop: '.15rem' }}>{sector.nombre}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(0,0,0,.1)', border: 'none', borderRadius: 8, padding: '.5rem .75rem', cursor: 'pointer', fontSize: '1rem', color: '#1a2b4a' }}
          >✕</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Barra de ocupación */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
              <span style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Ocupación
              </span>
              <strong style={{ fontSize: '1.1rem', color: COLOR[sector.estado_saturacion] }}>
                {pct}% · {sector.ocupacion_actual} / {sector.capacidad_max} palés
              </strong>
            </div>
            <div style={{ background: '#e2e8f0', borderRadius: 100, height: 14, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(pct, 100)}%`,
                height: '100%',
                background: COLOR[sector.estado_saturacion],
                transition: 'width .5s ease',
                borderRadius: 100,
              }} />
            </div>
          </div>

          {/* Lista de palés */}
          <h3 style={{ fontSize: '.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-text-muted)', marginBottom: '.75rem' }}>
            Palés en este sector
          </h3>

          {cargando ? (
            <div className="loading" style={{ padding: '2rem' }}><div className="spinner" />Cargando palés...</div>
          ) : !detalle || detalle.pales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)', fontSize: '.9rem' }}>
              Sector vacío — no hay palés en este sector
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {detalle.pales.map(pale => (
                <div key={pale.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '.65rem 1rem',
                  background: 'var(--color-surface-2)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)',
                  fontSize: '.875rem',
                  transition: 'background .1s',
                }}>
                  <div>
                    <strong style={{ fontFamily: 'monospace', letterSpacing: '.03em' }}>{pale.codigo_ref}</strong>
                    {pale.mercancia && (
                      <span style={{ color: 'var(--color-text-muted)', marginLeft: '.5rem', fontSize: '.82rem' }}>
                        {pale.mercancia}
                      </span>
                    )}
                  </div>
                  <span style={{ color: 'var(--color-text-light)', fontSize: '.75rem', white: 'nowrap' }}>
                    {new Date(pale.fecha_entrada).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {detalle && detalle.pales.length > 0 && (
            <p style={{ textAlign: 'right', fontSize: '.75rem', color: 'var(--color-text-light)', marginTop: '.75rem' }}>
              {detalle.pales.length} palé{detalle.pales.length !== 1 ? 's' : ''} listado{detalle.pales.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
