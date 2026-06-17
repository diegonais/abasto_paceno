import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { MerchantProfile } from './entities/merchant-profile.entity';
import { MerchantProfilesController } from './merchant-profiles.controller';
import { MerchantProfilesService } from './merchant-profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([MerchantProfile, User])],
  controllers: [MerchantProfilesController],
  providers: [MerchantProfilesService],
  exports: [MerchantProfilesService],
})
export class MerchantProfilesModule {}
