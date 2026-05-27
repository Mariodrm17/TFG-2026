import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar          from './components/Layout/Navbar';
import LoginPage       from './pages/LoginPage';
import LayoutPage      from './pages/LayoutPage';
import OperacionesPage from './pages/OperacionesPage';
import PalesPage       from './pages/PalesPage';
import DashboardPage   from './pages/DashboardPage';
import IncidenciasPage from './pages/IncidenciasPage';
import UsuariosPage    from './pages/UsuariosPage';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('wms_token');
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const usuario = JSON.parse(localStorage.getItem('wms_usuario') || '{}');
  const token   = localStorage.getItem('wms_token');
  if (!token) return <Navigate to="/login" replace />;
  if (usuario.rol !== 'administrador') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const token = localStorage.getItem('wms_token');

  return (
    <div className="app-layout">
      {token && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <PrivateRoute><LayoutPage /></PrivateRoute>
          } />
          <Route path="/operaciones" element={
            <PrivateRoute><OperacionesPage /></PrivateRoute>
          } />
          <Route path="/pales" element={
            <PrivateRoute><PalesPage /></PrivateRoute>
          } />
          <Route path="/incidencias" element={
            <AdminRoute><IncidenciasPage /></AdminRoute>
          } />
          <Route path="/dashboard" element={
            <AdminRoute><DashboardPage /></AdminRoute>
          } />
          <Route path="/usuarios" element={
            <AdminRoute><UsuariosPage /></AdminRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
