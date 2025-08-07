import { Request, Response } from 'express';
import {
  getProducts as getProductsService,
  getProductById as getProductByIdService,
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  searchProducts as searchProductsService,
  getProductDetails as getProductDetailsService,
  trackProductView as trackProductViewService,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  SearchFilters,
} from '../services/ProductService.js';

/**
 * Get all products with pagination and filtering
 */
export const getProducts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const filters: ProductFilters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      categoryId: req.query.categoryId as string,
    };

    const result = await getProductsService(filters);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await getProductByIdService(id);

    // Track product view
    await trackProductViewService(id, {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
    });

    return res.json(product);
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    if (error instanceof Error && error.message === 'Product not found') {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
};

/**
 * Create a new product
 */
export const createProduct = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const productData: CreateProductData = req.body;

    const product = await createProductService(productData);
    return res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
};

/**
 * Update a product
 */
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData: UpdateProductData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await updateProductService(id, updateData);
    return res.json(product);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    if (error instanceof Error && error.message === 'Product not found') {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(500).json({ error: 'Failed to update product' });
  }
};

/**
 * Delete a product (soft delete)
 */
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const result = await deleteProductService(id);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    if (error instanceof Error && error.message === 'Product not found') {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(500).json({ error: 'Failed to delete product' });
  }
};

/**
 * Search products using Elasticsearch
 */
export const searchProducts = async (
  req: Request,
  res: Response
): Promise<Response> => {
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
    } as SearchFilters;

    const result = await searchProductsService(filters);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error searching products:', error);
    return res.status(500).json({ error: 'Failed to search products' });
  }
};

/**
 * Get product details from Elasticsearch
 */
export const getProductDetails = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const result = await getProductDetailsService(id);
    return res.json(result);
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
    return res.status(500).json({ error: 'Failed to fetch product details' });
  }
};
