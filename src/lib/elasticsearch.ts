import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

class ElasticsearchService {
  private client: Client;
  private connected: boolean = false;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
      },
    });
  }

  async connect(): Promise<void> {
    try {
      const info = await this.client.info();
      console.log(
        `✅ Connected to Elasticsearch cluster: ${info.cluster_name}`
      );
      this.connected = true;
    } catch (error) {
      console.error('❌ Failed to connect to Elasticsearch:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      this.connected = false;
      console.log('✅ Disconnected from Elasticsearch');
    } catch (error) {
      console.error('❌ Error disconnecting from Elasticsearch:', error);
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const health = await this.client.cluster.health();
      return {
        status: health.status,
        cluster_name: health.cluster_name,
        number_of_nodes: health.number_of_nodes,
        active_primary_shards: health.active_primary_shards,
        active_shards: health.active_shards,
        relocating_shards: health.relocating_shards,
        initializing_shards: health.initializing_shards,
        unassigned_shards: health.unassigned_shards,
        delayed_unassigned_shards: health.delayed_unassigned_shards,
        number_of_pending_tasks: health.number_of_pending_tasks,
        number_of_in_flight_fetch: health.number_of_in_flight_fetch,
        task_max_waiting_in_queue_millis:
          health.task_max_waiting_in_queue_millis,
        active_shards_percent_as_number: health.active_shards_percent_as_number,
      };
    } catch (error) {
      console.error('❌ Elasticsearch health check failed:', error);
      throw error;
    }
  }

  async createIndex(indexName: string, mappings: any = {}): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: indexName });

      if (!exists) {
        await this.client.indices.create({
          index: indexName,
          body: {
            mappings: mappings,
          } as any,
        });
        console.log(`✅ Created index: ${indexName}`);
      } else {
        console.log(`ℹ️ Index ${indexName} already exists`);
      }
    } catch (error) {
      console.error(`❌ Error creating index ${indexName}:`, error);
      throw error;
    }
  }

  async indexDocument(
    indexName: string,
    document: any,
    id?: string
  ): Promise<any> {
    try {
      const indexParams: any = {
        index: indexName,
        body: document,
        refresh: 'wait_for',
      };

      if (id) {
        indexParams.id = id;
      }

      const response = await this.client.index(indexParams);
      return response;
    } catch (error) {
      console.error(`❌ Error indexing document in ${indexName}:`, error);
      throw error;
    }
  }

  async updateDocument(
    indexName: string,
    id: string,
    document: any
  ): Promise<any> {
    try {
      const response = await this.client.update({
        index: indexName,
        id: id,
        body: { doc: document } as any,
        refresh: 'wait_for',
      });
      return response;
    } catch (error) {
      console.error(`❌ Error updating document in ${indexName}:`, error);
      throw error;
    }
  }

  async deleteDocument(indexName: string, id: string): Promise<any> {
    try {
      const response = await this.client.delete({
        index: indexName,
        id: id,
        refresh: 'wait_for',
      });
      return response;
    } catch (error) {
      console.error(`❌ Error deleting document in ${indexName}:`, error);
      throw error;
    }
  }

  async search(indexName: string, query: any, options: any = {}): Promise<any> {
    try {
      const response = await this.client.search({
        index: indexName,
        body: {
          query: query,
          ...options,
        },
      });
      return response;
    } catch (error) {
      console.error(`❌ Error searching in ${indexName}:`, error);
      throw error;
    }
  }

  async bulkIndex(indexName: string, documents: any[]): Promise<any> {
    try {
      const operations = documents.flatMap((doc) => [
        { index: { _index: indexName, _id: doc.id } },
        doc,
      ]);

      const response = await this.client.bulk({
        refresh: 'wait_for',
        body: operations,
      });

      return response;
    } catch (error) {
      console.error(`❌ Error bulk indexing in ${indexName}:`, error);
      throw error;
    }
  }

  async getDocument(indexName: string, id: string): Promise<any> {
    try {
      const response = await this.client.get({
        index: indexName,
        id: id,
      });
      return response;
    } catch (error) {
      console.error(`❌ Error getting document from ${indexName}:`, error);
      throw error;
    }
  }

  async deleteIndex(indexName: string): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: indexName });

      if (exists) {
        await this.client.indices.delete({ index: indexName });
        console.log(`✅ Deleted index: ${indexName}`);
      } else {
        console.log(`ℹ️ Index ${indexName} does not exist`);
      }
    } catch (error) {
      console.error(`❌ Error deleting index ${indexName}:`, error);
      throw error;
    }
  }

  async getIndices(): Promise<any> {
    try {
      const response = await this.client.cat.indices({ format: 'json' });
      return response;
    } catch (error) {
      console.error('❌ Error getting indices:', error);
      throw error;
    }
  }

  async getIndexStats(indexName: string): Promise<any> {
    try {
      const response = await this.client.indices.stats({ index: indexName });
      return response;
    } catch (error) {
      console.error(`❌ Error getting stats for index ${indexName}:`, error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getClient(): Client {
    return this.client;
  }
}

// Export singleton instance
const elasticsearchService = new ElasticsearchService();
export default elasticsearchService;
