import { apiClient } from './api/client';

export const aiPublicationService = {
  async transcribeAudio(audioFile) {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const { data } = await apiClient.post('/ai-publication/transcribe-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    return data;
  },
};
