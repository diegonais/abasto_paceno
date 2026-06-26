import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { getDefaultRouteForRole } from '../../config/navigation';

export function PublicLayout() {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isMapExperience = location.pathname === '/map' || location.pathname === '/comercios';
  const [isAboutOpen, setIsAboutOpen] = useState(false);

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
            <NavLink
              to="/comercios"
              className={({ isActive }) => `public-nav-link${isActive ? ' active' : ''}`}
            >
              Comercios
            </NavLink>
            <button
              className="public-nav-link public-nav-button"
              type="button"
              onClick={() => setIsAboutOpen(true)}
            >
              Acerca de
            </button>
            {isAuthenticated ? (
              <Link to={getDefaultRouteForRole(role)}>
                <Button variant="primary" size="sm" className="navButton">
                  Entrar al panel
                </Button>
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
                  <Button variant="primary" size="sm" className="navButton">
                    Crear cuenta
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className={`public-main${isHome ? ' public-main-home' : ''}${isMapExperience ? ' public-main-map' : ''}`}>
        <Outlet />
      </main>

      {isAboutOpen ? (
        <div
          className="about-modal-backdrop"
          role="presentation"
          onClick={() => setIsAboutOpen(false)}
        >
          <section
            className="about-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="about-modal-close"
              type="button"
              aria-label="Cerrar acerca de"
              onClick={() => setIsAboutOpen(false)}
            >
              ×
            </button>
            <p className="about-modal-eyebrow">Hackaton Build with AI</p>
            <h2 id="about-title">Acerca de Abasto Boliviano</h2>
            <p>
              Proyecto desarrollado para la Hackaton Build with AI por Diego
              Fariñaz y Paulo Batuani.
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
