import { ROLES } from './constants';

export const navigationByRole = {
  [ROLES.USER]: [
    { to: '/app/map', label: 'Mapa' },
    { to: '/app/profile', label: 'Perfil' },
    { to: '/app/merchant-application', label: 'Quiero vender' },
  ],
  [ROLES.MERCHANT]: [
    { to: '/merchant/map', label: 'Mapa' },
    { to: '/merchant/profile', label: 'Perfil comercial' },
    { to: '/merchant/offers', label: 'Ofertas' },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Usuarios' },
    { to: '/admin/merchant-profiles', label: 'Comerciantes' },
    { to: '/admin/categories', label: 'Categorias' },
    { to: '/admin/products', label: 'Productos' },
    { to: '/admin/offers', label: 'Ofertas' },
  ],
};

export function getDefaultRouteForRole(role) {
  if (role === ROLES.ADMIN) return '/admin/dashboard';
  if (role === ROLES.MERCHANT) return '/merchant/map';
  return '/app/map';
}
