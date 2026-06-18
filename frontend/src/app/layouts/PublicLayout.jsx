import { Link, NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { getDefaultRouteForRole } from '../../config/navigation';

export function PublicLayout() {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="public-shell">
      <header className="public-header">
        <Link className="brand-mark" to="/">
          Abasto Paceño
        </Link>

        <nav className="public-nav">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/map">Mapa</NavLink>
          {isAuthenticated ? (
            <Link to={getDefaultRouteForRole(role)}>
              <Button variant="primary" size="sm">Entrar al panel</Button>
            </Link>
          ) : (
            <>
              <NavLink to="/login">Ingresar</NavLink>
              <Link to="/register">
                <Button variant="primary" size="sm">Crear cuenta</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="public-main">
        <Outlet />
      </main>
    </div>
  );
}
