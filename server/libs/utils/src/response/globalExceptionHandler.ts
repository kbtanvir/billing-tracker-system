import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger('Exception Filter');
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let error = 'Internal Server Error';
    let statusCode = 500;

    if (exception instanceof HttpException) {
      const response = exception.getResponse() as { message?: any };
      error = Array.isArray(response?.message)
        ? response.message.join(', ')
        : response?.message || exception.message || '';

      statusCode = exception.getStatus();
    }

    this.logger.error(exception.message, exception.stack);

    response.status(statusCode).json({
      success: false,
      data: null,
      message: error,
    });
  }
}
