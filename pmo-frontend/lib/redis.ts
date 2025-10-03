import { Redis } from 'ioredis';

let redis: Redis | null = null;

// Initialize Redis connection with better error handling
export function getRedisClient(): Redis {
  if (!redis) {
    try {
      const redisHost = process.env.REDIS_HOST || 'localhost';
      const redisPort = parseInt(process.env.REDIS_PORT || '6379');
      const redisPassword = process.env.REDIS_PASSWORD || 'redis123';

      // Validate that we have required environment variables
      if (!redisHost || isNaN(redisPort)) {
        throw new Error('Invalid Redis configuration');
      }

      redis = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 5000,
      });

      redis.on('error', (_error) => {
        // Redis connection error
      });

      redis.on('connect', () => {
        // Redis connected successfully
      });

    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      throw error;
    }
  }

  return redis;
}

// Redis-based rate limiter
export async function checkRedisRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    const client = getRedisClient();
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const redisKey = `rate_limit:${key}:${window}`;

    // Use Redis pipeline for atomic operations
    const pipeline = client.pipeline();
    pipeline.incr(redisKey);
    pipeline.expire(redisKey, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();
    const count = results?.[0]?.[1] as number || 1;

    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    const resetTime = (window + 1) * windowMs;

    return { allowed, remaining, resetTime };
  } catch {
    // Redis rate limit error - fallback to allowing the request if Redis is down
    return { allowed: true, remaining: limit - 1, resetTime: Date.now() + windowMs };
  }
}

// Request deduplication using Redis
export async function deduplicateRequest(
  key: string,
  ttlSeconds: number = 60
): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.set(`dedup:${key}`, '1', 'EX', ttlSeconds, 'NX');
    return result === 'OK'; // Returns true if this is a new request
  } catch {
    // Redis deduplication error
    return true; // Allow request if Redis is down
  }
}

// Cache API responses
export async function cacheResponse(
  key: string,
  data: unknown,
  ttlSeconds: number = 300
): Promise<void> {
  try {
    const client = getRedisClient();
    await client.set(`cache:${key}`, JSON.stringify(data), 'EX', ttlSeconds);
  } catch {
    // Redis cache set error
  }
}

export async function getCachedResponse(key: string): Promise<unknown | null> {
  try {
    const client = getRedisClient();
    const cached = await client.get(`cache:${key}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    // Redis cache get error
    return null;
  }
}