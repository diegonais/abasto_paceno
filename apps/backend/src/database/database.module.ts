import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from '../config/database.config';
import { PostgisInitializerService } from './postgis-initializer.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [databaseConfig.KEY],
      useFactory: (
        databaseSettings: ConfigType<typeof databaseConfig>,
      ) => databaseSettings,
    }),
  ],
  providers: [PostgisInitializerService],
})
export class DatabaseModule {}
