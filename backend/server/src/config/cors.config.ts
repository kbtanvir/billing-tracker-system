import { RedisService } from '@app/modules/redis/redis.service';
const ALLOWED_URLS = [...process.env.ALLOWED_URLS.split(',')];

export function corsOptions(redisService: RedisService) {
  return {
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: async (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // TODO: make it dynamic when creating a project
      // await redisService.addAllowedOrigin(
      //   'http://cayon-1743496493310.localhost',
      // );
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // 1. First check against static ALLOWED_URLS
      if (ALLOWED_URLS.includes(origin)) {
        return callback(null, true);
      }

      try {
        // 2. Check Redis for dynamic allowed domains
        const isAllowed = await redisService.isOriginAllowed(origin);

        if (isAllowed) {
          return callback(null, true);
        }

        // Origin not allowed
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      } catch (error) {
        console.error('Redis CORS check failed:', error);
        // Fail securely - deny access if Redis check fails
        callback(new Error('CORS verification service unavailable'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    // Additional recommended options
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
  };
}
