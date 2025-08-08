import { PrismaClient } from '@prisma/client';
import elasticsearchService from '../lib/elasticsearch.js';
import kafkaService from '../lib/kafka.js';

export interface CreateProductData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  inventoryCount: number;
  sku: string;
  weight?: number;
  dimensions?: string;
  images?: string[];
  tags?: string[];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: string;
  categoryId?: string;
  inventoryCount?: number;
  sku?: string;
  weight?: number;
  dimensions?: string;
  images?: string[];
  tags?: string[];
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
}

export interface SearchFilters {
  q: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

const prisma = new PrismaClient();

/**
 * Get all products with pagination and filtering
 */
export const getProducts = async (filters: ProductFilters = {}) => {
  const { page = 1, limit = 10, categoryId } = filters;
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

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages,
    },
  };
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
};

/**
 * Create a new product
 */
export const createProduct = async (data: CreateProductData) => {
  const product = await prisma.product.create({
    data,
    include: {
      category: true,
    },
  });

  // Index product in Elasticsearch
  await indexProductInElasticsearch(product);

  // Publish product created event
  await publishProductEvents(product, 'created');

  return product;
};

/**
 * Update a product
 */
export const updateProduct = async (id: string, data: UpdateProductData) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new Error('Product not found');
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
    },
  });

  // Update product in Elasticsearch
  await indexProductInElasticsearch(product);

  // Get changes for event
  const changes = getProductChanges(existingProduct, product);

  // Publish product updated event
  await publishProductEvents(product, 'updated', changes);

  return product;
};

/**
 * Delete a product (soft delete)
 */
export const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  // Remove product from Elasticsearch
  await removeProductFromElasticsearch(id);

  // Publish product deleted event
  await publishProductEvents(product, 'deleted');

  return { message: 'Product deleted successfully' };
};

/**
 * Search products using Elasticsearch
 */
export const searchProducts = async (filters: SearchFilters) => {
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
  } = filters;

  const searchQuery: any = {
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: q,
              fields: ['name^2', 'description', 'sku', 'tags'],
              fuzziness: 'AUTO',
            },
          },
        ],
        filter: [] as any[],
      },
    },
    sort: [{ [sortBy]: { order: sortOrder } }],
    from: (page - 1) * limit,
    size: limit,
  };

  // Add filters
  if (category) {
    searchQuery.query.bool.filter.push({
      term: { 'category.name': category },
    });
  }

  if (minPrice !== undefined) {
    searchQuery.query.bool.filter.push({
      range: { price: { gte: minPrice } },
    });
  }

  if (maxPrice !== undefined) {
    searchQuery.query.bool.filter.push({
      range: { price: { lte: maxPrice } },
    });
  }

  if (inStock !== undefined) {
    searchQuery.query.bool.filter.push({
      term: { inStock: inStock },
    });
  }

  const result = await elasticsearchService.search('products', searchQuery);

  // Publish search analytics
  await publishSearchAnalytics(q, result.hits.hits, filters);

  return {
    products: result.hits.hits.map((hit: any) => ({
      ...hit._source,
      score: hit._score,
    })),
    total: result.hits.total.value,
    pagination: {
      page,
      limit,
      total: result.hits.total.value,
      pages: Math.ceil(result.hits.total.value / limit),
    },
  };
};

/**
 * Get product details from Elasticsearch
 */
export const getProductDetails = async (id: string) => {
  const result = await elasticsearchService.getDocument('products', id);

  if (!result.found) {
    throw new Error('Product not found in Elasticsearch');
  }

  return {
    ...result._source,
    score: result._score,
  };
};

/**
 * Track product view
 */
export const trackProductView = async (id: string, metadata?: any) => {
  // In a real application, you might want to track this in a separate service
  // For now, we'll just log it
  console.log(`Product view tracked: ${id}`, metadata);
};

/**
 * Index product in Elasticsearch
 */
const indexProductInElasticsearch = async (product: any) => {
  try {
    const document = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      sku: product.sku,
      category: {
        id: product.category.id,
        name: product.category.name,
      },
      inventoryCount: product.inventoryCount,
      inStock: product.inventoryCount > 0,
      weight: product.weight,
      dimensions: product.dimensions,
      images: product.images,
      tags: product.tags,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    await elasticsearchService.indexDocument('products', {
      id: product.id,
      document,
    });
  } catch (error) {
    console.error('❌ Error indexing product in Elasticsearch:', error);
  }
};

/**
 * Remove product from Elasticsearch
 */
const removeProductFromElasticsearch = async (productId: string) => {
  try {
    await elasticsearchService.deleteDocument('products', productId);
  } catch (error) {
    console.error('❌ Error removing product from Elasticsearch:', error);
  }
};

/**
 * Publish product events to Kafka
 */
const publishProductEvents = async (
  product: any,
  eventType: 'created' | 'updated' | 'deleted',
  changes?: any
) => {
  try {
    const eventData = {
      product,
      changes,
      timestamp: new Date().toISOString(),
    };

    switch (eventType) {
      case 'created':
        await kafkaService.publishProductCreated(eventData);
        break;
      case 'updated':
        await kafkaService.publishProductUpdated(eventData, changes);
        break;
      case 'deleted':
        await kafkaService.publishProductDeleted(product.id);
        break;
    }
  } catch (error) {
    console.error(`❌ Error publishing product ${eventType} event:`, error);
  }
};

/**
 * Publish search analytics to Kafka
 */
const publishSearchAnalytics = async (
  query: string,
  results: any[],
  filters: any = {}
) => {
  try {
    await kafkaService.publishSearchAnalytics(query, results, filters);
  } catch (error) {
    console.error('❌ Error publishing search analytics:', error);
  }
};

/**
 * Get product changes for event tracking
 */
const getProductChanges = (original: any, updated: any) => {
  const changes: any = {};

  Object.keys(updated).forEach((key) => {
    if (original[key] !== updated[key]) {
      changes[key] = {
        from: original[key],
        to: updated[key],
      };
    }
  });

  return changes;
};
