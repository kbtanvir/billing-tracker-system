import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // const origin = req.get('Origin') || 'N/A';
    // const referer = req.get('Referer') || 'N/A';
    // const host = req.get('Host') || 'N/A';

    Logger.debug(`--------------------`);
    // Logger.debug(`Host: ${req.headers.origin}`);
    Logger.debug(`Origin: ${req.originalUrl}`);
    // Logger.debug(`Referer: ${referer}`);

    next();
  }
}
