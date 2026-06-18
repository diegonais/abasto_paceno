import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        <Topbar />
        <main className="page-shell">{children}</main>
      </div>
    </div>
  );
}
