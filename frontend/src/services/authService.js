import { apiClient } from './api/client';

export const authService = {
  async login(payload) {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  },
  async register(payload) {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },
  async getCurrentUser() {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};
