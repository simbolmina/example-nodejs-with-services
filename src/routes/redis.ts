import { Router, Request, Response } from 'express';
import redisService from '../lib/redis.js';

const router = Router();

// Redis health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    if (!redisService.isRedisConnected()) {
      return res.status(503).json({
        status: 'disconnected',
        message: 'Redis is not connected',
      });
    }

    const ping = await redisService.ping();
    res.json({
      status: 'connected',
      ping: ping,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Redis info
router.get('/info', async (req: Request, res: Response) => {
  try {
    if (!redisService.isRedisConnected()) {
      return res.status(503).json({
        error: 'Redis is not connected',
      });
    }

    const info = await redisService.info();
    res.json({
      info: info,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Set a key-value pair
router.post('/set', async (req: Request, res: Response) => {
  try {
    const { key, value, ttl } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        error: 'Key and value are required',
      });
    }

    await redisService.set(key, value.toString(), ttl);

    res.json({
      message: 'Value set successfully',
      key: key,
      value: value,
      ttl: ttl || 'no expiration',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get a value by key
router.get('/get/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        error: 'Key parameter is required',
      });
    }

    const value = await redisService.get(key);

    if (value === null) {
      return res.status(404).json({
        error: 'Key not found',
        key: key,
      });
    }

    res.json({
      key: key,
      value: value,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete a key
router.delete('/del/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        error: 'Key parameter is required',
      });
    }

    const deleted = await redisService.del(key);

    res.json({
      message: deleted > 0 ? 'Key deleted successfully' : 'Key not found',
      key: key,
      deleted: deleted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Check if key exists
router.get('/exists/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        error: 'Key parameter is required',
      });
    }

    const exists = await redisService.exists(key);

    res.json({
      key: key,
      exists: exists > 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Hash operations
router.post('/hset', async (req: Request, res: Response) => {
  try {
    const { key, field, value } = req.body;

    if (!key || !field || value === undefined) {
      return res.status(400).json({
        error: 'Key, field, and value are required',
      });
    }

    const result = await redisService.hset(key, field, value.toString());

    res.json({
      message: 'Hash field set successfully',
      key: key,
      field: field,
      value: value,
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/hget/:key/:field', async (req: Request, res: Response) => {
  try {
    const { key, field } = req.params;

    if (!key || !field) {
      return res.status(400).json({
        error: 'Key and field parameters are required',
      });
    }

    const value = await redisService.hget(key, field);

    if (value === null) {
      return res.status(404).json({
        error: 'Hash field not found',
        key: key,
        field: field,
      });
    }

    res.json({
      key: key,
      field: field,
      value: value,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/hgetall/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        error: 'Key parameter is required',
      });
    }

    const hash = await redisService.hgetall(key);

    res.json({
      key: key,
      hash: hash,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// List operations
router.post('/lpush', async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        error: 'Key and value are required',
      });
    }

    const result = await redisService.lpush(key, value.toString());

    res.json({
      message: 'Value pushed to list',
      key: key,
      value: value,
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/rpush', async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        error: 'Key and value are required',
      });
    }

    const result = await redisService.rpush(key, value.toString());

    res.json({
      message: 'Value pushed to list',
      key: key,
      value: value,
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Set operations
router.post('/sadd', async (req: Request, res: Response) => {
  try {
    const { key, member } = req.body;

    if (!key || member === undefined) {
      return res.status(400).json({
        error: 'Key and member are required',
      });
    }

    const result = await redisService.sadd(key, member.toString());

    res.json({
      message: 'Member added to set',
      key: key,
      member: member,
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/smembers/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        error: 'Key parameter is required',
      });
    }

    const members = await redisService.smembers(key);

    res.json({
      key: key,
      members: members,
      count: members.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Clear database (dangerous operation)
router.post('/flushdb', async (req: Request, res: Response) => {
  try {
    const result = await redisService.flushdb();

    res.json({
      message: 'Database flushed successfully',
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
