import { ROLES } from './constants';

export const navigationByRole = {
  [ROLES.USER]: [
    { to: '/app/map', label: 'Mapa', hint: 'Ver ofertas activas' },
    { to: '/app/profile', label: 'Perfil', hint: 'Actualizar mis datos' },
  ],
  [ROLES.MERCHANT]: [
    { to: '/merchant/map', label: 'Mapa', hint: 'Resumen de actividad' },
    { to: '/merchant/profile', label: 'Perfil comercial', hint: 'Actualizar negocio' },
    { to: '/merchant/offers', label: 'Ofertas', hint: 'Gestionar publicaciones' },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin/dashboard', label: 'Dashboard', hint: 'Vista general' },
    { to: '/admin/users', label: 'Usuarios', hint: 'Administrar cuentas' },
    { to: '/admin/merchant-profiles', label: 'Comerciantes', hint: 'Perfilar negocios' },
    { to: '/admin/categories', label: 'Categorías', hint: 'Ordenar productos' },
    { to: '/admin/products', label: 'Productos', hint: 'Catálogo base' },
    { to: '/admin/offers', label: 'Ofertas', hint: 'Control de publicaciones' },
  ],
};

export function getDefaultRouteForRole(role) {
  if (role === ROLES.ADMIN) return '/admin/dashboard';
  if (role === ROLES.MERCHANT) return '/merchant/map';
  return '/app/map';
}
