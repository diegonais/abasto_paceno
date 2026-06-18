import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div>
        <p className="topbar-path">{location.pathname}</p>
        <h2>Hola, {user?.fullName ?? 'usuario'}</h2>
      </div>

      <div className="topbar-actions">
        <div className="topbar-user">
          <strong>{user?.role ?? 'visitante'}</strong>
          <span>{user?.email}</span>
        </div>
        <Button variant="ghost" onClick={handleLogout}>Cerrar sesión</Button>
      </div>
    </header>
  );
}
