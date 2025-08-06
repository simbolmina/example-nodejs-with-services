import { Request, Response, NextFunction } from 'express';
interface CacheOptions {
    ttl?: number;
    key?: string;
}
export declare const cacheMiddleware: (options?: CacheOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const invalidateCache: (pattern: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const rateLimitRedis: (options: {
    windowMs: number;
    max: number;
    keyGenerator?: (req: Request) => string;
}) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=cache.d.ts.map