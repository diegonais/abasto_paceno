import { apiClient } from './api/client';

export const usersService = {
  async list() {
    const { data } = await apiClient.get('/users');
    return data;
  },
  async create(payload) {
    const { data } = await apiClient.post('/users', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/users/${id}`, payload);
    return data;
  },
  async updateMe(payload) {
    const { data } = await apiClient.patch('/users/me', payload);
    return data;
  },
  async disable(id) {
    const { data } = await apiClient.patch(`/users/${id}/disable`);
    return data;
  },
};
