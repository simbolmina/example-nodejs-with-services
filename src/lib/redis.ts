import { createClient, RedisClientType } from 'redis';

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://redis:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        console.log('Redis connection ended');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  getClient(): RedisClientType | null {
    return this.client;
  }

  isRedisConnected(): boolean {
    return this.isConnected;
  }

  // Cache operations
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.get(key);
  }

  async del(key: string): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.exists(key);
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.hSet(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.hGet(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.hGetAll(key);
  }

  // List operations
  async lpush(key: string, value: string): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.lPush(key, value);
  }

  async rpush(key: string, value: string): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.rPush(key, value);
  }

  async lpop(key: string): Promise<string | null> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.lPop(key);
  }

  async rpop(key: string): Promise<string | null> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.rPop(key);
  }

  // Set operations
  async sadd(key: string, member: string): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.sAdd(key, member);
  }

  async srem(key: string, member: string): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.sRem(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.sMembers(key);
  }

  // Utility methods
  async ping(): Promise<string> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.ping();
  }

  async flushdb(): Promise<string> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.flushDb();
  }

  async info(): Promise<string> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.info();
  }
}

// Create singleton instance
const redisService = new RedisService();

export default redisService;
