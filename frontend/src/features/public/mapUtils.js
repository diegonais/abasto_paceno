export const FOOD_TYPES = [
  {
    key: 'all',
    label: 'Todos',
    shortLabel: 'Todo',
    description: 'Mapa completo',
    color: '#7b1835',
  },
  {
    key: 'verduras',
    label: 'Verduras',
    shortLabel: 'Verd.',
    description: 'Hortalizas frescas',
    color: '#1e9b64',
  },
  {
    key: 'frutas',
    label: 'Frutas',
    shortLabel: 'Fruta',
    description: 'De temporada',
    color: '#aa2950',
  },
  {
    key: 'lacteos',
    label: 'Lacteos',
    shortLabel: 'Lact.',
    description: 'Leche y quesos',
    color: '#3a6ea5',
  },
  {
    key: 'carnicos',
    label: 'Carnicos',
    shortLabel: 'Carne',
    description: 'Pollo, res y cerdo',
    color: '#8b1e3f',
  },
  {
    key: 'panaderia',
    label: 'Panaderia',
    shortLabel: 'Pan',
    description: 'Pan y horneados',
    color: '#9a6a2a',
  },
  {
    key: 'abarrotes',
    label: 'Abarrotes',
    shortLabel: 'Desp.',
    description: 'Despensa diaria',
    color: '#6f4a8e',
  },
  {
    key: 'bebidas',
    label: 'Bebidas',
    shortLabel: 'Beb.',
    description: 'Jugos y refrescos',
    color: '#007f7a',
  },
  {
    key: 'huevos',
    label: 'Huevos',
    shortLabel: 'Huevo',
    description: 'Unidad o maple',
    color: '#b0892c',
  },
  {
    key: 'otros',
    label: 'Otros',
    shortLabel: 'Otro',
    description: 'Otros productos',
    color: '#776267',
  },
];

const TYPE_BY_KEY = FOOD_TYPES.reduce((lookup, type) => {
  lookup[type.key] = type;
  return lookup;
}, {});

const PRODUCT_TYPE_RULES = [
  { key: 'huevos', terms: ['huevo', 'maple'] },
  { key: 'verduras', terms: ['tomate', 'cebolla', 'papa', 'zanahoria', 'brocoli', 'verdura', 'hortaliza'] },
  { key: 'frutas', terms: ['platano', 'manzana', 'papaya', 'uva', 'fruta'] },
  { key: 'abarrotes', terms: ['arroz', 'aceite', 'azucar', 'abarrote', 'despensa'] },
  { key: 'lacteos', terms: ['leche', 'queso', 'yogur', 'lacteo'] },
  { key: 'carnicos', terms: ['pollo', 'carne', 'costilla', 'cerdo', 'res', 'carnico'] },
  { key: 'panaderia', terms: ['pan', 'marraqueta', 'integral', 'panaderia'] },
  { key: 'bebidas', terms: ['jugo', 'refresco', 'mocochinchi', 'bebida'] },
];

export const RADIUS_OPTIONS = [1, 3, 5, 10];

export function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function getProductName(offer) {
  return offer?.product?.productName ?? offer?.productName ?? 'Producto';
}

export function getMerchantId(offer) {
  return (
    offer?.merchantProfile?.id ??
    offer?.merchantProfileId ??
    normalizeText(getMerchantName(offer)).replace(/\s+/g, '-')
  );
}

export function getMerchantName(offer) {
  return (
    offer?.merchantProfile?.businessName ??
    offer?.businessName ??
    offer?.merchantProfile?.ownerFullName ??
    offer?.ownerFullName ??
    'Comerciante'
  );
}

export function getOfferTypeKey(offer) {
  const category = normalizeText(
    offer?.product?.category?.categoryName ?? offer?.categoryName,
  );
  const product = normalizeText(getProductName(offer));

  if (TYPE_BY_KEY[category]) {
    return category;
  }

  const match = PRODUCT_TYPE_RULES.find((rule) =>
    rule.terms.some((term) => product.includes(term) || category.includes(term)),
  );

  return match?.key ?? 'otros';
}

export function getTypeMeta(key) {
  return TYPE_BY_KEY[key] ?? TYPE_BY_KEY.otros;
}

export function getOfferCoordinates(offer) {
  const lat = Number(offer?.latitude);
  const lng = Number(offer?.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

export function distanceInKm(from, to) {
  if (!from || !to) return null;

  const earthRadiusKm = 6371;
  const toRadians = (value) => (value * Math.PI) / 180;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const startLat = toRadians(from.lat);
  const endLat = toRadians(to.lat);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function formatDistance(distanceKm) {
  if (!Number.isFinite(distanceKm)) return '';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm >= 10 ? 0 : 1)} km`;
}

export function buildMerchantGroups(offers, userLocation) {
  const groups = new Map();

  offers.forEach((offer) => {
    const merchantId = getMerchantId(offer);
    const coordinates = getOfferCoordinates(offer);
    const distanceKm = coordinates ? distanceInKm(userLocation, coordinates) : null;

    if (!groups.has(merchantId)) {
      groups.set(merchantId, {
        id: merchantId,
        name: getMerchantName(offer),
        ownerName: offer?.merchantProfile?.ownerFullName ?? offer?.ownerFullName ?? '',
        locationDescription: offer?.locationDescription ?? '',
        distanceKm,
        offers: [],
        types: new Set(),
      });
    }

    const group = groups.get(merchantId);
    group.offers.push({ ...offer, distanceKm });
    group.types.add(getOfferTypeKey(offer));

    if (
      distanceKm !== null &&
      (group.distanceKm === null ||
        group.distanceKm === undefined ||
        distanceKm < group.distanceKm)
    ) {
      group.distanceKm = distanceKm;
    }
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      types: Array.from(group.types),
      offers: group.offers.sort((first, second) =>
        getProductName(first).localeCompare(getProductName(second)),
      ),
    }))
    .sort((first, second) => {
      if (first.distanceKm !== null && second.distanceKm !== null) {
        return first.distanceKm - second.distanceKm;
      }
      if (first.distanceKm !== null) return -1;
      if (second.distanceKm !== null) return 1;
      return first.name.localeCompare(second.name);
    });
}
