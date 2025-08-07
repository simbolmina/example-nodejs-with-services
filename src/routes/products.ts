import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import elasticsearchService from '../lib/elasticsearch.js';

const router = express.Router();

// Helper function to index product in Elasticsearch
async function indexProductInElasticsearch(product: any) {
  try {
    const productDoc = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      inventoryCount: product.inventoryCount,
      sku: product.sku,
      weight: product.weight,
      dimensions: product.dimensions,
      images: product.images,
      tags: product.tags,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    await elasticsearchService.indexDocument(
      'products',
      productDoc,
      product.id
    );
    console.log(`✅ Product ${product.id} indexed in Elasticsearch`);
  } catch (error) {
    console.error(
      `❌ Failed to index product ${product.id} in Elasticsearch:`,
      error
    );
  }
}

// Helper function to remove product from Elasticsearch
async function removeProductFromElasticsearch(productId: string) {
  try {
    await elasticsearchService.deleteDocument('products', productId);
    console.log(`✅ Product ${productId} removed from Elasticsearch`);
  } catch (error) {
    console.error(
      `❌ Failed to remove product ${productId} from Elasticsearch:`,
      error
    );
  }
}

// Get all products with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        include: {
          category: true,
        },
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
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
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Build Elasticsearch query
    const query: any = {
      bool: {
        should: [
          {
            multi_match: {
              query: q,
              fields: ['name^3', 'description^2', 'tags', 'categoryName'],
              fuzziness: 'AUTO',
              type: 'best_fields',
            },
          },
          {
            wildcard: {
              name: { value: `*${q}*` },
            },
          },
          {
            wildcard: {
              description: { value: `*${q}*` },
            },
          },
        ],
        must: [{ term: { isActive: true } }],
        filter: [],
        minimum_should_match: 1,
      },
    };

    // Add filters
    if (category) {
      query.bool.filter.push({ term: { categoryId: category } });
    }

    if (minPrice || maxPrice) {
      const range: any = { price: {} };
      if (minPrice) range.price.gte = parseFloat(minPrice as string);
      if (maxPrice) range.price.lte = parseFloat(maxPrice as string);
      query.bool.filter.push({ range });
    }

    if (inStock === 'true') {
      query.bool.filter.push({ range: { inventoryCount: { gt: 0 } } });
    }

    // Build search options
    const searchOptions: any = {
      size: parseInt(limit as string),
      from: (parseInt(page as string) - 1) * parseInt(limit as string),
    };

    // Add sorting
    if (sort) {
      const [field, order] = (sort as string).split(':');
      searchOptions.sort = [{ [field as string]: order || 'desc' }];
    } else {
      searchOptions.sort = [{ _score: 'desc' }];
    }

    // Add aggregations
    searchOptions.aggs = {
      categories: {
        terms: { field: 'categoryName.keyword' },
      },
      inventory_status: {
        terms: { field: 'inventoryCount' },
      },
    };

    const result = await elasticsearchService.search(
      'products',
      query,
      searchOptions
    );

    // Transform results
    const products = result.hits.hits.map((hit: any) => ({
      ...hit._source,
      score: hit._score,
    }));

    return res.json({
      products,
      total: result.hits.total.value,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      aggregations: result.aggregations,
    });
  } catch (error) {
    console.error('Error searching products:', error);
    return res.status(500).json({
      error: 'Failed to search products',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get product suggestions (autocomplete)
router.get('/suggest', async (req: Request, res: Response) => {
  try {
    const { q, size = 5 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const query = {
      suggest: {
        suggestions: {
          prefix: q,
          completion: {
            field: 'name_suggest',
            size: parseInt(size as string),
            skip_duplicates: true,
          },
        },
      },
    };

    const result = await elasticsearchService.search('products', query);

    return res.json({
      suggestions: result.suggest?.suggestions?.[0]?.options || [],
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return res.status(500).json({
      error: 'Failed to get suggestions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get product by ID from Elasticsearch (with full details)
router.get('/:id/details', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await elasticsearchService.getDocument('products', id);

    if (!product || !product._source) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ product: product._source });
  } catch (error) {
    console.error('Error getting product details:', error);
    return res.status(500).json({
      error: 'Failed to get product details',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
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
        priceHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({
      error: 'Failed to fetch product',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create new product
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      inventoryCount,
      sku,
      weight,
      dimensions,
      images,
      tags,
    } = req.body;

    // Validate required fields
    if (!name || !price || !categoryId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'price', 'categoryId'],
      });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        inventoryCount: inventoryCount || 0,
        sku,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        images: images || [],
        tags: tags || [],
      },
      include: {
        category: true,
      },
    });

    // Index product in Elasticsearch
    await indexProductInElasticsearch(product);

    return res.status(201).json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      error: 'Failed to create product',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
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

    // Convert numeric fields
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.weight) {
      updateData.weight = parseFloat(updateData.weight);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    // Update product in Elasticsearch
    await indexProductInElasticsearch(product);

    return res.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      error: 'Failed to update product',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete product (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    // Remove product from Elasticsearch (or mark as inactive)
    await removeProductFromElasticsearch(id);

    return res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      error: 'Failed to delete product',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
