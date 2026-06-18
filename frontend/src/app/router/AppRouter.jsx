import { Navigate, Route, Routes } from 'react-router-dom';

import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../../components/common/ProtectedRoute';
import { RoleRoute } from '../../components/common/RoleRoute';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../config/constants';
import { getDefaultRouteForRole } from '../../config/navigation';
import { PublicHomePage } from '../../features/public/PublicHomePage';
import { PublicMapPage } from '../../features/public/PublicMapPage';
import { LoginPage } from '../../features/auth/LoginPage';
import { RegisterPage } from '../../features/auth/RegisterPage';
import { UserMapPage } from '../../features/user/UserMapPage';
import { UserProfilePage } from '../../features/user/UserProfilePage';
import { MerchantDashboardPage } from '../../features/merchant/MerchantDashboardPage';
import { MerchantProfilePage } from '../../features/merchant/MerchantProfilePage';
import { MerchantOffersPage } from '../../features/merchant/MerchantOffersPage';
import { AdminDashboardPage } from '../../features/admin/AdminDashboardPage';
import { AdminUsersPage } from '../../features/admin/AdminUsersPage';
import { AdminMerchantProfilesPage } from '../../features/admin/AdminMerchantProfilesPage';
import { AdminCategoriesPage } from '../../features/admin/AdminCategoriesPage';
import { AdminProductsPage } from '../../features/admin/AdminProductsPage';
import { AdminOffersPage } from '../../features/admin/AdminOffersPage';
import { NotFoundPage } from '../../features/public/NotFoundPage';

function AuthRedirect() {
  const { isAuthenticated, isBootstrapping, role } = useAuth();

  if (isBootstrapping) {
    return <LoadingState label="Cargando aplicación..." fullPage />;
  }

  return (
    <Navigate
      to={isAuthenticated ? getDefaultRouteForRole(role) : '/'}
      replace
    />
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<PublicHomePage />} />
        <Route path="/map" element={<PublicMapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route element={<RoleRoute allowedRoles={[ROLES.USER]} />}>
            <Route path="/app/map" element={<UserMapPage />} />
            <Route path="/app/profile" element={<UserProfilePage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.MERCHANT]} />}>
            <Route path="/merchant/map" element={<MerchantDashboardPage />} />
            <Route path="/merchant/profile" element={<MerchantProfilePage />} />
            <Route path="/merchant/offers" element={<MerchantOffersPage />} />
            <Route path="/merchant/offers/create" element={<MerchantOffersPage mode="create" />} />
            <Route path="/merchant/offers/:id/edit" element={<MerchantOffersPage mode="edit" />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/merchant-profiles" element={<AdminMerchantProfilesPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/offers" element={<AdminOffersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/dashboard" element={<AuthRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
