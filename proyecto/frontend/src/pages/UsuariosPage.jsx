import { useState, useEffect, useCallback } from 'react';
import { listarUsuarios, crearUsuario, actualizarUsuario } from '../services/api';

export default function UsuariosPage() {
  const [usuarios, setUsuarios]       = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [modalCrear, setModalCrear]   = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [form, setForm]               = useState({ nombre: '', email: '', password: '', rol: 'operario' });
  const [formEditar, setFormEditar]   = useState({});
  const [guardando, setGuardando]     = useState(false);
  const [error, setError]             = useState('');
  const [snackbar, setSnackbar]       = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await listarUsuarios();
      setUsuarios(data.usuarios);
    } catch {
      /* silencioso */
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  function mostrarSnackbar(msg) {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(''), 3500);
  }

  async function handleCrear(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await crearUsuario(form);
      mostrarSnackbar(`✅ Usuario ${form.nombre} creado correctamente`);
      setModalCrear(false);
      setForm({ nombre: '', email: '', password: '', rol: 'operario' });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el usuario');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEditar(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await actualizarUsuario(modalEditar.id, formEditar);
      mostrarSnackbar('✅ Usuario actualizado correctamente');
      setModalEditar(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar el usuario');
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo(usuario) {
    const nuevoEstado = usuario.activo ? 0 : 1;
    const accion      = nuevoEstado ? 'activar' : 'desactivar';
    if (!window.confirm(`¿Confirmas ${accion} la cuenta de ${usuario.nombre}?`)) return;
    try {
      await actualizarUsuario(usuario.id, { activo: nuevoEstado });
      mostrarSnackbar(`✅ Cuenta de ${usuario.nombre} ${nuevoEstado ? 'activada' : 'desactivada'}`);
      cargar();
    } catch (err) {
      mostrarSnackbar('❌ ' + (err.response?.data?.error || 'Error al actualizar'));
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Gestión de Usuarios</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem', marginTop: '.2rem' }}>
            UC-11 · Administrar cuentas de operarios y administradores
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setModalCrear(true); setError(''); }}>
          + Nuevo usuario
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="loading"><div className="spinner" />Cargando...</div>
                </td></tr>
              ) : usuarios.map(u => (
                <tr key={u.id} style={{ opacity: u.activo ? 1 : .5 }}>
                  <td><strong>{u.nombre}</strong></td>
                  <td style={{ fontSize: '.875rem', color: '#64748b' }}>{u.email}</td>
                  <td>
                    <span style={{
                      background: u.rol === 'administrador' ? '#dbeafe' : '#f0fdf4',
                      color:      u.rol === 'administrador' ? '#1e40af' : '#166534',
                      padding: '.2rem .6rem', borderRadius: 4, fontSize: '.78rem', fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>
                      {u.rol}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      background: u.activo ? '#dcfce7' : '#f1f5f9',
                      color:      u.activo ? '#166534' : '#64748b',
                      padding: '.2rem .6rem', borderRadius: 4, fontSize: '.78rem', fontWeight: 600,
                    }}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ fontSize: '.8rem', color: '#94a3b8' }}>
                    {new Date(u.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '.4rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setModalEditar(u);
                          setFormEditar({ nombre: u.nombre, rol: u.rol, password: '' });
                          setError('');
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{
                          background: u.activo ? '#fee2e2' : '#dcfce7',
                          color:      u.activo ? '#991b1b' : '#166534',
                        }}
                        onClick={() => toggleActivo(u)}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Crear usuario */}
      {modalCrear && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={() => setModalCrear(false)}
        >
          <div
            style={{ background: 'white', borderRadius: 12, padding: '1.5rem', maxWidth: 440, width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Nuevo usuario</h2>
              <button onClick={() => setModalCrear(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '.4rem .7rem', cursor: 'pointer' }}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCrear}>
              <div className="form-group">
                <label className="form-label">Nombre completo *</label>
                <input type="text" className="form-control" placeholder="Nombre del operario" value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" placeholder="email@almacen.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña *</label>
                <input type="password" className="form-control" placeholder="Mínimo 8 caracteres" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
              </div>
              <div className="form-group">
                <label className="form-label">Rol *</label>
                <select className="form-control" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                  <option value="operario">Operario</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalCrear(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : '+ Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar usuario */}
      {modalEditar && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={() => setModalEditar(null)}
        >
          <div
            style={{ background: 'white', borderRadius: 12, padding: '1.5rem', maxWidth: 440, width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Editar: {modalEditar.nombre}</h2>
              <button onClick={() => setModalEditar(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '.4rem .7rem', cursor: 'pointer' }}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleEditar}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-control" value={formEditar.nombre}
                  onChange={e => setFormEditar({ ...formEditar, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Rol</label>
                <select className="form-control" value={formEditar.rol}
                  onChange={e => setFormEditar({ ...formEditar, rol: e.target.value })}>
                  <option value="operario">Operario</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nueva contraseña (dejar vacío para no cambiar)</label>
                <input type="password" className="form-control" placeholder="Nueva contraseña..." value={formEditar.password}
                  onChange={e => setFormEditar({ ...formEditar, password: e.target.value })} minLength={8} />
              </div>
              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalEditar(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {snackbar && <div className="snackbar">{snackbar}</div>}
    </div>
  );
}
