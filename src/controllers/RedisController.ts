import { Request, Response } from 'express';
import RedisAdminService, {
  SetDataOptions,
  HashData,
} from '../services/RedisService.js';

class RedisController {
  /**
   * Get Redis health status
   */
  async getHealth(req: Request, res: Response) {
    try {
      const health = await RedisAdminService.getHealth();
      res.json(health);
    } catch (error) {
      console.error('❌ Error checking Redis health:', error);
      res.status(500).json({ error: 'Failed to check Redis health' });
    }
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(req: Request, res: Response) {
    try {
      const status = await RedisAdminService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      console.error('❌ Error checking Redis connection:', error);
      res.status(500).json({ error: 'Failed to check Redis connection' });
    }
  }

  /**
   * Set a key-value pair
   */
  async setKey(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const { value, ttl, nx, xx } = req.body;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      if (value === undefined) {
        return res.status(400).json({ error: 'Value is required' });
      }

      const options: SetDataOptions = { ttl, nx, xx };
      const result = await RedisAdminService.setKey(key, value, options);
      res.json(result);
    } catch (error) {
      console.error('❌ Error setting Redis key:', error);
      res.status(500).json({ error: 'Failed to set Redis key' });
    }
  }

  /**
   * Get a value by key
   */
  async getKey(req: Request, res: Response) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      const result = await RedisAdminService.getKey(key);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting Redis key:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get Redis key' });
    }
  }

  /**
   * Delete a key
   */
  async deleteKey(req: Request, res: Response) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      const result = await RedisAdminService.deleteKey(key);
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting Redis key:', error);
      res.status(500).json({ error: 'Failed to delete Redis key' });
    }
  }

  /**
   * Check if key exists
   */
  async keyExists(req: Request, res: Response) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      const result = await RedisAdminService.keyExists(key);
      res.json(result);
    } catch (error) {
      console.error('❌ Error checking Redis key existence:', error);
      res.status(500).json({ error: 'Failed to check Redis key existence' });
    }
  }

  /**
   * Get key TTL
   */
  async getKeyTTL(req: Request, res: Response) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      const result = await RedisAdminService.getKeyTTL(key);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting Redis key TTL:', error);
      res.status(500).json({ error: 'Failed to get Redis key TTL' });
    }
  }

  /**
   * Set key expiration
   */
  async setKeyExpiry(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const { seconds } = req.body;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      if (!seconds || typeof seconds !== 'number') {
        return res
          .status(400)
          .json({ error: 'Seconds is required and must be a number' });
      }

      const result = await RedisAdminService.setKeyExpiry(key, seconds);
      res.json(result);
    } catch (error) {
      console.error('❌ Error setting Redis key expiry:', error);
      res.status(500).json({ error: 'Failed to set Redis key expiry' });
    }
  }

  /**
   * Get all keys matching pattern
   */
  async getKeys(req: Request, res: Response) {
    try {
      const { pattern = '*' } = req.query;

      const result = await RedisAdminService.getKeys(pattern as string);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting Redis keys:', error);
      res.status(500).json({ error: 'Failed to get Redis keys' });
    }
  }

  /**
   * Get Redis info
   */
  async getInfo(req: Request, res: Response) {
    try {
      const result = await RedisAdminService.getInfo();
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting Redis info:', error);
      res.status(500).json({ error: 'Failed to get Redis info' });
    }
  }

  /**
   * Get memory usage
   */
  async getMemoryUsage(req: Request, res: Response) {
    try {
      const result = await RedisAdminService.getMemoryUsage();
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting Redis memory usage:', error);
      res.status(500).json({ error: 'Failed to get Redis memory usage' });
    }
  }

  /**
   * Set hash field
   */
  async setHashField(req: Request, res: Response) {
    try {
      const { key, field } = req.params;
      const { value } = req.body;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      if (!field) {
        return res.status(400).json({ error: 'Field is required' });
      }

      if (value === undefined) {
        return res.status(400).json({ error: 'Value is required' });
      }

      const result = await RedisAdminService.setHashField(key, field, value);
      res.json(result);
    } catch (error) {
      console.error('❌ Error setting Redis hash field:', error);
      res.status(500).json({ error: 'Failed to set Redis hash field' });
    }
  }

  /**
   * Get hash field
   */
  async getHashField(req: Request, res: Response) {
    try {
      const { key, field } = req.params;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      if (!field) {
        return res.status(400).json({ error: 'Field is required' });
      }

      const result = await RedisAdminService.getHashField(key, field);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting Redis hash field:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get Redis hash field' });
    }
  }

  /**
   * Get all hash fields
   */
  async getHashFields(req: Request, res: Response) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      const result = await RedisAdminService.getHashFields(key);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting Redis hash fields:', error);
      res.status(500).json({ error: 'Failed to get Redis hash fields' });
    }
  }

  /**
   * Delete hash field
   */
  async deleteHashField(req: Request, res: Response) {
    try {
      const { key, field } = req.params;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      if (!field) {
        return res.status(400).json({ error: 'Field is required' });
      }

      const result = await RedisAdminService.deleteHashField(key, field);
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting Redis hash field:', error);
      res.status(500).json({ error: 'Failed to delete Redis hash field' });
    }
  }

  /**
   * Set multiple hash fields
   */
  async setHashFields(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const data: HashData = req.body;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'Hash data is required' });
      }

      const result = await RedisAdminService.setHashFields(key, data);
      res.json(result);
    } catch (error) {
      console.error('❌ Error setting Redis hash fields:', error);
      res.status(500).json({ error: 'Failed to set Redis hash fields' });
    }
  }

  /**
   * Push to list
   */
  async pushToList(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const { value, direction = 'right' } = req.body;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      if (value === undefined) {
        return res.status(400).json({ error: 'Value is required' });
      }

      const result = await RedisAdminService.pushToList(key, value, direction);
      res.json(result);
    } catch (error) {
      console.error('❌ Error pushing to Redis list:', error);
      res.status(500).json({ error: 'Failed to push to Redis list' });
    }
  }

  /**
   * Pop from list
   */
  async popFromList(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const { direction = 'right' } = req.query;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      const result = await RedisAdminService.popFromList(
        key,
        direction as 'left' | 'right'
      );
      res.json(result);
    } catch (error) {
      console.error('❌ Error popping from Redis list:', error);
      if (error instanceof Error && error.message.includes('empty')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to pop from Redis list' });
    }
  }

  /**
   * Get list range
   */
  async getListRange(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const { start = 0, stop = -1 } = req.query;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      const result = await RedisAdminService.getListRange(
        key,
        parseInt(start as string),
        parseInt(stop as string)
      );
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting Redis list range:', error);
      res.status(500).json({ error: 'Failed to get Redis list range' });
    }
  }

  /**
   * Get list length
   */
  async getListLength(req: Request, res: Response) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      const result = await RedisAdminService.getListLength(key);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting Redis list length:', error);
      res.status(500).json({ error: 'Failed to get Redis list length' });
    }
  }
}

export default new RedisController();
