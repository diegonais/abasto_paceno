import { Topbar } from './Topbar';

export function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Topbar />
      <main className="page-shell">{children}</main>
    </div>
  );
}
