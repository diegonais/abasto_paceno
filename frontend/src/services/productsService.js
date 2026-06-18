import { apiClient } from './api/client';

export const productsService = {
  async list() {
    const { data } = await apiClient.get('/products');
    return data;
  },
  async create(payload) {
    const { data } = await apiClient.post('/products', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/products/${id}`, payload);
    return data;
  },
  async disable(id) {
    const { data } = await apiClient.patch(`/products/${id}/disable`);
    return data;
  },
};
