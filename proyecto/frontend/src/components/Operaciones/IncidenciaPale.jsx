import { useState } from 'react';
import { listarPales, crearIncidencia } from '../../services/api';

const TIPOS = [
  { value: 'daño',           label: 'Daño físico en el palé' },
  { value: 'perdida',        label: 'Pérdida / palé extraviado' },
  { value: 'error_registro', label: 'Error en el registro' },
  { value: 'otro',           label: 'Otro motivo' },
];

export default function IncidenciaPale({ onExito }) {
  const [busqueda, setBusqueda]   = useState('');
  const [resultados, setResultados] = useState([]);
  const [paleSeleccionado, setPaleSeleccionado] = useState(null);
  const [form, setForm]           = useState({ tipo: 'daño', descripcion: '' });
  const [buscando, setBuscando]   = useState(false);
  const [enviando, setEnviando]   = useState(false);
  const [error, setError]         = useState('');

  async function buscarPale(e) {
    e.preventDefault();
    if (!busqueda.trim()) return;
    setError('');
    setBuscando(true);
    setPaleSeleccionado(null);
    try {
      const { data } = await listarPales({ buscar: busqueda.trim(), limite: 10 });
      const activos = data.pales.filter(p => p.estado !== 'expedido');
      setResultados(activos);
      if (activos.length === 0) setError(`No se encontró ningún palé activo con "${busqueda}"`);
    } catch {
      setError('Error al buscar el palé');
    } finally {
      setBuscando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!paleSeleccionado) return;
    setEnviando(true);
    setError('');
    try {
      await crearIncidencia({
        pale_id:     paleSeleccionado.id,
        tipo:        form.tipo,
        descripcion: form.descripcion.trim(),
      });
      onExito(`⚠️ Incidencia registrada para el palé ${paleSeleccionado.codigo_ref}`);
      setBusqueda('');
      setResultados([]);
      setPaleSeleccionado(null);
      setForm({ tipo: 'daño', descripcion: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar la incidencia');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <p style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', marginBottom: '.75rem' }}>
        <strong>Paso 1:</strong> Busca el palé afectado por la incidencia
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

      {resultados.length > 0 && !paleSeleccionado && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', marginBottom: '1rem' }}>
          {resultados.map(pale => (
            <button
              key={pale.id}
              onClick={() => setPaleSeleccionado(pale)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '.75rem 1rem', background: '#fef9c3',
                border: '2px solid #fde68a', borderRadius: 8, cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <strong>{pale.codigo_ref}</strong>
                <div style={{ fontSize: '.8rem', color: '#64748b' }}>
                  Estado: <strong>{pale.estado}</strong>
                  {pale.sector_codigo && <span> · Sector: <strong>{pale.sector_codigo}</strong></span>}
                </div>
              </div>
              <span style={{ fontSize: '.8rem', color: '#b45309' }}>Seleccionar →</span>
            </button>
          ))}
        </div>
      )}

      {paleSeleccionado && (
        <form onSubmit={handleSubmit}>
          <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
            Palé afectado: <strong>{paleSeleccionado.codigo_ref}</strong>
            {paleSeleccionado.sector_codigo && <span> · Sector <strong>{paleSeleccionado.sector_codigo}</strong></span>}
            <button
              type="button"
              onClick={() => setPaleSeleccionado(null)}
              style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >✕</button>
          </div>

          <p style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', marginBottom: '.75rem' }}>
            <strong>Paso 2:</strong> Describe la incidencia
          </p>

          <div className="form-group">
            <label className="form-label">Tipo de incidencia *</label>
            <select
              className="form-control"
              value={form.tipo}
              onChange={e => setForm({ ...form, tipo: e.target.value })}
              required
            >
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción detallada *</label>
            <textarea
              className="form-control"
              placeholder="Describe con detalle la incidencia observada..."
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              required
              rows={4}
              style={{ resize: 'vertical', minHeight: 90 }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-block"
            disabled={enviando}
            style={{ background: '#d97706', color: 'white', fontWeight: 600 }}
          >
            {enviando ? 'Registrando...' : '⚠️ Registrar incidencia'}
          </button>
        </form>
      )}
    </div>
  );
}
