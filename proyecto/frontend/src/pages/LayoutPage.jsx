import { useEffect, useState, useCallback } from 'react';
import { getLayout } from '../services/api';
import AlmacenMap from '../components/Layout/AlmacenMap';

export default function LayoutPage() {
  const [data, setData]         = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState('');
  const [ultimaAct, setUltimaAct] = useState(null);

  const cargarLayout = useCallback(async () => {
    try {
      const { data: res } = await getLayout();
      setData(res);
      setUltimaAct(new Date());
      setError('');
    } catch {
      setError('Error al cargar el layout del almacén');
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga inicial + refresco automático cada 30 segundos
  useEffect(() => {
    cargarLayout();
    const intervalo = setInterval(cargarLayout, 30000);
    return () => clearInterval(intervalo);
  }, [cargarLayout]);

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Layout del Almacén</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem', marginTop: '.2rem' }}>
            Vista en tiempo real de los 38 sectores · James Hardie
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          {ultimaAct && (
            <span style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>
              Actualizado: {ultimaAct.toLocaleTimeString('es-ES')}
            </span>
          )}
          <button className="btn btn-secondary btn-sm" onClick={cargarLayout} disabled={cargando}>
            {cargando ? '...' : '↻ Refrescar'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* KPIs globales */}
      {data && (
        <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="kpi-card">
            <div className="kpi-value">{data.resumen.total_sectores}</div>
            <div className="kpi-label">Sectores totales</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value" style={{ color: '#16a34a' }}>{data.resumen.total_pales}</div>
            <div className="kpi-label">Palés en almacén</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{data.resumen.capacidad_total}</div>
            <div className="kpi-label">Capacidad total</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value" style={{
              color: data.resumen.ocupacion_global > 85 ? '#ef4444'
                   : data.resumen.ocupacion_global > 60 ? '#f97316'
                   : '#16a34a'
            }}>
              {data.resumen.ocupacion_global}%
            </div>
            <div className="kpi-label">Ocupación global</div>
          </div>
        </div>
      )}

      {/* Mapa interactivo */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: '.75rem' }}>
          Mapa Interactivo — haz clic en un sector para ver su contenido
        </div>
        {cargando && !data ? (
          <div className="loading"><div className="spinner" />Cargando layout...</div>
        ) : (
          <AlmacenMap sectores={data?.sectores || []} onRefresh={cargarLayout} />
        )}
      </div>
    </div>
  );
}
