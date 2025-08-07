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

class ElasticsearchAdminService {
  /**
   * Get Elasticsearch health status
   */
  async getHealth() {
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
  }

  /**
   * Get connection status
   */
  async getConnectionStatus() {
    const isConnected = elasticsearchService.isConnected();
    return {
      connected: isConnected,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create an index
   */
  async createIndex(indexName: string, data: CreateIndexData = {}) {
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
  }

  /**
   * Delete an index
   */
  async deleteIndex(indexName: string) {
    const result = await elasticsearchService.deleteIndex(indexName);

    return {
      message: `Index '${indexName}' deleted successfully`,
      index: indexName,
      result,
    };
  }

  /**
   * Get all indices
   */
  async getIndices() {
    const indices = await elasticsearchService.getIndices();
    return {
      indices: Object.keys(indices),
      count: Object.keys(indices).length,
    };
  }

  /**
   * Get index statistics
   */
  async getIndexStats(indexName: string) {
    const stats = await elasticsearchService.getIndexStats(indexName);
    return {
      index: indexName,
      stats,
    };
  }

  /**
   * Index a document
   */
  async indexDocument(indexName: string, data: IndexDocumentData) {
    const { document, id } = data;

    const result = await elasticsearchService.indexDocument(
      indexName,
      document,
      id
    );

    return {
      message: `Document indexed successfully in '${indexName}'`,
      index: indexName,
      id: result._id,
      result,
    };
  }

  /**
   * Get a document by ID
   */
  async getDocument(indexName: string, documentId: string) {
    const document = await elasticsearchService.getDocument(
      indexName,
      documentId
    );

    if (!document || !document._source) {
      throw new Error(`Document not found in index '${indexName}'`);
    }

    return {
      index: indexName,
      id: documentId,
      document: document._source,
      metadata: {
        _index: document._index,
        _id: document._id,
        _version: document._version,
      },
    };
  }

  /**
   * Update a document
   */
  async updateDocument(
    indexName: string,
    documentId: string,
    data: UpdateDocumentData
  ) {
    const { document } = data;

    const result = await elasticsearchService.updateDocument(
      indexName,
      documentId,
      document
    );

    return {
      message: `Document updated successfully in '${indexName}'`,
      index: indexName,
      id: documentId,
      result,
    };
  }

  /**
   * Delete a document
   */
  async deleteDocument(indexName: string, documentId: string) {
    const result = await elasticsearchService.deleteDocument(
      indexName,
      documentId
    );

    return {
      message: `Document deleted successfully from '${indexName}'`,
      index: indexName,
      id: documentId,
      result,
    };
  }

  /**
   * Search documents
   */
  async searchDocuments(indexName: string, data: SearchData) {
    const { query, options = {} } = data;

    const result = await elasticsearchService.search(indexName, query, options);

    return {
      index: indexName,
      total: result.hits.total.value,
      hits: result.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source,
      })),
      aggregations: result.aggregations,
    };
  }

  /**
   * Bulk index documents
   */
  async bulkIndex(indexName: string, documents: any[]) {
    const operations = documents.flatMap((doc: any) => [
      { index: { _index: indexName, _id: doc.id } },
      doc,
    ]);

    const result = await elasticsearchService.bulkIndex(operations);

    return {
      message: `Bulk indexed ${documents.length} documents in '${indexName}'`,
      index: indexName,
      total: documents.length,
      result,
    };
  }
}

export default new ElasticsearchAdminService();
