import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryHierarchy,
} from '../controllers/CategoryController.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// Get all categories (cached for 10 minutes since categories rarely change)
router.get('/', cacheMiddleware({ ttl: 600 }), getCategories);

// Get category by ID (cached for 10 minutes)
router.get('/:id', cacheMiddleware({ ttl: 600 }), getCategoryById);

// Get category hierarchy (cached for 10 minutes)
router.get('/hierarchy', cacheMiddleware({ ttl: 600 }), getCategoryHierarchy);

// Create category (invalidates category cache)
router.post('/', invalidateCache('cache:/api/v1/categories*'), createCategory);

// Update category (invalidates category cache)
router.put(
  '/:id',
  invalidateCache('cache:/api/v1/categories*'),
  updateCategory
);

// Delete category (invalidates category cache)
router.delete(
  '/:id',
  invalidateCache('cache:/api/v1/categories*'),
  deleteCategory
);

export default router;
