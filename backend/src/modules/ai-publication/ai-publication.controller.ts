import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import {
  AUDIO_TRANSCRIPTION_MAX_SIZE_BYTES,
} from '../../common/uploads/upload.constants';
import {
  audioFileFilter,
  type UploadedAudioFile,
} from '../../common/uploads/upload.utils';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AiPublicationService } from './ai-publication.service';

@ApiTags('AI Publication')
@Controller('ai-publication')
export class AiPublicationController {
  constructor(private readonly aiPublicationService: AiPublicationService) {}

  @ApiBearerAuth()
  @Post('transcribe-audio')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: memoryStorage(),
      fileFilter: audioFileFilter,
      limits: {
        fileSize: AUDIO_TRANSCRIPTION_MAX_SIZE_BYTES,
      },
    }),
  )
  transcribeAudio(@UploadedFile() audio?: UploadedAudioFile) {
    if (!audio) {
      throw new BadRequestException('Audio file is required');
    }

    return this.aiPublicationService.transcribeAudio(audio);
  }
}
