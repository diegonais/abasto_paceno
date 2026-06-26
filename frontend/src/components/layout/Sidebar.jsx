import { NavLink } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { navigationByRole } from '../../config/navigation';

export function Sidebar() {
  const { role } = useAuth();
  const items = navigationByRole[role] ?? [];

  return (
    <aside className="sidebar">
      <div>
        <p className="sidebar-eyebrow">Panel</p>
        <img
          className="sidebar-brand-logo"
          src="/abasto-boliviano.png"
          alt="Abasto Boliviano"
        />
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
