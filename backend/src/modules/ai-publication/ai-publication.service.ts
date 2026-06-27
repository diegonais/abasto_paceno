import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { UploadedAudioFile } from '../../common/uploads/upload.utils';

type GroqTranscriptionResponse = {
  text?: string;
};

@Injectable()
export class AiPublicationService {
  private readonly groqTranscriptionsUrl =
    'https://api.groq.com/openai/v1/audio/transcriptions';

  constructor(private readonly configService: ConfigService) {}

  async transcribeAudio(audio: UploadedAudioFile) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException('Groq API key is not configured');
    }

    const formData = new FormData();
    const audioBytes = audio.buffer.buffer.slice(
      audio.buffer.byteOffset,
      audio.buffer.byteOffset + audio.buffer.byteLength,
    ) as ArrayBuffer;
    const audioBlob = new Blob([audioBytes], { type: audio.mimetype });

    formData.append('file', audioBlob, audio.originalname || 'audio.m4a');
    formData.append(
      'model',
      this.configService.get<string>(
        'GROQ_SPEECH_TO_TEXT_MODEL',
        'whisper-large-v3-turbo',
      ),
    );
    formData.append('response_format', 'json');
    formData.append('language', 'es');

    let response: Response;

    try {
      response = await fetch(this.groqTranscriptionsUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });
    } catch {
      throw new BadGatewayException('Could not connect to Groq transcription service');
    }

    if (!response.ok) {
      throw new BadGatewayException('Groq could not transcribe the audio');
    }

    const data = (await response.json()) as GroqTranscriptionResponse;
    const transcription = data.text?.trim();

    if (!transcription) {
      throw new BadGatewayException('Groq returned an empty transcription');
    }

    return { transcription };
  }
}
