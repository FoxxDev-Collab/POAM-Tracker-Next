import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  private redisClient;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.initRedisClient();
  }

  private async initRedisClient() {
    this.redisClient = createClient({
      url: `redis://:${process.env.REDIS_PASSWORD || 'redis123'}@${
        process.env.REDIS_HOST || 'localhost'
      }:${process.env.REDIS_PORT || '6379'}`,
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    await this.redisClient.connect();
  }

  async get(key: string): Promise<any> {
    return this.cacheManager.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  getClient() {
    return this.redisClient;
  }

  async increment(key: string): Promise<number> {
    return await this.redisClient.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redisClient.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.redisClient.ttl(key);
  }
}