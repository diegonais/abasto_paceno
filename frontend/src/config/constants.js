export const ROLES = {
  ADMIN: 'admin',
  MERCHANT: 'comerciante',
  USER: 'usuario',
};

export const MERCHANT_KINDS = {
  INDIVIDUAL: 'independiente',
  STORE: 'tienda',
};

export const MERCHANT_VERIFICATION_STATUSES = {
  PENDING: 'pendiente',
  APPROVED: 'aprobado',
  REJECTED: 'rechazado',
};

export const SALE_TYPES = {
  UNIT: 'unidad',
  TRAY: 'maple',
};

export const OFFER_AVAILABILITY_TYPES = {
  FIXED: 'fija',
  TEMPORARY: 'temporal',
};

export const PROFILE_PHOTO_MAX_SIZE_BYTES = 2 * 1024 * 1024;
export const STORE_PHOTO_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const OFFER_PHOTO_MAX_SIZE_BYTES = 5 * 1024 * 1024;

export const DEFAULT_MAP_CENTER = [-16.4897, -68.1193];
export const DEFAULT_MAP_ZOOM = 13;
