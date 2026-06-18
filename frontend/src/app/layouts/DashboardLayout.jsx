import { Outlet } from 'react-router-dom';

import { AppLayout } from '../../components/layout/AppLayout';

export function DashboardLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
