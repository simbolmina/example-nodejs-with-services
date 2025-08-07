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

class ProductService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get all products with pagination and filtering
   */
  async getProducts(filters: ProductFilters = {}) {
    const { page = 1, limit = 10, categoryId } = filters;
    const offset = (page - 1) * limit;

    const where: any = { isActive: true };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.product.count({ where }),
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
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductData) {
    const product = await this.prisma.product.create({
      data,
      include: {
        category: true,
      },
    });

    // Index in Elasticsearch
    await this.indexProductInElasticsearch(product);

    // Publish events
    await this.publishProductEvents(product, 'created');

    return product;
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, data: UpdateProductData) {
    // Get the original product to track changes
    const originalProduct = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!originalProduct) {
      throw new Error('Product not found');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    // Re-index in Elasticsearch
    await this.indexProductInElasticsearch(product);

    // Publish events with changes
    const changes = this.getProductChanges(originalProduct, product);
    await this.publishProductEvents(product, 'updated', changes);

    return product;
  }

  /**
   * Soft delete a product
   */
  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Soft delete
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    // Remove from Elasticsearch
    await this.removeProductFromElasticsearch(id);

    // Publish events
    await this.publishProductEvents({ id }, 'deleted');

    return { message: 'Product deleted successfully' };
  }

  /**
   * Search products using Elasticsearch
   */
  async searchProducts(filters: SearchFilters) {
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

    const offset = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

    // Build search query
    const query: any = {
      bool: {
        must: [
          {
            multi_match: {
              query: q,
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
      if (minPrice) range.gte = minPrice;
      if (maxPrice) range.lte = maxPrice;
      query.bool.filter.push({ range: { price: range } });
    }

    if (inStock !== undefined) {
      if (inStock === true) {
        query.bool.filter.push({ range: { inventoryCount: { gt: 0 } } });
      } else {
        query.bool.filter.push({ term: { inventoryCount: 0 } });
      }
    }

    // Build search options
    const searchOptions: any = {
      query,
      size: parseInt(limit.toString()),
      from: offset,
      sort: [{ [sortBy]: sortOrder }],
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

    // Publish search analytics
    await this.publishSearchAnalytics(q, products, {
      category,
      minPrice,
      maxPrice,
      inStock,
    });

    return {
      products,
      total: result.hits.total.value,
      page: parseInt(page.toString()),
      limit: parseInt(limit.toString()),
      aggregations: result.aggregations,
    };
  }

  /**
   * Get product details from Elasticsearch
   */
  async getProductDetails(id: string) {
    const product = await elasticsearchService.getDocument('products', id);

    if (!product || !product._source) {
      throw new Error('Product not found in Elasticsearch');
    }

    return {
      product: product._source,
    };
  }

  /**
   * Track product view
   */
  async trackProductView(id: string, metadata?: any) {
    await kafkaService.publishProductViewed(id, metadata);
  }

  /**
   * Index product in Elasticsearch
   */
  private async indexProductInElasticsearch(product: any) {
    try {
      const category = await this.prisma.category.findUnique({
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

      await elasticsearchService.indexDocument(
        'products',
        document,
        product.id
      );
      console.log(`✅ Indexed product ${product.name} in Elasticsearch`);
    } catch (error) {
      console.error('❌ Error indexing product in Elasticsearch:', error);
    }
  }

  /**
   * Remove product from Elasticsearch
   */
  private async removeProductFromElasticsearch(productId: string) {
    try {
      await elasticsearchService.deleteDocument('products', productId);
      console.log(`✅ Removed product ${productId} from Elasticsearch`);
    } catch (error) {
      console.error('❌ Error removing product from Elasticsearch:', error);
    }
  }

  /**
   * Publish product events
   */
  private async publishProductEvents(
    product: any,
    eventType: 'created' | 'updated' | 'deleted',
    changes?: any
  ) {
    try {
      switch (eventType) {
        case 'created':
          await kafkaService.publishProductCreated(product);
          await kafkaService.publishLowStockAlert(product);
          break;
        case 'updated':
          await kafkaService.publishProductUpdated(product, changes || {});
          await kafkaService.publishLowStockAlert(product);
          break;
        case 'deleted':
          await kafkaService.publishProductDeleted(product.id);
          break;
      }
    } catch (error) {
      console.error(`❌ Error publishing product ${eventType} event:`, error);
    }
  }

  /**
   * Publish search analytics
   */
  private async publishSearchAnalytics(
    query: string,
    results: any[],
    filters: any = {}
  ) {
    try {
      await kafkaService.publishSearchAnalytics(query, results, filters);
    } catch (error) {
      console.error('❌ Error publishing search analytics:', error);
    }
  }

  /**
   * Get changes between original and updated product
   */
  private getProductChanges(original: any, updated: any) {
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
  }
}

export default new ProductService();
