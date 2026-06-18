import { apiClient } from './api/client';

export const categoriesService = {
  async list() {
    const { data } = await apiClient.get('/categories');
    return data;
  },
  async create(payload) {
    const { data } = await apiClient.post('/categories', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/categories/${id}`, payload);
    return data;
  },
  async disable(id) {
    const { data } = await apiClient.patch(`/categories/${id}/disable`);
    return data;
  },
};
