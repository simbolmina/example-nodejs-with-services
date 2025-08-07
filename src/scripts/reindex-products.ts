import { prisma } from '../lib/prisma.js';
import elasticsearchService from '../lib/elasticsearch.js';

async function reindexProducts() {
  try {
    console.log('🔍 Starting product reindexing...');

    // Connect to Elasticsearch
    await elasticsearchService.connect();

    // Get all active products from database
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📦 Found ${products.length} products to reindex`);

    if (products.length === 0) {
      console.log('ℹ️ No products found to reindex');
      return;
    }

    // Transform products for Elasticsearch
    const productDocs = products.map((product) => ({
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
    }));

    // Bulk index products
    const result = await elasticsearchService.bulkIndex(
      'products',
      productDocs
    );

    console.log('✅ Product reindexing completed');
    const itemCount = result.items?.length || 0;
    console.log(`📊 Indexed ${itemCount} products`);

    if (result.errors && result.items) {
      console.log('⚠️ Some errors occurred during indexing:');
      result.items.forEach((item: any, index: number) => {
        if (item.index?.error && products[index]) {
          console.log(
            `  - Product ${products[index].id}: ${item.index.error.reason}`
          );
        }
      });
    }

    // Get index stats
    const stats = await elasticsearchService.getIndexStats('products');
    console.log(
      `📈 Index stats: ${stats.indices.products.total.docs.count} total documents`
    );
  } catch (error) {
    console.error('❌ Failed to reindex products:', error);
    throw error;
  } finally {
    await elasticsearchService.disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  reindexProducts()
    .then(() => {
      console.log('🎉 Product reindexing completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Product reindexing failed:', error);
      process.exit(1);
    });
}

export default reindexProducts;
