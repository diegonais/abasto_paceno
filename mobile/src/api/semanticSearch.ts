import { apiClient } from './client';
import type { MapOffer } from '../types/offers';

type SemanticSearchResponse = {
  intent: string;
  products: string[];
  offers: MapOffer[];
  fallback?: boolean;
  message?: string;
};

export async function searchSemanticOffers(query: string) {
  const { data } = await apiClient.post<SemanticSearchResponse>('/semantic-search', { query });

  return {
    ...data,
    offers: data.offers.filter(
      (offer) =>
        Number.isFinite(Number(offer.latitude)) && Number.isFinite(Number(offer.longitude)),
    ),
  };
}
