import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { navigationByRole } from '../../config/navigation';
import { ThemeToggle } from '../common/ThemeToggle';
import { Button } from '../ui/Button';

export function Topbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const items = navigationByRole[role] ?? [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand-mark" to="/">
          <img
            className="brand-mark-logo"
            src="/abasto-boliviano.png"
            alt="Abasto Boliviano"
          />
        </Link>

        <nav className="role-nav" aria-label="Navegacion del panel">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `public-nav-link role-nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-actions">
          <div className="topbar-user">
            <strong>{user?.fullName ?? 'Usuario'}</strong>
            <span>{user?.role ?? 'visitante'}</span>
          </div>

          <Button variant="primary" size="sm" className="navButton" onClick={handleLogout}>
            Salir
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
