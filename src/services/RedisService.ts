import redisService from '../lib/redis.js';

export interface SetDataOptions {
  ttl?: number;
  nx?: boolean;
  xx?: boolean;
}

export interface HashData {
  [key: string]: string;
}

class RedisAdminService {
  /**
   * Get Redis health status
   */
  async getHealth() {
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
  }

  /**
   * Get connection status
   */
  async getConnectionStatus() {
    const isConnected = redisService.isRedisConnected();
    return {
      connected: isConnected,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Set a key-value pair
   */
  async setKey(key: string, value: string, options: SetDataOptions = {}) {
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
  }

  /**
   * Get a value by key
   */
  async getKey(key: string) {
    const value = await redisService.get(key);

    if (value === null) {
      throw new Error(`Key '${key}' not found`);
    }

    return {
      key,
      value,
    };
  }

  /**
   * Delete a key
   */
  async deleteKey(key: string) {
    const result = await redisService.del(key);

    return {
      message: `Key '${key}' deleted successfully`,
      key,
      deleted: result > 0,
      result,
    };
  }

  /**
   * Check if key exists
   */
  async keyExists(key: string) {
    const exists = await redisService.exists(key);

    return {
      key,
      exists: exists > 0,
    };
  }

  /**
   * Get key TTL
   */
  async getKeyTTL(key: string) {
    const ttl = await redisService.ttl(key);

    return {
      key,
      ttl,
      hasExpiry: ttl > 0,
    };
  }

  /**
   * Set key expiration
   */
  async setKeyExpiry(key: string, seconds: number) {
    const result = await redisService.expire(key, seconds);

    return {
      message: `Expiry set for key '${key}'`,
      key,
      seconds,
      result,
    };
  }

  /**
   * Get all keys matching pattern
   */
  async getKeys(pattern: string = '*') {
    const keys = await redisService.keys(pattern);

    return {
      pattern,
      keys,
      count: keys.length,
    };
  }

  /**
   * Get Redis info
   */
  async getInfo() {
    const info = await redisService.info();

    return {
      info,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get memory usage
   */
  async getMemoryUsage() {
    const info = await redisService.info('memory');
    const lines = info.split('\r\n');
    const memoryInfo: any = {};

    lines.forEach((line) => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        memoryInfo[key] = value;
      }
    });

    return {
      memory: memoryInfo,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Set hash field
   */
  async setHashField(key: string, field: string, value: string) {
    const result = await redisService.hSet(key, field, value);

    return {
      message: `Hash field '${field}' set for key '${key}'`,
      key,
      field,
      value,
      result,
    };
  }

  /**
   * Get hash field
   */
  async getHashField(key: string, field: string) {
    const value = await redisService.hGet(key, field);

    if (value === null) {
      throw new Error(`Hash field '${field}' not found in key '${key}'`);
    }

    return {
      key,
      field,
      value,
    };
  }

  /**
   * Get all hash fields
   */
  async getHashFields(key: string) {
    const fields = await redisService.hGetAll(key);

    return {
      key,
      fields,
      count: Object.keys(fields).length,
    };
  }

  /**
   * Delete hash field
   */
  async deleteHashField(key: string, field: string) {
    const result = await redisService.hDel(key, field);

    return {
      message: `Hash field '${field}' deleted from key '${key}'`,
      key,
      field,
      deleted: result > 0,
      result,
    };
  }

  /**
   * Set multiple hash fields
   */
  async setHashFields(key: string, data: HashData) {
    const result = await redisService.hSet(key, data);

    return {
      message: `Hash fields set for key '${key}'`,
      key,
      fields: Object.keys(data),
      count: Object.keys(data).length,
      result,
    };
  }

  /**
   * List operations
   */
  async pushToList(
    key: string,
    value: string,
    direction: 'left' | 'right' = 'right'
  ) {
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
  }

  /**
   * Pop from list
   */
  async popFromList(key: string, direction: 'left' | 'right' = 'right') {
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
  }

  /**
   * Get list range
   */
  async getListRange(key: string, start: number = 0, stop: number = -1) {
    const values = await redisService.lRange(key, start, stop);

    return {
      key,
      values,
      count: values.length,
      start,
      stop,
    };
  }

  /**
   * Get list length
   */
  async getListLength(key: string) {
    const length = await redisService.lLen(key);

    return {
      key,
      length,
    };
  }
}

export default new RedisAdminService();
