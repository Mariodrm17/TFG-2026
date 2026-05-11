import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await login(form.email, form.password);
      localStorage.setItem('wms_token',   data.token);
      localStorage.setItem('wms_usuario', JSON.stringify(data.usuario));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-wrapper">
      {/* Panel izquierdo - Marca */}
      <div className="login-brand">
        <div className="login-brand-logo">ISS</div>
        <h1 className="login-brand-title">WMS · Almacén Santander</h1>
        <p className="login-brand-sub">
          Sistema de Gestión de Almacén para<br />
          <strong>James Hardie — Intermodal Sea Solutions</strong>
        </p>
        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '.75rem', width: '100%', maxWidth: 280 }}>
          {[
            { icon: '📦', text: '38 sectores gestionados en tiempo real' },
            { icon: '🔄', text: 'Control de entradas, salidas y reubicaciones' },
            { icon: '📊', text: 'Dashboard con estadísticas de flujo' },
            { icon: '🔒', text: 'Acceso seguro con roles por usuario' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.82rem', opacity: .75 }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="login-form-area">
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Acceder al sistema
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem', marginTop: '.35rem' }}>
              Introduce tus credenciales para continuar
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="usuario@almacen.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={cargando}
              style={{ marginTop: '.75rem', height: 48, fontSize: '1rem', fontWeight: 600 }}
            >
              {cargando ? 'Iniciando sesión...' : 'Entrar al sistema'}
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem', padding: '1rem', background: '#f0f4f8',
            borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', fontSize: '.8rem',
          }}>
            <div style={{ fontWeight: 600, marginBottom: '.4rem', color: 'var(--color-text-muted)' }}>
              CREDENCIALES DE DEMO
            </div>
            <div style={{ color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
              <span>Admin: <strong>admin@almacen.com</strong> / <strong>Admin2026!</strong></span>
              <span>Operario: <strong>operario@almacen.com</strong> / <strong>Admin2026!</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
