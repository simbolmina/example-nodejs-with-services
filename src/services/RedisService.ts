import redisService from '../lib/redis.js';

export interface SetDataOptions {
  ttl?: number;
  nx?: boolean;
  xx?: boolean;
}

export interface HashData {
  [key: string]: string;
}

/**
 * Get Redis health status
 */
export const getHealth = async () => {
  try {
    const isConnected = redisService.isRedisConnected();
    const ping = await redisService.ping();

    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      connected: isConnected,
      ping: ping,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get connection status
 */
export const getConnectionStatus = async () => {
  const isConnected = redisService.isRedisConnected();
  return {
    connected: isConnected,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Set a key-value pair
 */
export const setKey = async (
  key: string,
  value: string,
  options: SetDataOptions = {}
) => {
  const { ttl, nx, xx } = options;

  let result;
  if (nx) {
    result = await redisService.setNX(key, value, ttl);
  } else if (xx) {
    result = await redisService.setXX(key, value, ttl);
  } else {
    result = await redisService.set(key, value, ttl);
  }

  return {
    message: `Key '${key}' set successfully`,
    key,
    value,
    result,
  };
};

/**
 * Get a value by key
 */
export const getKey = async (key: string) => {
  const value = await redisService.get(key);

  if (value === null) {
    throw new Error(`Key '${key}' not found`);
  }

  return {
    key,
    value,
  };
};

/**
 * Delete a key
 */
export const deleteKey = async (key: string) => {
  const result = await redisService.del(key);

  return {
    message: `Key '${key}' deleted successfully`,
    key,
    deleted: result > 0,
    result,
  };
};

/**
 * Check if a key exists
 */
export const keyExists = async (key: string) => {
  const exists = await redisService.exists(key);

  return {
    key,
    exists: exists > 0,
  };
};

/**
 * Get TTL for a key
 */
export const getKeyTTL = async (key: string) => {
  const ttl = await redisService.ttl(key);

  return {
    key,
    ttl,
  };
};

/**
 * Set expiry for a key
 */
export const setKeyExpiry = async (key: string, seconds: number) => {
  const result = await redisService.expire(key, seconds);

  return {
    message: `Expiry set for key '${key}'`,
    key,
    seconds,
    result,
  };
};

/**
 * Get keys matching a pattern
 */
export const getKeys = async (pattern: string = '*') => {
  const keys = await redisService.keys(pattern);

  return {
    pattern,
    keys,
    count: keys.length,
  };
};

/**
 * Get Redis server info
 */
export const getInfo = async () => {
  const info = await redisService.info();

  return {
    info,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Get memory usage statistics
 */
export const getMemoryUsage = async () => {
  const memory = await redisService.memory();

  return {
    memory,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Set a hash field
 */
export const setHashField = async (
  key: string,
  field: string,
  value: string
) => {
  const result = await redisService.hSet(key, field, value);

  return {
    message: `Hash field '${field}' set for key '${key}'`,
    key,
    field,
    value,
    result,
  };
};

/**
 * Get a hash field
 */
export const getHashField = async (key: string, field: string) => {
  const value = await redisService.hGet(key, field);

  if (value === null) {
    throw new Error(`Hash field '${field}' not found in key '${key}'`);
  }

  return {
    key,
    field,
    value,
  };
};

/**
 * Get all hash fields
 */
export const getHashFields = async (key: string) => {
  const fields = await redisService.hGetAll(key);

  return {
    key,
    fields,
  };
};

/**
 * Delete a hash field
 */
export const deleteHashField = async (key: string, field: string) => {
  const result = await redisService.hDel(key, field);

  return {
    message: `Hash field '${field}' deleted from key '${key}'`,
    key,
    field,
    deleted: result > 0,
    result,
  };
};

/**
 * Set multiple hash fields
 */
export const setHashFields = async (key: string, data: HashData) => {
  const result = await redisService.hSetMultiple(key, data);

  return {
    message: `Hash fields set for key '${key}'`,
    key,
    fields: Object.keys(data),
    count: Object.keys(data).length,
    result,
  };
};

/**
 * Push to a list
 */
export const pushToList = async (
  key: string,
  value: string,
  direction: 'left' | 'right' = 'right'
) => {
  let result;
  if (direction === 'left') {
    result = await redisService.lPush(key, value);
  } else {
    result = await redisService.rPush(key, value);
  }

  return {
    message: `Value pushed to ${direction} of list '${key}'`,
    key,
    value,
    direction,
    result,
  };
};

/**
 * Pop from a list
 */
export const popFromList = async (
  key: string,
  direction: 'left' | 'right' = 'right'
) => {
  let result;
  if (direction === 'left') {
    result = await redisService.lPop(key);
  } else {
    result = await redisService.rPop(key);
  }

  if (result === null) {
    throw new Error(`List '${key}' is empty`);
  }

  return {
    key,
    value: result,
    direction,
  };
};

/**
 * Get list range
 */
export const getListRange = async (
  key: string,
  start: number = 0,
  stop: number = -1
) => {
  const values = await redisService.lRange(key, start, stop);

  return {
    key,
    values,
    count: values.length,
    start,
    stop,
  };
};

/**
 * Get list length
 */
export const getListLength = async (key: string) => {
  const length = await redisService.lLen(key);

  return {
    key,
    length,
  };
};
