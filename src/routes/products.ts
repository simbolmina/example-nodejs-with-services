import express from 'express';
import ProductController from '../controllers/ProductController.js';

const router = express.Router();

// Get all products with pagination
router.get('/', ProductController.getProducts);

// Search products using Elasticsearch
router.get('/search', ProductController.searchProducts);

// Get product by ID
router.get('/:id', ProductController.getProductById);

// Create new product
router.post('/', ProductController.createProduct);

// Update product
router.put('/:id', ProductController.updateProduct);

// Delete product (soft delete)
router.delete('/:id', ProductController.deleteProduct);

// Get product details from Elasticsearch
router.get('/:id/details', ProductController.getProductDetails);

export default router;
