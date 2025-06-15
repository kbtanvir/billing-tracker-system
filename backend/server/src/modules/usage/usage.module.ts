import { Module } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { UsageController } from './usage.controller';
import { UsageRepository } from './usage.repository';
import { UsageService } from './usage.service';
import { UserRepository } from './users.repository';

@Module({
  imports: [],
  controllers: [UsageController],
  providers: [UserRepository, S3Service, UsageService, UsageRepository],
  exports: [UsageService, UsageRepository],
})
export class UsageModule {}
