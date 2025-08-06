import { createClient } from 'redis';
class RedisService {
    client = null;
    isConnected = false;
    async connect() {
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
        }
        catch (error) {
            console.error('Failed to connect to Redis:', error);
            this.isConnected = false;
            throw error;
        }
    }
    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
    getClient() {
        return this.client;
    }
    isRedisConnected() {
        return this.isConnected;
    }
    // Cache operations
    async set(key, value, ttl) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        if (ttl) {
            await this.client.setEx(key, ttl, value);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async get(key) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.get(key);
    }
    async del(key) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.del(key);
    }
    async exists(key) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.exists(key);
    }
    // Hash operations
    async hset(key, field, value) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.hSet(key, field, value);
    }
    async hget(key, field) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.hGet(key, field);
    }
    async hgetall(key) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.hGetAll(key);
    }
    // List operations
    async lpush(key, value) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.lPush(key, value);
    }
    async rpush(key, value) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.rPush(key, value);
    }
    async lpop(key) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.lPop(key);
    }
    async rpop(key) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.rPop(key);
    }
    // Set operations
    async sadd(key, member) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.sAdd(key, member);
    }
    async srem(key, member) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.sRem(key, member);
    }
    async smembers(key) {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.sMembers(key);
    }
    // Utility methods
    async ping() {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.ping();
    }
    async flushdb() {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.flushDb();
    }
    async info() {
        if (!this.client) {
            throw new Error('Redis client not connected');
        }
        return await this.client.info();
    }
}
// Create singleton instance
const redisService = new RedisService();
export default redisService;
//# sourceMappingURL=redis.js.map