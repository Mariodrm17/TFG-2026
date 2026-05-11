import { useState, useEffect } from 'react';
import { entradaPale, getLayout, listarMercancias } from '../../services/api';

const COLOR_ESTADO = {
  libre:   '#22c55e',
  bajo:    '#86efac',
  medio:   '#facc15',
  alto:    '#f97316',
  critico: '#ef4444',
};

export default function EntradaPale({ onExito }) {
  const [sectores, setSectores]     = useState([]);
  const [mercancias, setMercancias] = useState([]);
  const [form, setForm] = useState({
    codigo_ref:  '',
    sector_id:   '',
    mercancia_id:'',
    notas:       '',
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    getLayout().then(r => setSectores(r.data.sectores.filter(s => s.activo))).catch(() => {});
    listarMercancias().then(r => setMercancias(r.data.mercancias)).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await entradaPale({
        codigo_ref:   form.codigo_ref.trim().toUpperCase(),
        sector_id:    parseInt(form.sector_id),
        mercancia_id: form.mercancia_id ? parseInt(form.mercancia_id) : null,
        notas:        form.notas || null,
      });
      setForm({ codigo_ref: '', sector_id: '', mercancia_id: '', notas: '' });
      onExito('Palé registrado correctamente en el sector');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar la entrada');
    } finally {
      setCargando(false);
    }
  }

  const sectorActual = sectores.find(s => s.id === parseInt(form.sector_id));

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Código de referencia */}
      <div className="form-group">
        <label className="form-label">Código de referencia del palé *</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ej: JH-8819-A"
          value={form.codigo_ref}
          onChange={e => setForm({ ...form, codigo_ref: e.target.value })}
          required
          style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '.05em' }}
        />
      </div>

      {/* Tipo de mercancía */}
      <div className="form-group">
        <label className="form-label">Tipo de mercancía</label>
        <select
          className="form-control"
          value={form.mercancia_id}
          onChange={e => setForm({ ...form, mercancia_id: e.target.value })}
        >
          <option value="">— Sin especificar —</option>
          {mercancias.map(m => (
            <option key={m.id} value={m.id}>
              {m.descripcion} {m.peso_kg ? `(${m.peso_kg} kg)` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Sector destino */}
      <div className="form-group">
        <label className="form-label">Sector destino *</label>
        <select
          className="form-control"
          value={form.sector_id}
          onChange={e => setForm({ ...form, sector_id: e.target.value })}
          required
        >
          <option value="">— Selecciona un sector —</option>
          {sectores.map(s => (
            <option
              key={s.id}
              value={s.id}
              disabled={s.ocupacion_actual >= s.capacidad_max}
            >
              {s.codigo} · {s.ocupacion_actual}/{s.capacidad_max} palés ({s.porcentaje_ocupacion}%)
              {s.ocupacion_actual >= s.capacidad_max ? ' — LLENO' : ''}
            </option>
          ))}
        </select>

        {/* Preview visual del sector seleccionado */}
        {sectorActual && (
          <div style={{
            marginTop: '.5rem',
            padding: '.65rem 1rem',
            borderRadius: 'var(--radius)',
            background: COLOR_ESTADO[sectorActual.estado_saturacion] + '22',
            border: `1.5px solid ${COLOR_ESTADO[sectorActual.estado_saturacion]}`,
            fontSize: '.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontWeight: 600 }}>{sectorActual.nombre}</span>
            <span>
              Libre: <strong>{sectorActual.capacidad_max - sectorActual.ocupacion_actual} palés</strong>
            </span>
          </div>
        )}
      </div>

      {/* Notas */}
      <div className="form-group">
        <label className="form-label">Notas (opcional)</label>
        <input
          type="text"
          className="form-control"
          placeholder="Observaciones sobre esta entrada..."
          value={form.notas}
          onChange={e => setForm({ ...form, notas: e.target.value })}
        />
      </div>

      <button type="submit" className="btn btn-success btn-block" disabled={cargando} style={{ height: 48, fontWeight: 600 }}>
        {cargando ? 'Registrando...' : '⬇ Registrar entrada de palé'}
      </button>
    </form>
  );
}
