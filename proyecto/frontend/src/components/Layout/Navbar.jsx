import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const usuario  = JSON.parse(localStorage.getItem('wms_usuario') || '{}');
  const esAdmin  = usuario.rol === 'administrador';

  function cerrarSesion() {
    localStorage.removeItem('wms_token');
    localStorage.removeItem('wms_usuario');
    navigate('/login');
  }

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <div className="navbar-logo">ISS</div>
        <div className="navbar-brand-text">
          <span className="navbar-brand-title">WMS · Almacén Santander</span>
          <span className="navbar-brand-sub">Intermodal Sea Solutions</span>
        </div>
      </div>

      {/* Nav links */}
      <ul className="navbar-nav">
        <li>
          <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Layout
          </NavLink>
        </li>
        <li>
          <NavLink to="/operaciones" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Operaciones
          </NavLink>
        </li>
        <li>
          <NavLink to="/pales" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Inventario
          </NavLink>
        </li>
        {esAdmin && (
          <>
            <li>
              <NavLink to="/incidencias" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                Incidencias
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/usuarios" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                Usuarios
              </NavLink>
            </li>
          </>
        )}
      </ul>

      {/* Usuario */}
      <div className="navbar-user">
        <div className="navbar-user-info">
          <span className="navbar-user-name">{usuario.nombre}</span>
          <span className="navbar-user-rol">{usuario.rol}</span>
        </div>
        <button className="btn-logout" onClick={cerrarSesion}>Salir</button>
      </div>
    </nav>
  );
}
