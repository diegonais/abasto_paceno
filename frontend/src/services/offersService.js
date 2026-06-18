import { apiClient } from './api/client';

export const offersService = {
  async list() {
    const { data } = await apiClient.get('/offers');
    return data;
  },
  async listForMap() {
    const { data } = await apiClient.get('/offers/map');
    return data;
  },
  async listMine() {
    const { data } = await apiClient.get('/offers/my-offers');
    return data;
  },
  async getById(id) {
    const { data } = await apiClient.get(`/offers/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await apiClient.post('/offers', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/offers/${id}`, payload);
    return data;
  },
  async disable(id) {
    const { data } = await apiClient.patch(`/offers/${id}/disable`);
    return data;
  },
};
