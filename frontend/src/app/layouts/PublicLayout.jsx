import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { getDefaultRouteForRole } from '../../config/navigation';

export function PublicLayout() {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className={`public-shell${isHome ? ' public-shell-home' : ''}`}>
      <header className="public-header">
        <div className="public-header-inner">
          <Link className="brand-mark" to="/">
            <img
              className="brand-mark-logo"
              src="/abasto-boliviano.png"
              alt="Abasto Boliviano"
            />
          </Link>

          <nav className="public-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `public-nav-link${isActive ? ' active' : ''}`}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/map"
              className={({ isActive }) => `public-nav-link${isActive ? ' active' : ''}`}
            >
              Mapa
            </NavLink>
            {isAuthenticated ? (
              <Link to={getDefaultRouteForRole(role)}>
                <Button variant="primary" size="sm" className="navButton">Entrar al panel</Button>
              </Link>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `public-nav-link${isActive ? ' active' : ''}`}
                >
                  Ingresar
                </NavLink>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="navButton">Crear cuenta</Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className={`public-main${isHome ? ' public-main-home' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
