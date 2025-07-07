import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class GlobalResponseTransformer<T>
  implements NestInterceptor<T, Response<T> | string>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T> | string> {
    const request = context.switchToHttp().getRequest();

    // Check if a special header or condition is met (e.g., no JSON wrapping needed)
    const isRawResponse = request.headers['x-raw-response'] === 'true';

    return next.handle().pipe(
      map((data) => {
        // If the raw response condition is met, return only the URL as a string
        if (isRawResponse && typeof data === 'string') {
          return data; // No JSON wrapping, return the raw string
        }

        // Otherwise, return the default JSON-wrapped response
        return {
          success: true,
          data: data || null,
        };
      }),
    );
  }
}
