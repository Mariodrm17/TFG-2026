import { useState } from 'react';
import SectorModal from './SectorModal';

const ESTADO_COLOR = {
  libre:   '#22c55e',
  bajo:    '#86efac',
  medio:   '#facc15',
  alto:    '#f97316',
  critico: '#ef4444',
};

const ESTADO_TEXTO = {
  libre:   'Libre (0%)',
  bajo:    'Bajo (<50%)',
  medio:   'Medio (50-75%)',
  alto:    'Alto (75-95%)',
  critico: 'Crítico (>95%)',
};

export default function AlmacenMap({ sectores, onRefresh }) {
  const [sectorSeleccionado, setSectorSeleccionado] = useState(null);

  if (!sectores || sectores.length === 0) {
    return <div className="loading"><div className="spinner" />Cargando layout...</div>;
  }

  // Agrupar sectores por fila (letras del código)
  const filas = {};
  sectores.forEach(s => {
    const fila = s.codigo.replace(/\d+/g, '') || 'Z';
    if (!filas[fila]) filas[fila] = [];
    filas[fila].push(s);
  });

  return (
    <>
      {/* Leyenda */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1.25rem', padding: '.75rem 1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginRight: '.25rem' }}>
          Ocupación:
        </span>
        {Object.entries(ESTADO_TEXTO).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.78rem', color: 'var(--color-text-muted)' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: ESTADO_COLOR[k], border: '1px solid rgba(0,0,0,.08)' }} />
            <span>{v}</span>
          </div>
        ))}
      </div>

      {/* Mapa de sectores por filas */}
      <div style={{ overflowX: 'auto', paddingBottom: '.5rem' }}>
        {Object.entries(filas).sort(([a], [b]) => a.localeCompare(b)).map(([fila, sects]) => (
          <div key={fila} style={{ display: 'flex', gap: '.5rem', marginBottom: '.625rem', alignItems: 'stretch' }}>
            {/* Etiqueta de fila */}
            <div style={{
              width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '.85rem',
              flexShrink: 0, background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius)', border: '1px solid var(--color-border)',
            }}>
              {fila}
            </div>
            {/* Sectores */}
            {sects.sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true })).map(sector => (
              <button
                key={sector.id}
                onClick={() => setSectorSeleccionado(sector)}
                title={`${sector.codigo} — ${sector.nombre}\n${sector.porcentaje_ocupacion}% ocupado (${sector.ocupacion_actual}/${sector.capacidad_max} palés)`}
                style={{
                  width: 76,
                  minHeight: 76,
                  borderRadius: 'var(--radius)',
                  background: ESTADO_COLOR[sector.estado_saturacion],
                  border: `2px solid rgba(0,0,0,${sector.estado_saturacion === 'critico' ? '.2' : '.08'})`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '.15rem',
                  padding: '.4rem',
                  transition: 'transform .12s, box-shadow .12s',
                  flexShrink: 0,
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,.2)';
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.zIndex = '1';
                }}
              >
                <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#1a2b4a' }}>
                  {sector.codigo}
                </span>
                <span style={{ fontSize: '.72rem', fontWeight: 600, color: '#334155' }}>
                  {sector.porcentaje_ocupacion}%
                </span>
                <span style={{ fontSize: '.65rem', color: '#475569' }}>
                  {sector.ocupacion_actual}/{sector.capacidad_max}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {sectorSeleccionado && (
        <SectorModal
          sector={sectorSeleccionado}
          onClose={() => setSectorSeleccionado(null)}
          onRefresh={() => { setSectorSeleccionado(null); onRefresh(); }}
        />
      )}
    </>
  );
}
