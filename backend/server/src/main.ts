declare const module: any;
import {
  GlobalExceptionFilter,
  GlobalResponseTransformer,
} from '@app/utils/response';
import {
  ClassSerializerInterceptor,
  HttpStatus,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { corsOptions } from './config/cors.config';
import { ConfigService } from './modules/config/config.service';
import { RedisService } from './modules/redis/redis.service';
import { setupSwagger } from './swagger';
import { CommandFactory } from 'nest-commander';
import { SeederModule } from './modules/seed/seeder.module';

async function bootstrap() {
  const logger = new Logger('Server Startup');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const redisService = app.get(RedisService);

  app.enableCors(corsOptions(redisService));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const configService = app.get(ConfigService);

  app.enableShutdownHooks();
  app.setGlobalPrefix('api', { exclude: ['/'] });
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new GlobalResponseTransformer());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      // whitelist: true,
      // forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );

  app.useBodyParser('json', { limit: '1mb' });

  // if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
  // }

  await app.listen(configService.port);

  logger.log(`App Started on http://localhost:${configService.port}/api`);
  
 

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

void bootstrap();
