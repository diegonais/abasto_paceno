import { apiClient } from './client';
import type { MapOffer } from '../types/offers';

export async function getMapOffers() {
  const { data } = await apiClient.get<MapOffer[]>('/offers/map');
  return data.filter((offer) => Number.isFinite(Number(offer.latitude)) && Number.isFinite(Number(offer.longitude)));
}
