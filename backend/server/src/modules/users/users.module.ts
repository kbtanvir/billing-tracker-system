import { Module } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { UsageRepository } from './usage.repository';
import { UsageController } from './users.controller';
import { UserRepository } from './users.repository';
import { UsageService } from './users.service';

@Module({
  imports: [],
  controllers: [UsageController],
  providers: [UserRepository, UsageService, UsageRepository, S3Service],
  exports: [UsageService],
})
export class UsersModule {}
