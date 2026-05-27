import { useState } from 'react';
import EntradaPale    from '../components/Operaciones/EntradaPale';
import SalidaPale     from '../components/Operaciones/SalidaPale';
import ReubicarPale   from '../components/Operaciones/ReubicarPale';
import IncidenciaPale from '../components/Operaciones/IncidenciaPale';

const TABS = [
  { id: 'entrada',    label: 'Nueva entrada',  emoji: '⬇' },
  { id: 'salida',     label: 'Registrar salida', emoji: '⬆' },
  { id: 'reubicar',   label: 'Reubicar palé',  emoji: '↔' },
  { id: 'incidencia', label: 'Incidencia',      emoji: '⚠' },
];

const TITULOS = {
  entrada:    { titulo: 'Registrar Entrada de Palé',     uc: 'UC-01' },
  salida:     { titulo: 'Registrar Expedición de Palé',  uc: 'UC-02' },
  reubicar:   { titulo: 'Reubicar Palé entre Sectores',  uc: 'UC-04' },
  incidencia: { titulo: 'Registrar Incidencia Operativa',uc: 'UC-08' },
};

export default function OperacionesPage() {
  const [tabActiva, setTabActiva] = useState('entrada');
  const [snackbar, setSnackbar]   = useState('');

  function mostrarSnackbar(msg) {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(''), 3500);
  }

  const { titulo, uc } = TITULOS[tabActiva];

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Operaciones</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem', marginTop: '.2rem' }}>
          Registra entradas, salidas, reubicaciones e incidencias de palés
        </p>
      </div>

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTabActiva(tab.id)}
            className="btn"
            style={{
              background: tabActiva === tab.id
                ? tab.id === 'incidencia' ? '#d97706' : 'var(--color-primary)'
                : 'var(--color-surface)',
              color:      tabActiva === tab.id ? 'white' : 'var(--color-text)',
              border:     tabActiva === tab.id ? 'none' : '1px solid var(--color-border)',
              fontWeight: tabActiva === tab.id ? 600 : 400,
              minWidth:   130,
            }}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{titulo}</span>
          <span style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>{uc}</span>
        </div>

        {tabActiva === 'entrada'    && <EntradaPale    onExito={mostrarSnackbar} />}
        {tabActiva === 'salida'     && <SalidaPale     onExito={mostrarSnackbar} />}
        {tabActiva === 'reubicar'   && <ReubicarPale   onExito={mostrarSnackbar} />}
        {tabActiva === 'incidencia' && <IncidenciaPale onExito={mostrarSnackbar} />}
      </div>

      {snackbar && <div className="snackbar">{snackbar}</div>}
    </div>
  );
}
