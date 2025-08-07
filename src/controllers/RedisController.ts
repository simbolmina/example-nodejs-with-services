import { Request, Response } from 'express';
import {
  getHealth as getHealthService,
  getConnectionStatus as getConnectionStatusService,
  setKey as setKeyService,
  getKey as getKeyService,
  deleteKey as deleteKeyService,
  keyExists as keyExistsService,
  getKeyTTL as getKeyTTLService,
  setKeyExpiry as setKeyExpiryService,
  getKeys as getKeysService,
  getInfo as getInfoService,
  getMemoryUsage as getMemoryUsageService,
  setHashField as setHashFieldService,
  getHashField as getHashFieldService,
  getHashFields as getHashFieldsService,
  deleteHashField as deleteHashFieldService,
  setHashFields as setHashFieldsService,
  pushToList as pushToListService,
  popFromList as popFromListService,
  getListRange as getListRangeService,
  getListLength as getListLengthService,
  SetDataOptions,
  HashData,
} from '../services/RedisService.js';

/**
 * Get Redis health status
 */
export const getHealth = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const health = await getHealthService();
    return res.json(health);
  } catch (error) {
    console.error('❌ Error checking Redis health:', error);
    return res.status(500).json({ error: 'Failed to check Redis health' });
  }
};

/**
 * Get connection status
 */
export const getConnectionStatus = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const status = await getConnectionStatusService();
    return res.json(status);
  } catch (error) {
    console.error('❌ Error checking Redis connection:', error);
    return res.status(500).json({ error: 'Failed to check Redis connection' });
  }
};

/**
 * Set a key-value pair
 */
export const setKey = async (
  req: Request,
  res: Response
): Promise<Response> => {
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
    const result = await setKeyService(key, value, options);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error setting Redis key:', error);
    return res.status(500).json({ error: 'Failed to set Redis key' });
  }
};

/**
 * Get a value by key
 */
export const getKey = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const result = await getKeyService(key);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error getting Redis key:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to get Redis key' });
  }
};

/**
 * Delete a key
 */
export const deleteKey = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const result = await deleteKeyService(key);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error deleting Redis key:', error);
    return res.status(500).json({ error: 'Failed to delete Redis key' });
  }
};

/**
 * Check if a key exists
 */
export const keyExists = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const exists = await keyExistsService(key);
    return res.json({ key, exists });
  } catch (error) {
    console.error('❌ Error checking Redis key existence:', error);
    return res.status(500).json({ error: 'Failed to check key existence' });
  }
};

/**
 * Get TTL for a key
 */
export const getKeyTTL = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const ttl = await getKeyTTLService(key);
    return res.json({ key, ttl });
  } catch (error) {
    console.error('❌ Error getting Redis key TTL:', error);
    return res.status(500).json({ error: 'Failed to get key TTL' });
  }
};

/**
 * Set expiry for a key
 */
export const setKeyExpiry = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key } = req.params;
    const { ttl } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    if (ttl === undefined || ttl < 0) {
      return res.status(400).json({ error: 'Valid TTL is required' });
    }

    const result = await setKeyExpiryService(key, ttl);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error setting Redis key expiry:', error);
    return res.status(500).json({ error: 'Failed to set key expiry' });
  }
};

/**
 * Get keys matching a pattern
 */
export const getKeys = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { pattern = '*' } = req.query;

    const keys = await getKeysService(pattern as string);
    return res.json({
      pattern,
      keys,
      count: Array.isArray(keys) ? keys.length : 0,
    });
  } catch (error) {
    console.error('❌ Error getting Redis keys:', error);
    return res.status(500).json({ error: 'Failed to get keys' });
  }
};

/**
 * Get Redis server info
 */
export const getInfo = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const info = await getInfoService();
    return res.json(info);
  } catch (error) {
    console.error('❌ Error getting Redis info:', error);
    return res.status(500).json({ error: 'Failed to get Redis info' });
  }
};

/**
 * Get memory usage statistics
 */
export const getMemoryUsage = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const memory = await getMemoryUsageService();
    return res.json(memory);
  } catch (error) {
    console.error('❌ Error getting Redis memory usage:', error);
    return res.status(500).json({ error: 'Failed to get memory usage' });
  }
};

/**
 * Set a hash field
 */
export const setHashField = async (
  req: Request,
  res: Response
): Promise<Response> => {
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

    const result = await setHashFieldService(key, field, value);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error setting Redis hash field:', error);
    return res.status(500).json({ error: 'Failed to set hash field' });
  }
};

/**
 * Get a hash field
 */
export const getHashField = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key, field } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    if (!field) {
      return res.status(400).json({ error: 'Field is required' });
    }

    const value = await getHashFieldService(key, field);
    return res.json({ key, field, value });
  } catch (error) {
    console.error('❌ Error getting Redis hash field:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to get hash field' });
  }
};

/**
 * Get all hash fields
 */
export const getHashFields = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const fields = await getHashFieldsService(key);
    return res.json({ key, fields });
  } catch (error) {
    console.error('❌ Error getting Redis hash fields:', error);
    return res.status(500).json({ error: 'Failed to get hash fields' });
  }
};

/**
 * Delete a hash field
 */
export const deleteHashField = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key, field } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    if (!field) {
      return res.status(400).json({ error: 'Field is required' });
    }

    const result = await deleteHashFieldService(key, field);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error deleting Redis hash field:', error);
    return res.status(500).json({ error: 'Failed to delete hash field' });
  }
};

/**
 * Set multiple hash fields
 */
export const setHashFields = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key } = req.params;
    const { fields } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    if (!fields || typeof fields !== 'object') {
      return res.status(400).json({ error: 'Fields object is required' });
    }

    const result = await setHashFieldsService(key, fields as HashData);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error setting Redis hash fields:', error);
    return res.status(500).json({ error: 'Failed to set hash fields' });
  }
};

/**
 * Push to a list
 */
export const pushToList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key } = req.params;
    const { value, direction = 'right' } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const result = await pushToListService(key, value, direction);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error pushing to Redis list:', error);
    return res.status(500).json({ error: 'Failed to push to list' });
  }
};

/**
 * Pop from a list
 */
export const popFromList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key } = req.params;
    const { direction = 'left' } = req.query;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const result = await popFromListService(key, direction as 'left' | 'right');
    return res.json(result);
  } catch (error) {
    console.error('❌ Error popping from Redis list:', error);
    if (error instanceof Error && error.message.includes('empty')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to pop from list' });
  }
};

/**
 * Get list range
 */
export const getListRange = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key } = req.params;
    const { start = 0, stop = -1 } = req.query;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const range = await getListRangeService(
      key,
      parseInt(start as string),
      parseInt(stop as string)
    );
    return res.json({ key, range });
  } catch (error) {
    console.error('❌ Error getting Redis list range:', error);
    return res.status(500).json({ error: 'Failed to get list range' });
  }
};

/**
 * Get list length
 */
export const getListLength = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const length = await getListLengthService(key);
    return res.json({ key, length });
  } catch (error) {
    console.error('❌ Error getting Redis list length:', error);
    return res.status(500).json({ error: 'Failed to get list length' });
  }
};
