export function formatCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return 'Precio no indicado';
  }

  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function getMerchantName(offer: {
  businessName?: string | null;
  ownerFullName?: string | null;
}) {
  return offer.businessName || offer.ownerFullName || 'Comerciante';
}
