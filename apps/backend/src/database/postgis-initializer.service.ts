import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PostgisInitializerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PostgisInitializerService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    this.logger.log('PostGIS extension is ready.');
  }
}
