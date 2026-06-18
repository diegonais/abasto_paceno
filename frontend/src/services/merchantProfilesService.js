import { apiClient } from './api/client';

export const merchantProfilesService = {
  async list() {
    const { data } = await apiClient.get('/merchant-profiles');
    return data;
  },
  async create(payload) {
    const { data } = await apiClient.post('/merchant-profiles', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/merchant-profiles/${id}`, payload);
    return data;
  },
  async disable(id) {
    const { data } = await apiClient.patch(`/merchant-profiles/${id}/disable`);
    return data;
  },
  async getMine() {
    const { data } = await apiClient.get('/merchant-profiles/me');
    return data;
  },
  async updateMine(payload) {
    const { data } = await apiClient.patch('/merchant-profiles/me', payload);
    return data;
  },
};
