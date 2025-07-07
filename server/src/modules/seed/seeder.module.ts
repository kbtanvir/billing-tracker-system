// src/database/seeders/seeder.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { UsageTestSeeder } from './seder.tester';
import { SeedUsageTestCommand } from './seeder.command';

@Module({
  imports: [DrizzleModule, ConfigModule],
  providers: [UsageTestSeeder, SeedUsageTestCommand],
  exports: [UsageTestSeeder],
})
export class SeederModule {}
