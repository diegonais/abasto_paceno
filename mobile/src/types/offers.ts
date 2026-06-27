export type SaleType = 'unidad' | 'maple' | string;

export type MapOffer = {
  id: string;
  productId: string;
  productName: string;
  categoryName?: string;
  saleType: SaleType;
  approximateQuantity: number | null;
  price: string | number | null;
  latitude: number;
  longitude: number;
  locationDescription: string | null;
  availableFrom: string | null;
  availableUntil: string | null;
  merchantProfileId: string;
  businessName: string | null;
  ownerFullName: string | null;
};
