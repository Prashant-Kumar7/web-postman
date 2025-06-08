import { defineConfig } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import path from 'path';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities/*.ts'], 
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL,
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
  driverOptions: {
    connection: {
      ssl: {
        rejectUnauthorized: false, // Important for cloud providers with self-signed certs
      },
    },
  },
  debug: true,
});
