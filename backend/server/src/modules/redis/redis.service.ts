import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  // Method to set a value in Redis with error handling
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redisClient.set(key, value, 'EX', ttl); // Expiration in seconds
      } else {
        await this.redisClient.set(key, value);
      }
    } catch (error) {
      // Log error if needed and throw a specific HTTP exception
      console.error('Redis SET Error:', error);
      throw new HttpException(
        'Failed to save data in Redis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async isOriginAllowed(origin: string): Promise<boolean> {
    if (!origin) return false;

    // Check if origin is in Redis set of allowed domains
    const allowed = await this.redisClient.sismember(
      'allowed_cors_domains',
      origin,
    );

    return allowed === 1;
  }

  async addAllowedOrigin(origin: string): Promise<void> {
    await this.redisClient.sadd('allowed_cors_domains', origin);
  }

  async removeAllowedOrigin(origin: string): Promise<void> {
    await this.redisClient.srem('allowed_cors_domains', origin);
  }
  // Method to get a value from Redis with error handling
  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      console.error('Redis GET Error:', error);
      throw new HttpException(
        'Failed to retrieve data from Redis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Method to delete a key from Redis with error handling
  async delete(key: string): Promise<number> {
    try {
      return await this.redisClient.del(key);
    } catch (error) {
      console.error('Redis DELETE Error:', error);
      throw new HttpException(
        'Failed to delete data from Redis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteAll(pattern: string) {
    const keys = await this.redisClient.keys(pattern);
    const pipeline = this.redisClient.pipeline();

    for (const key of keys) {
      pipeline.del(key);
    }

    await pipeline.exec();

    return {
      message: `Deleted ${keys.length} keys matching pattern "${pattern}"`,
    };
  }

  // Check existence of key
  async exists(key: string): Promise<boolean> {
    try {
      return (await this.redisClient.exists(key)) === 1;
    } catch (error) {
      console.error('Redis EXISTS Error:', error);
      throw new HttpException(
        'Failed to check existence in Redis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async replaceSubdomain(
    oldSubdomain: string,
    newSubdomain: string,
  ): Promise<boolean> {
    if (oldSubdomain === newSubdomain) {
      throw new HttpException(
        'New subdomain matches the existing subdomain',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.redisClient.rename(
        `subdomain:${oldSubdomain}`,
        `subdomain:${newSubdomain}`,
      );
      await this.redisClient.rename(
        `subdomain:${oldSubdomain}:home`,
        `subdomain:${newSubdomain}:home`,
      );

      return true;
    } catch (error) {
      console.error('Error replacing keys:', error);
      throw new HttpException(
        'Failed to replace subdomain keys in Redis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
