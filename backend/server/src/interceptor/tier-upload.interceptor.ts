import { S3Service } from '@app/modules/s3/s3.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TierBasedUploadInterceptor implements NestInterceptor {
  constructor(private readonly s3Service: S3Service) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    return next.handle();
  }
}
