import elasticsearchService from '../lib/elasticsearch.js';

async function initializeElasticsearch() {
  try {
    console.log('🔍 Initializing Elasticsearch...');
    await elasticsearchService.connect();

    // Products index mapping
    const productsMapping = {
      properties: {
        id: { type: 'keyword' },
        name: {
          type: 'text',
          analyzer: 'standard',
          fields: {
            keyword: { type: 'keyword' },
            suggest: { type: 'completion' },
          },
        },
        description: { type: 'text', analyzer: 'standard' },
        price: { type: 'float' },
        categoryId: { type: 'keyword' },
        categoryName: {
          type: 'text',
          fields: {
            keyword: { type: 'keyword' },
          },
        },
        inventoryCount: { type: 'integer' },
        sku: { type: 'keyword' },
        weight: { type: 'float' },
        dimensions: { type: 'object' },
        images: { type: 'keyword' },
        tags: { type: 'keyword' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    };

    // Categories index mapping
    const categoriesMapping = {
      properties: {
        id: { type: 'keyword' },
        name: {
          type: 'text',
          analyzer: 'standard',
          fields: {
            keyword: { type: 'keyword' },
          },
        },
        description: { type: 'text' },
        parentId: { type: 'keyword' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    };

    // Analytics index mapping
    const analyticsMapping = {
      properties: {
        id: { type: 'keyword' },
        productId: { type: 'keyword' },
        date: { type: 'date' },
        views: { type: 'integer' },
        clicks: { type: 'integer' },
        sales: { type: 'integer' },
        revenue: { type: 'float' },
        conversionRate: { type: 'float' },
        avgOrderValue: { type: 'float' },
        createdAt: { type: 'date' },
      },
    };

    // Create indices
    await elasticsearchService.createIndex('products', productsMapping);
    await elasticsearchService.createIndex('categories', categoriesMapping);
    await elasticsearchService.createIndex('analytics', analyticsMapping);

    console.log('✅ Elasticsearch indices created successfully');

    // List all indices
    const indices = await elasticsearchService.getIndices();
    console.log('📋 Available indices:');
    indices.forEach((index) => {
      console.log(`  - ${index.index} (${index.docs.count} documents)`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize Elasticsearch:', error);
    throw error;
  } finally {
    await elasticsearchService.disconnect();
  }
}

// Run the initialization
initializeElasticsearch()
  .then(() => {
    console.log('🎉 Elasticsearch initialization completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Elasticsearch initialization failed:', error);
    process.exit(1);
  });
