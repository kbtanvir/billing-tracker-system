// src/database/seeders/seeder.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { UsageTestSeeder } from './seder.tester';
import { SeedUsageTestCommand } from './seeder.command';

@Module({
  imports: [DrizzleModule],
  providers: [UsageTestSeeder, SeedUsageTestCommand, ConfigService],
  exports: [UsageTestSeeder, ConfigService],
})
export class SeederModule {}
