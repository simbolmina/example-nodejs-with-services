import express from 'express';
import CategoryController from '../controllers/CategoryController.js';

const router = express.Router();

// Get all categories
router.get('/', CategoryController.getCategories);

// Get category hierarchy
router.get('/hierarchy', CategoryController.getCategoryHierarchy);

// Get category by ID
router.get('/:id', CategoryController.getCategoryById);

// Create new category
router.post('/', CategoryController.createCategory);

// Update category
router.put('/:id', CategoryController.updateCategory);

// Delete category
router.delete('/:id', CategoryController.deleteCategory);

export default router;
