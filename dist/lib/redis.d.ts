import { RedisClientType } from 'redis';
declare class RedisService {
    private client;
    private isConnected;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getClient(): RedisClientType | null;
    isRedisConnected(): boolean;
    set(key: string, value: string, ttl?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<number>;
    exists(key: string): Promise<number>;
    hset(key: string, field: string, value: string): Promise<number>;
    hget(key: string, field: string): Promise<string | null>;
    hgetall(key: string): Promise<Record<string, string>>;
    lpush(key: string, value: string): Promise<number>;
    rpush(key: string, value: string): Promise<number>;
    lpop(key: string): Promise<string | null>;
    rpop(key: string): Promise<string | null>;
    sadd(key: string, member: string): Promise<number>;
    srem(key: string, member: string): Promise<number>;
    smembers(key: string): Promise<string[]>;
    ping(): Promise<string>;
    flushdb(): Promise<string>;
    info(): Promise<string>;
}
declare const redisService: RedisService;
export default redisService;
//# sourceMappingURL=redis.d.ts.map