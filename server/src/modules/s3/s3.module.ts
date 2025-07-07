import { Global, Module } from '@nestjs/common';
import { S3Service } from './s3.service';
// import { R2Controller } from './r2.controller';

@Global()
@Module({
  providers: [S3Service],
  // controllers: [R2Controller],
})
export class S3Module {}
