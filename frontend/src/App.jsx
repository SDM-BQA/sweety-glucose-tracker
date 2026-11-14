import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Droplet, ListChecks, TrendingUp, Users, LogOut } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Spinner from './components/Spinner';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import DoctorPatients from './pages/DoctorPatients';

function BrandMark() {
  return (
    <span className="brand-mark">
      <Droplet size={17} color="#fff" strokeWidth={2.5} />
    </span>
  );
}

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function Shell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const links =
    user.role === 'doctor'
      ? [{ to: '/', label: 'Patients', icon: Users }]
      : [
          { to: '/', label: 'Readings', icon: ListChecks },
          { to: '/reports', label: 'Reports', icon: TrendingUp },
        ];

  function isActive(to) {
    return to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <BrandMark />
          <span className="brand-name">Sweety</span>
        </Link>
        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={`sidebar-link ${isActive(to) ? 'active' : ''}`}>
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="avatar">{initials(user.name)}</span>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Log out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <div className="topbar">
        <Link to="/" className="brand">
          <BrandMark />
          <span className="brand-name">Sweety</span>
        </Link>
        <nav className="topbar-nav">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} className={isActive(to) ? 'active' : ''}>
              {label}
            </Link>
          ))}
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
            Log out
          </a>
        </nav>
      </div>

      <div className="content">{children}</div>
    </div>
  );
}

function DoctorRoute({ children }) {
  const { user } = useAuth();
  if (user.role !== 'doctor') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { ready, user } = useAuth();
  if (!ready) return <Spinner fullPage label="Loading…" />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Shell>{user?.role === 'doctor' ? <DoctorPatients /> : <Dashboard />}</Shell>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Shell>
              <Reports />
            </Shell>
          </PrivateRoute>
        }
      />
      <Route
        path="/patients/:patientId/reports"
        element={
          <PrivateRoute>
            <DoctorRoute>
              <Shell>
                <Reports />
              </Shell>
            </DoctorRoute>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}
