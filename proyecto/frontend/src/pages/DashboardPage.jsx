import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';

const TIPO_COLOR = {
  entrada:     '#22c55e',
  salida:      '#ef4444',
  reubicacion: '#3b82f6',
  ajuste:      '#f59e0b',
};

export default function DashboardPage() {
  const [data, setData]         = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(() => setError('Error al cargar el dashboard'))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="loading"><div className="spinner" />Cargando dashboard...</div>;
  if (error)    return <div className="alert alert-error">{error}</div>;
  if (!data)    return null;

  const { kpis, topSectores, estadosPales, movimientos7d } = data;

  // Preparar datos de movimientos por día
  const diasUnicos = [...new Set(movimientos7d.map(m => m.fecha))].sort();
  const tiposUnicos = [...new Set(movimientos7d.map(m => m.tipo))];

  const maxMovDia = Math.max(...diasUnicos.map(dia =>
    movimientos7d.filter(m => m.fecha === dia).reduce((s, m) => s + m.total, 0)
  ), 1);

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Dashboard — Administración</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem', marginTop: '.2rem' }}>
          Estadísticas en tiempo real del almacén · James Hardie
        </p>
      </div>

      {/* KPIs principales */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-value">{kpis.pales_en_almacen?.toLocaleString('es-ES') || 0}</div>
          <div className="kpi-label">Palés en almacén</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: '#22c55e' }}>{kpis.entradas_hoy || 0}</div>
          <div className="kpi-label">Entradas hoy</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: '#ef4444' }}>{kpis.salidas_hoy || 0}</div>
          <div className="kpi-label">Salidas hoy</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: '#3b82f6' }}>{kpis.reubicaciones_hoy || 0}</div>
          <div className="kpi-label">Reubicaciones hoy</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{
            color: kpis.ocupacion_media_pct > 85 ? '#ef4444' : kpis.ocupacion_media_pct > 60 ? '#f97316' : '#22c55e'
          }}>
            {kpis.ocupacion_media_pct || 0}%
          </div>
          <div className="kpi-label">Ocupación media</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>

        {/* Top sectores más ocupados */}
        <div className="card">
          <div className="card-title">Top 5 sectores más ocupados</div>
          {topSectores.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '.85rem' }}>Sin datos</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {topSectores.map((s, i) => (
                <div key={s.codigo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', marginBottom: '.3rem' }}>
                    <span><strong>#{i + 1}</strong> {s.codigo} · {s.nombre.split('-')[0]}</span>
                    <strong style={{ color: s.pct > 85 ? '#ef4444' : s.pct > 60 ? '#f97316' : '#22c55e' }}>
                      {s.pct}%
                    </strong>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: 100, height: 8 }}>
                    <div style={{
                      width: `${Math.min(s.pct, 100)}%`, height: '100%', borderRadius: 100,
                      background: s.pct > 85 ? '#ef4444' : s.pct > 60 ? '#f97316' : '#22c55e',
                      transition: 'width .4s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '.2rem' }}>
                    {s.ocupacion_actual} / {s.capacidad_max} palés
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribución de estados de palés */}
        <div className="card">
          <div className="card-title">Distribución por estado</div>
          {estadosPales.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '.85rem' }}>Sin datos</p>
          ) : (() => {
            const totalEstados = estadosPales.reduce((s, e) => s + e.total, 0);
            const colorEstado = {
              emplazado:      '#22c55e',
              recepcionado:   '#3b82f6',
              expedido:       '#94a3b8',
              en_preparacion: '#f59e0b',
              en_reubicacion: '#8b5cf6',
            };
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {estadosPales.map(e => {
                  const pct = Math.round((e.total / totalEstados) * 100);
                  return (
                    <div key={e.estado}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', marginBottom: '.25rem' }}>
                        <span style={{ textTransform: 'capitalize' }}>{e.estado.replace(/_/g, ' ')}</span>
                        <span><strong>{e.total.toLocaleString('es-ES')}</strong> ({pct}%)</span>
                      </div>
                      <div style={{ background: '#e2e8f0', borderRadius: 100, height: 8 }}>
                        <div style={{
                          width: `${pct}%`, height: '100%', borderRadius: 100,
                          background: colorEstado[e.estado] || '#64748b',
                        }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '.5rem', fontSize: '.85rem', color: '#64748b' }}>
                  Total registros: <strong>{totalEstados.toLocaleString('es-ES')}</strong>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Gráfico de movimientos últimos 7 días */}
      <div className="card">
        <div className="card-title">Movimientos — últimos 7 días</div>
        {diasUnicos.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '.85rem' }}>Sin actividad reciente</p>
        ) : (
          <>
            {/* Leyenda */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {tiposUnicos.map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.82rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: TIPO_COLOR[t] || '#64748b' }} />
                  <span style={{ textTransform: 'capitalize' }}>{t}</span>
                </div>
              ))}
            </div>

            {/* Barras por día */}
            <div style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-end', minHeight: 120, overflowX: 'auto' }}>
              {diasUnicos.map(dia => {
                const movsDia  = movimientos7d.filter(m => m.fecha === dia);
                const totalDia = movsDia.reduce((s, m) => s + m.total, 0);
                const pctAltura= (totalDia / maxMovDia) * 100;
                return (
                  <div key={dia} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.3rem', flex: 1, minWidth: 50 }}>
                    <span style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 600 }}>{totalDia}</span>
                    {/* Barra apilada */}
                    <div style={{ width: '100%', maxWidth: 48, height: 100, display: 'flex', flexDirection: 'column-reverse', borderRadius: 4, overflow: 'hidden', background: '#f1f5f9' }}>
                      {tiposUnicos.map(tipo => {
                        const mov = movsDia.find(m => m.tipo === tipo);
                        if (!mov) return null;
                        const hPct = (mov.total / maxMovDia) * 100;
                        return (
                          <div key={tipo} title={`${tipo}: ${mov.total}`} style={{
                            height: `${hPct}%`, background: TIPO_COLOR[tipo] || '#64748b',
                            transition: 'height .4s ease',
                          }} />
                        );
                      })}
                    </div>
                    <span style={{ fontSize: '.72rem', color: '#94a3b8' }}>
                      {new Date(dia + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
