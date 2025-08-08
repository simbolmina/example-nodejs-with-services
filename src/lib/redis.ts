import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;
let isConnected = false;

export const connect = async (): Promise<void> => {
  try {
    client = createClient({
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

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      isConnected = false;
    });

    client.on('connect', () => {
      console.log('✅ Redis connected successfully');
      isConnected = true;
    });

    client.on('ready', () => {
      console.log('✅ Redis client ready');
      isConnected = true;
    });

    client.on('end', () => {
      console.log('Redis connection ended');
      isConnected = false;
    });

    await client.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    isConnected = false;
    throw error;
  }
};

export const disconnect = async (): Promise<void> => {
  if (client) {
    await client.quit();
    isConnected = false;
  }
};

export const getClient = (): RedisClientType | null => {
  return client;
};

export const isRedisConnected = (): boolean => {
  return isConnected;
};

// Cache operations
export const set = async (
  key: string,
  value: string,
  ttl?: number
): Promise<void> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  if (ttl) {
    await client.setEx(key, ttl, value);
  } else {
    await client.set(key, value);
  }
};

export const get = async (key: string): Promise<string | null> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.get(key);
};

export const del = async (key: string): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.del(key);
};

export const exists = async (key: string): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.exists(key);
};

export const ttl = async (key: string): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.ttl(key);
};

export const expire = async (key: string, seconds: number): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.expire(key, seconds);
};

export const keys = async (pattern: string): Promise<string[]> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.keys(pattern);
};

export const info = async (): Promise<string> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.info();
};

export const memory = async (): Promise<any> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  // Redis client doesn't have a memory method, so we'll use INFO instead
  const info = await client.info('memory');
  return info;
};

export const ping = async (): Promise<string> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.ping();
};

export const flushdb = async (): Promise<string> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.flushDb();
};

// Counter operations
export const incrBy = async (
  key: string,
  amount: number = 1
): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }
  return await client.incrBy(key, amount);
};

export const hIncrBy = async (
  key: string,
  field: string,
  increment: number = 1
): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }
  return await client.hIncrBy(key, field, increment);
};

// Hash operations
export const hSet = async (
  key: string,
  field: string,
  value: string
): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.hSet(key, field, value);
};

export const hSetMultiple = async (
  key: string,
  data: Record<string, string>
): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.hSet(key, data);
};

export const hGet = async (
  key: string,
  field: string
): Promise<string | null> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.hGet(key, field);
};

export const hGetAll = async (key: string): Promise<Record<string, string>> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.hGetAll(key);
};

export const hDel = async (key: string, field: string): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.hDel(key, field);
};

// List operations
export const lPush = async (key: string, value: string): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.lPush(key, value);
};

export const rPush = async (key: string, value: string): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.rPush(key, value);
};

export const lPop = async (key: string): Promise<string | null> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.lPop(key);
};

export const rPop = async (key: string): Promise<string | null> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.rPop(key);
};

export const lRange = async (
  key: string,
  start: number,
  stop: number
): Promise<string[]> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.lRange(key, start, stop);
};

export const lLen = async (key: string): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.lLen(key);
};

// Set operations
export const sAdd = async (key: string, member: string): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.sAdd(key, member);
};

export const sRem = async (key: string, member: string): Promise<number> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.sRem(key, member);
};

export const sMembers = async (key: string): Promise<string[]> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  return await client.sMembers(key);
};

// Conditional operations
export const setNX = async (
  key: string,
  value: string,
  ttl?: number
): Promise<boolean> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  if (ttl) {
    // Use set with NX and EX options
    const result = await client.set(key, value, { NX: true, EX: ttl });
    return result === 'OK';
  } else {
    // Use setNX method - it returns 1 if set, 0 if not set
    const result = await client.setNX(key, value);
    return result === 1;
  }
};

export const setXX = async (
  key: string,
  value: string,
  ttl?: number
): Promise<boolean> => {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  if (ttl) {
    const result = await client.set(key, value, { XX: true, EX: ttl });
    return result === 'OK';
  } else {
    const result = await client.set(key, value, { XX: true });
    return result === 'OK';
  }
};

// Default export for backward compatibility
const redisService = {
  connect,
  disconnect,
  getClient,
  isRedisConnected,
  set,
  get,
  del,
  exists,
  ttl,
  expire,
  keys,
  info,
  memory,
  ping,
  flushdb,
  incrBy,
  hSet,
  hSetMultiple,
  hGet,
  hGetAll,
  hDel,
  hIncrBy,
  lPush,
  rPush,
  lPop,
  rPop,
  lRange,
  lLen,
  sAdd,
  sRem,
  sMembers,
  setNX,
  setXX,
};

export default redisService;
