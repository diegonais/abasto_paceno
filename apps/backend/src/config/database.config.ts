import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const DEFAULT_DATABASE_PORT = 5432;

export const databaseConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: process.env.DATABASE_PORT
      ? Number(process.env.DATABASE_PORT)
      : DEFAULT_DATABASE_PORT,
    username: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    database: process.env.DATABASE_NAME ?? 'abasto_paceno',
    autoLoadEntities: true,
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
  }),
);
