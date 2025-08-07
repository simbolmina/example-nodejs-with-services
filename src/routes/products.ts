import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import elasticsearchService from '../lib/elasticsearch.js';
import kafkaService from '../lib/kafka.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to index product in Elasticsearch
async function indexProductInElasticsearch(product: any) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: product.categoryId },
    });

    const document = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      categoryId: product.categoryId,
      categoryName: category?.name || 'Unknown',
      inventoryCount: product.inventoryCount,
      sku: product.sku,
      weight: product.weight,
      dimensions: product.dimensions,
      images: product.images || [],
      tags: product.tags || [],
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    await elasticsearchService.indexDocument('products', document, product.id);
    console.log(`✅ Indexed product ${product.name} in Elasticsearch`);
  } catch (error) {
    console.error('❌ Error indexing product in Elasticsearch:', error);
  }
}

// Helper function to remove product from Elasticsearch
async function removeProductFromElasticsearch(productId: string) {
  try {
    await elasticsearchService.deleteDocument('products', productId);
    console.log(`✅ Removed product ${productId} from Elasticsearch`);
  } catch (error) {
    console.error('❌ Error removing product from Elasticsearch:', error);
  }
}

// Get all products with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const categoryId = req.query.categoryId as string;
    const offset = (page - 1) * limit;

    const where: any = { isActive: true };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Search products using Elasticsearch
router.get('/search', async (req: Request, res: Response) => {
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

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build search query
    const query: any = {
      bool: {
        must: [
          {
            multi_match: {
              query: q as string,
              fields: ['name^2', 'description', 'tags'],
              fuzziness: 'AUTO',
              minimum_should_match: '75%',
            },
          },
        ],
        filter: [],
      },
    };

    // Add filters
    if (category) {
      query.bool.filter.push({
        term: { categoryName: category },
      });
    }

    if (minPrice || maxPrice) {
      const range: any = {};
      if (minPrice) range.gte = parseFloat(minPrice as string);
      if (maxPrice) range.lte = parseFloat(maxPrice as string);
      query.bool.filter.push({ range: { price: range } });
    }

    if (inStock !== undefined) {
      if (inStock === 'true') {
        query.bool.filter.push({ range: { inventoryCount: { gt: 0 } } });
      } else {
        query.bool.filter.push({ term: { inventoryCount: 0 } });
      }
    }

    // Build search options
    const searchOptions: any = {
      query,
      size: parseInt(limit as string),
      from: offset,
      sort: [{ [sortBy as string]: sortOrder }],
      aggs: {
        categories: {
          terms: { field: 'categoryName' },
        },
        inventory_status: {
          terms: { field: 'inventoryCount' },
        },
      },
    };

    const result = await elasticsearchService.search(
      'products',
      query,
      searchOptions
    );

    // Format results
    const products = result.hits.hits.map((hit: any) => ({
      ...hit._source,
      score: hit._score,
    }));

    // Publish search analytics event
    try {
      await kafkaService.publishSearchAnalytics(q as string, products, {
        category,
        minPrice,
        maxPrice,
        inStock,
      });
    } catch (error) {
      console.error('❌ Error publishing search analytics:', error);
    }

    res.json({
      products,
      total: result.hits.total.value,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      aggregations: result.aggregations,
    });
  } catch (error) {
    console.error('❌ Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Publish product viewed event
    try {
      await kafkaService.publishProductViewed(id, {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });
    } catch (error) {
      console.error('❌ Error publishing product viewed event:', error);
    }

    res.json(product);
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product
router.post('/', async (req: Request, res: Response) => {
  try {
    const productData = req.body;

    const product = await prisma.product.create({
      data: productData,
      include: {
        category: true,
      },
    });

    // Index in Elasticsearch
    await indexProductInElasticsearch(product);

    // Publish product created event
    try {
      await kafkaService.publishProductCreated(product);

      // Check for low stock alert
      await kafkaService.publishLowStockAlert(product);
    } catch (error) {
      console.error('❌ Error publishing product created event:', error);
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Get the original product to track changes
    const originalProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!originalProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    // Re-index in Elasticsearch
    await indexProductInElasticsearch(product);

    // Publish product updated event with changes
    try {
      const changes = Object.keys(updateData).reduce((acc: any, key) => {
        if (
          originalProduct[key as keyof typeof originalProduct] !==
          product[key as keyof typeof product]
        ) {
          acc[key] = {
            from: originalProduct[key as keyof typeof originalProduct],
            to: product[key as keyof typeof product],
          };
        }
        return acc;
      }, {});

      await kafkaService.publishProductUpdated(product, changes);

      // Check for low stock alert
      await kafkaService.publishLowStockAlert(product);
    } catch (error) {
      console.error('❌ Error publishing product updated event:', error);
    }

    res.json(product);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    // Remove from Elasticsearch
    await removeProductFromElasticsearch(id);

    // Publish product deleted event
    try {
      await kafkaService.publishProductDeleted(id);
    } catch (error) {
      console.error('❌ Error publishing product deleted event:', error);
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get product details from Elasticsearch
router.get('/:id/details', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await elasticsearchService.getDocument('products', id);

    if (!product || !product._source) {
      return res
        .status(404)
        .json({ error: 'Product not found in Elasticsearch' });
    }

    res.json({
      product: product._source,
    });
  } catch (error) {
    console.error(
      '❌ Error fetching product details from Elasticsearch:',
      error
    );
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

export default router;
