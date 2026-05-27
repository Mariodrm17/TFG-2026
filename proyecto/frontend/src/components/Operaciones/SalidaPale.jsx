import { useState } from 'react';
import { listarPales, salidaPale } from '../../services/api';

export default function SalidaPale({ onExito }) {
  const [busqueda, setBusqueda]   = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando]   = useState(false);
  const [procesando, setProcesando] = useState(null);
  const [error, setError]         = useState('');
  const [notas, setNotas]         = useState('');

  async function buscarPale(e) {
    e.preventDefault();
    if (!busqueda.trim()) return;
    setError('');
    setBuscando(true);
    try {
      const { data } = await listarPales({ buscar: busqueda.trim(), estado: 'emplazado', limite: 10 });
      setResultados(data.pales);
      if (data.pales.length === 0) setError(`No se encontró ningún palé con "${busqueda}" en el almacén`);
    } catch {
      setError('Error al buscar el palé');
    } finally {
      setBuscando(false);
    }
  }

  async function confirmarSalida(pale) {
    if (!window.confirm(`¿Confirmas la salida del palé ${pale.codigo_ref} del sector ${pale.sector_codigo}?`)) return;
    setProcesando(pale.id);
    setError('');
    try {
      await salidaPale(pale.id, notas || null);
      setResultados(prev => prev.filter(p => p.id !== pale.id));
      setBusqueda('');
      setNotas('');
      onExito(`✅ Palé ${pale.codigo_ref} expedido correctamente`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar la salida');
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Buscador */}
      <form onSubmit={buscarPale} style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por código de referencia (Ej: JH-8819-A)"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1, textTransform: 'uppercase' }}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={buscando} style={{ flexShrink: 0 }}>
          {buscando ? '...' : 'Buscar'}
        </button>
      </form>

      {/* Notas para la salida */}
      {resultados.length > 0 && (
        <div className="form-group">
          <label className="form-label">Notas de expedición (opcional)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Destino, transportista, referencia de albarán..."
            value={notas}
            onChange={e => setNotas(e.target.value)}
          />
        </div>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {resultados.map(pale => (
            <div key={pale.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '.875rem 1rem', background: '#f8fafc',
              border: '1px solid #e2e8f0', borderRadius: 8,
              flexWrap: 'wrap', gap: '.5rem',
            }}>
              <div>
                <strong style={{ fontSize: '1rem' }}>{pale.codigo_ref}</strong>
                <div style={{ fontSize: '.8rem', color: '#64748b', marginTop: '.2rem' }}>
                  Sector: <strong>{pale.sector_codigo}</strong>
                  {pale.mercancia && <span> · {pale.mercancia}</span>}
                  <span> · Entrada: {new Date(pale.fecha_entrada).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => confirmarSalida(pale)}
                disabled={procesando === pale.id}
              >
                {procesando === pale.id ? 'Procesando...' : '↑ Registrar salida'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
