import elasticsearchService from '../lib/elasticsearch.js';

export interface CreateIndexData {
  mappings?: any;
  settings?: any;
}

export interface IndexDocumentData {
  document: any;
  id?: string;
}

export interface UpdateDocumentData {
  document: any;
}

export interface SearchData {
  query: any;
  options?: any;
}

/**
 * Get Elasticsearch health status
 */
export const getHealth = async () => {
  try {
    const health = await elasticsearchService.healthCheck();
    return {
      status: 'healthy',
      cluster: health.cluster_name,
      version: health.version?.number,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get connection status
 */
export const getConnectionStatus = async () => {
  const isConnected = elasticsearchService.isConnected();
  return {
    connected: isConnected,
    url: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200',
    timestamp: new Date().toISOString(),
  };
};

/**
 * Create an index
 */
export const createIndex = async (
  indexName: string,
  data: CreateIndexData = {}
) => {
  const { mappings, settings } = data;

  const result = await elasticsearchService.createIndex(indexName, {
    mappings,
    settings,
  });

  return {
    message: `Index '${indexName}' created successfully`,
    index: indexName,
    result,
  };
};

/**
 * Delete an index
 */
export const deleteIndex = async (indexName: string) => {
  const result = await elasticsearchService.deleteIndex(indexName);

  return {
    message: `Index '${indexName}' deleted successfully`,
    index: indexName,
    result,
  };
};

/**
 * Get all indices
 */
export const getIndices = async () => {
  const indices = await elasticsearchService.getIndices();
  return {
    indices: Object.keys(indices),
    count: Object.keys(indices).length,
  };
};

/**
 * Get index statistics
 */
export const getIndexStats = async (indexName: string) => {
  const stats = await elasticsearchService.getIndexStats(indexName);

  return {
    index: indexName,
    stats,
  };
};

/**
 * Index a document
 */
export const indexDocument = async (
  indexName: string,
  data: IndexDocumentData
) => {
  const { document, id } = data;

  const result = await elasticsearchService.indexDocument(indexName, {
    id,
    document,
  });

  return {
    message: `Document indexed successfully in '${indexName}'`,
    index: indexName,
    id: result._id,
    result,
  };
};

/**
 * Get a document
 */
export const getDocument = async (indexName: string, documentId: string) => {
  const result = await elasticsearchService.getDocument(indexName, documentId);

  if (!result.found) {
    throw new Error(
      `Document '${documentId}' not found in index '${indexName}'`
    );
  }

  return {
    index: indexName,
    id: documentId,
    document: result._source,
    version: result._version,
  };
};

/**
 * Update a document
 */
export const updateDocument = async (
  indexName: string,
  documentId: string,
  data: UpdateDocumentData
) => {
  const { document } = data;

  const result = await elasticsearchService.updateDocument(
    indexName,
    documentId,
    {
      document,
    }
  );

  return {
    message: `Document '${documentId}' updated successfully in '${indexName}'`,
    index: indexName,
    id: documentId,
    result,
  };
};

/**
 * Delete a document
 */
export const deleteDocument = async (indexName: string, documentId: string) => {
  const result = await elasticsearchService.deleteDocument(
    indexName,
    documentId
  );

  return {
    message: `Document '${documentId}' deleted successfully from '${indexName}'`,
    index: indexName,
    id: documentId,
    result,
  };
};

/**
 * Search documents
 */
export const searchDocuments = async (indexName: string, data: SearchData) => {
  // Accept full body (including query/size/sort) and optional client options
  const { options, ...body } = (data as any) || {};
  const result = await elasticsearchService.search(indexName, body, options);

  return {
    index: indexName,
    query: (body as any)?.query,
    total: result.hits.total.value,
    hits: result.hits.hits,
    aggregations: result.aggregations,
  };
};

/**
 * Bulk index documents
 */
export const bulkIndex = async (indexName: string, documents: any[]) => {
  const result = await elasticsearchService.bulkIndex(indexName, documents);

  return {
    message: `Bulk indexed ${documents.length} documents in '${indexName}'`,
    index: indexName,
    count: documents.length,
    result,
  };
};
