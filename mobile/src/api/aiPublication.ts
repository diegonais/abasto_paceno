import { apiClient } from './client';

type TranscribeAudioResponse = {
  transcription: string;
};

type AudioFile = {
  uri: string;
  name: string;
  type: string;
};

export async function transcribePublicationAudio(audio: AudioFile) {
  const formData = new FormData();
  formData.append('audio', audio as unknown as Blob);

  const { data } = await apiClient.post<TranscribeAudioResponse>(
    '/ai-publication/transcribe-audio',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    },
  );

  return data;
}
