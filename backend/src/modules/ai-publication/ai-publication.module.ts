import { Module } from '@nestjs/common';

import { AiPublicationController } from './ai-publication.controller';
import { AiPublicationService } from './ai-publication.service';

@Module({
  controllers: [AiPublicationController],
  providers: [AiPublicationService],
})
export class AiPublicationModule {}
