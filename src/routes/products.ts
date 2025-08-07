import express from 'express';
import ProductController from '../controllers/ProductController.js';
import {
  cacheMiddleware,
  invalidateCache,
  rateLimitRedis,
} from '../middleware/cache.js';

const router = express.Router();

// Rate limiting for product endpoints
const productRateLimit = rateLimitRedis({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => `ratelimit:products:${req.ip}`,
});

// Apply rate limiting to all product routes
router.use(productRateLimit);

// Get all products (cached for 2 minutes)
router.get('/', cacheMiddleware({ ttl: 120 }), ProductController.getProducts);

// Get product by ID (cached for 5 minutes)
router.get(
  '/:id',
  cacheMiddleware({ ttl: 300 }),
  ProductController.getProductById
);

// Create product (invalidates product cache)
router.post(
  '/',
  invalidateCache('cache:/api/v1/products*'),
  ProductController.createProduct
);

// Update product (invalidates product cache)
router.put(
  '/:id',
  invalidateCache('cache:/api/v1/products*'),
  ProductController.updateProduct
);

// Delete product (invalidates product cache)
router.delete(
  '/:id',
  invalidateCache('cache:/api/v1/products*'),
  ProductController.deleteProduct
);

// Search products (cached for 1 minute due to dynamic nature)
router.get(
  '/search',
  cacheMiddleware({ ttl: 60 }),
  ProductController.searchProducts
);

// Get product details from Elasticsearch (cached for 3 minutes)
router.get(
  '/:id/details',
  cacheMiddleware({ ttl: 180 }),
  ProductController.getProductDetails
);

export default router;
