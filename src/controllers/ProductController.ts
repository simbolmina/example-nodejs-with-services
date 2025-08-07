import { Request, Response } from 'express';
import ProductService, {
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  SearchFilters,
} from '../services/ProductService.js';

class ProductController {
  /**
   * Get all products with pagination and filtering
   */
  async getProducts(req: Request, res: Response) {
    try {
      const filters: ProductFilters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        categoryId: req.query.categoryId as string,
      };

      const result = await ProductService.getProducts(filters);
      res.json(result);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const product = await ProductService.getProductById(id);

      // Track product view
      await ProductService.trackProductView(id, {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });

      res.json(product);
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  }

  /**
   * Create a new product
   */
  async createProduct(req: Request, res: Response) {
    try {
      const productData: CreateProductData = req.body;

      const product = await ProductService.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('❌ Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }

  /**
   * Update a product
   */
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateProductData = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const product = await ProductService.updateProduct(id, updateData);
      res.json(product);
    } catch (error) {
      console.error('❌ Error updating product:', error);
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(500).json({ error: 'Failed to update product' });
    }
  }

  /**
   * Delete a product (soft delete)
   */
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const result = await ProductService.deleteProduct(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  /**
   * Search products using Elasticsearch
   */
  async searchProducts(req: Request, res: Response) {
    try {
      const {
        q,
        category,
        minPrice,
        maxPrice,
        inStock,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10,
      } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const filters: SearchFilters = {
        q: q as string,
        category: category as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        inStock: inStock !== undefined ? inStock === 'true' : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await ProductService.searchProducts(filters);
      res.json(result);
    } catch (error) {
      console.error('❌ Error searching products:', error);
      res.status(500).json({ error: 'Failed to search products' });
    }
  }

  /**
   * Get product details from Elasticsearch
   */
  async getProductDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const result = await ProductService.getProductDetails(id);
      res.json(result);
    } catch (error) {
      console.error(
        '❌ Error fetching product details from Elasticsearch:',
        error
      );
      if (
        error instanceof Error &&
        error.message === 'Product not found in Elasticsearch'
      ) {
        return res
          .status(404)
          .json({ error: 'Product not found in Elasticsearch' });
      }
      res.status(500).json({ error: 'Failed to fetch product details' });
    }
  }
}

export default new ProductController();
