import { apiClient } from './api/client';

export const semanticSearchService = {
  async search(query) {
    const { data } = await apiClient.post('/semantic-search', { query });
    return data;
  },
};
