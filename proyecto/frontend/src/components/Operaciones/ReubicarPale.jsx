import { useState, useEffect } from 'react';
import { listarPales, getLayout, reubicarPale } from '../../services/api';

export default function ReubicarPale({ onExito }) {
  const [sectores, setSectores]     = useState([]);
  const [busqueda, setBusqueda]     = useState('');
  const [resultados, setResultados] = useState([]);
  const [paleSeleccionado, setPaleSeleccionado] = useState(null);
  const [sectorDestino, setSectorDestino]       = useState('');
  const [notas, setNotas]           = useState('');
  const [buscando, setBuscando]     = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    getLayout().then(r => setSectores(r.data.sectores.filter(s => s.activo))).catch(() => {});
  }, []);

  async function buscarPale(e) {
    e.preventDefault();
    if (!busqueda.trim()) return;
    setError('');
    setBuscando(true);
    setPaleSeleccionado(null);
    setSectorDestino('');
    try {
      const { data } = await listarPales({ buscar: busqueda.trim(), estado: 'emplazado', limite: 10 });
      setResultados(data.pales);
      if (data.pales.length === 0) setError(`No se encontró ningún palé con "${busqueda}"`);
    } catch {
      setError('Error al buscar el palé');
    } finally {
      setBuscando(false);
    }
  }

  async function confirmarReubicacion() {
    if (!paleSeleccionado || !sectorDestino) return;
    setProcesando(true);
    setError('');
    try {
      await reubicarPale(paleSeleccionado.id, {
        sector_destino_id: parseInt(sectorDestino),
        notas: notas || null,
      });
      const destNombre = sectores.find(s => s.id === parseInt(sectorDestino))?.codigo || sectorDestino;
      onExito(`✅ Palé ${paleSeleccionado.codigo_ref} reubicado al sector ${destNombre}`);
      // Reset
      setBusqueda('');
      setResultados([]);
      setPaleSeleccionado(null);
      setSectorDestino('');
      setNotas('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al reubicar el palé');
    } finally {
      setProcesando(false);
    }
  }

  const COLOR = { libre: '#22c55e', bajo: '#86efac', medio: '#facc15', alto: '#f97316', critico: '#ef4444' };

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Paso 1: Buscar palé */}
      <p style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', marginBottom: '.75rem' }}>
        <strong>Paso 1:</strong> Busca el palé que quieres reubicar
      </p>
      <form onSubmit={buscarPale} style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Código de referencia del palé"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1, textTransform: 'uppercase' }}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={buscando} style={{ flexShrink: 0 }}>
          {buscando ? '...' : 'Buscar'}
        </button>
      </form>

      {/* Resultados de búsqueda */}
      {resultados.length > 0 && !paleSeleccionado && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', marginBottom: '1rem' }}>
          {resultados.map(pale => (
            <button
              key={pale.id}
              onClick={() => setPaleSeleccionado(pale)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '.75rem 1rem', background: '#f8fafc',
                border: '2px solid #e2e8f0', borderRadius: 8, cursor: 'pointer',
                textAlign: 'left', transition: 'border-color .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div>
                <strong>{pale.codigo_ref}</strong>
                <div style={{ fontSize: '.8rem', color: '#64748b' }}>
                  Sector actual: <strong>{pale.sector_codigo}</strong>
                  {pale.mercancia && <span> · {pale.mercancia}</span>}
                </div>
              </div>
              <span style={{ fontSize: '.8rem', color: 'var(--color-primary)' }}>Seleccionar →</span>
            </button>
          ))}
        </div>
      )}

      {/* Paso 2: Elegir destino */}
      {paleSeleccionado && (
        <div>
          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            Palé seleccionado: <strong>{paleSeleccionado.codigo_ref}</strong> · Sector actual: <strong>{paleSeleccionado.sector_codigo}</strong>
            <button
              onClick={() => { setPaleSeleccionado(null); setSectorDestino(''); }}
              style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
            >✕</button>
          </div>

          <p style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', marginBottom: '.5rem' }}>
            <strong>Paso 2:</strong> Selecciona el sector destino
          </p>

          <div className="form-group">
            <select
              className="form-control"
              value={sectorDestino}
              onChange={e => setSectorDestino(e.target.value)}
              required
            >
              <option value="">— Sector destino —</option>
              {sectores
                .filter(s => s.codigo !== paleSeleccionado.sector_codigo)
                .map(s => (
                  <option key={s.id} value={s.id}
                    disabled={s.ocupacion_actual >= s.capacidad_max}>
                    {s.codigo} · {s.ocupacion_actual}/{s.capacidad_max} ({s.porcentaje_ocupacion}%)
                    {s.ocupacion_actual >= s.capacidad_max ? ' 🔴 LLENO' : ''}
                  </option>
                ))}
            </select>

            {sectorDestino && (() => {
              const s = sectores.find(x => x.id === parseInt(sectorDestino));
              if (!s) return null;
              return (
                <div style={{
                  marginTop: '.5rem', padding: '.5rem .875rem', borderRadius: 8,
                  background: COLOR[s.estado_saturacion] + '33',
                  border: `1px solid ${COLOR[s.estado_saturacion]}`,
                  fontSize: '.82rem',
                }}>
                  {s.nombre} · Hueco disponible: <strong>{s.capacidad_max - s.ocupacion_actual} palés</strong>
                </div>
              );
            })()}
          </div>

          <div className="form-group">
            <label className="form-label">Motivo de la reubicación (opcional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Reorganización, acceso a mercancía..."
              value={notas}
              onChange={e => setNotas(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={confirmarReubicacion}
            disabled={!sectorDestino || procesando}
          >
            {procesando ? 'Reubicando...' : '↔ Confirmar reubicación'}
          </button>
        </div>
      )}
    </div>
  );
}
