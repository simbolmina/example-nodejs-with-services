import elasticsearchService from '../lib/elasticsearch.js';

async function initializeElasticsearch() {
  try {
    console.log('🔍 Initializing Elasticsearch...');

    // Connect to Elasticsearch
    await elasticsearchService.connect();

    // Create products index with mappings
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
        description: { 
          type: 'text',
          analyzer: 'standard',
        },
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
        tags: { 
          type: 'text',
          fields: {
            keyword: { type: 'keyword' },
          },
        },
        isActive: { type: 'boolean' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    };

    await elasticsearchService.createIndex('products', productsMapping);

    // Create categories index with mappings
    const categoriesMapping = {
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
        description: { type: 'text' },
        parentId: { type: 'keyword' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    };

    await elasticsearchService.createIndex('categories', categoriesMapping);

    // Create analytics index with mappings
    const analyticsMapping = {
      properties: {
        id: { type: 'keyword' },
        type: { type: 'keyword' },
        productId: { type: 'keyword' },
        userId: { type: 'keyword' },
        action: { type: 'keyword' },
        metadata: { type: 'object' },
        timestamp: { type: 'date' },
        ip: { type: 'ip' },
        userAgent: { type: 'text' },
      },
    };

    await elasticsearchService.createIndex('analytics', analyticsMapping);

    console.log('✅ Elasticsearch indices created successfully');
    console.log('📊 Available indices:');
    
    const indices = await elasticsearchService.getIndices();
    indices.forEach((index: any) => {
      console.log(`  - ${index.index} (${index.docs.count} documents)`);
    });

  } catch (error) {
    console.error('❌ Failed to initialize Elasticsearch:', error);
    throw error;
  } finally {
    await elasticsearchService.disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeElasticsearch()
    .then(() => {
      console.log('🎉 Elasticsearch initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Elasticsearch initialization failed:', error);
      process.exit(1);
    });
}

export default initializeElasticsearch;
