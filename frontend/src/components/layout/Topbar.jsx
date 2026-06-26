import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../config/constants';
import { navigationByRole } from '../../config/navigation';
import { getAssetUrl } from '../../services/api/assets';
import { ThemeToggle } from '../common/ThemeToggle';

const profilePathByRole = {
  [ROLES.USER]: '/app/profile',
  [ROLES.MERCHANT]: '/merchant/profile',
};

export function Topbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const profilePath = profilePathByRole[role] ?? '';
  const items = (navigationByRole[role] ?? []).filter(
    (item) => item.to !== profilePath,
  );
  const userName = user?.fullName ?? user?.email ?? 'usuario';
  const userRoleLabel = user?.role ?? 'visitante';
  const profilePhotoUrl = user?.profilePhotoPath ? getAssetUrl(user.profilePhotoPath) : '';

  useEffect(() => {
    if (!isAccountMenuOpen) return undefined;

    function handlePointerDown(event) {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  function handleLogout() {
    setIsAccountMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
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

        <nav className="role-nav" aria-label="Navegación del panel">
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
          <div className="account-menu-wrapper" ref={accountMenuRef}>
            <button
              className="account-menu-trigger"
              type="button"
              aria-haspopup="menu"
              aria-expanded={isAccountMenuOpen}
              onClick={() => setIsAccountMenuOpen((currentValue) => !currentValue)}
              title={`Bienvenido ${userName}`}
            >
              {profilePhotoUrl ? (
                <img
                  className="account-menu-avatar account-menu-avatar-image"
                  src={profilePhotoUrl}
                  alt=""
                  aria-hidden="true"
                />
              ) : (
                <span className="account-menu-avatar" aria-hidden="true">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="account-menu-text">
                <span>Bienvenido</span>
                <strong>{userName}</strong>
              </span>
              <span className="account-menu-caret" aria-hidden="true" />
            </button>

            {isAccountMenuOpen ? (
              <div className="account-menu" role="menu">
                <div className="account-menu-head">
                  <strong>{userName}</strong>
                  <span>{userRoleLabel}</span>
                </div>

                {profilePath ? (
                  <Link
                    className="account-menu-item"
                    role="menuitem"
                    to={profilePath}
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    Mi perfil
                  </Link>
                ) : null}

                <button
                  className="account-menu-item account-menu-logout"
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : null}
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
