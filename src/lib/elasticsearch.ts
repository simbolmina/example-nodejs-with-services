import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

let client: Client;
let connected: boolean = false;

export const initialize = () => {
  client = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
      password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
    },
  });
};

export const connect = async (): Promise<void> => {
  try {
    if (!client) {
      initialize();
    }
    const info = await client.info();
    console.log(`✅ Connected to Elasticsearch cluster: ${info.cluster_name}`);
    connected = true;
  } catch (error) {
    console.error('❌ Failed to connect to Elasticsearch:', error);
    throw error;
  }
};

export const disconnect = async (): Promise<void> => {
  try {
    await client.close();
    connected = false;
    console.log('✅ Disconnected from Elasticsearch');
  } catch (error) {
    console.error('❌ Error disconnecting from Elasticsearch:', error);
  }
};

export const healthCheck = async (): Promise<any> => {
  try {
    const health = await client.cluster.health();
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
      task_max_waiting_in_queue_millis: health.task_max_waiting_in_queue_millis,
      active_shards_percent_as_number: health.active_shards_percent_as_number,
    };
  } catch (error) {
    console.error('❌ Elasticsearch health check failed:', error);
    throw error;
  }
};

export const createIndex = async (
  indexName: string,
  mappings: any = {}
): Promise<void> => {
  try {
    const exists = await client.indices.exists({ index: indexName });

    if (!exists) {
      await client.indices.create({
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
};

export const indexDocument = async (
  indexName: string,
  document: any,
  id?: string
): Promise<any> => {
  try {
    const indexParams: any = {
      index: indexName,
      body: document,
      refresh: 'wait_for',
    };

    if (id) {
      indexParams.id = id;
    }

    const result = await client.index(indexParams);
    console.log(`✅ Indexed document in ${indexName}:`, result._id);
    return result;
  } catch (error) {
    console.error(`❌ Error indexing document in ${indexName}:`, error);
    throw error;
  }
};

export const updateDocument = async (
  indexName: string,
  id: string,
  document: any
): Promise<any> => {
  try {
    const result = await client.update({
      index: indexName,
      id: id,
      body: {
        doc: document,
      } as any,
      refresh: 'wait_for',
    });

    console.log(`✅ Updated document ${id} in ${indexName}`);
    return result;
  } catch (error) {
    console.error(`❌ Error updating document ${id} in ${indexName}:`, error);
    throw error;
  }
};

export const deleteDocument = async (
  indexName: string,
  id: string
): Promise<any> => {
  try {
    const result = await client.delete({
      index: indexName,
      id: id,
      refresh: 'wait_for',
    });

    console.log(`✅ Deleted document ${id} from ${indexName}`);
    return result;
  } catch (error) {
    console.error(`❌ Error deleting document ${id} from ${indexName}:`, error);
    throw error;
  }
};

export const search = async (
  indexName: string,
  query: any,
  options: any = {}
): Promise<any> => {
  try {
    const searchParams: any = {
      index: indexName,
      body: query,
      ...options,
    };

    const result = await client.search(searchParams);
    const totalHits =
      typeof result.hits.total === 'number'
        ? result.hits.total
        : result.hits.total?.value || 0;
    console.log(`✅ Search completed in ${indexName}: ${totalHits} hits`);
    return result;
  } catch (error) {
    console.error(`❌ Error searching in ${indexName}:`, error);
    throw error;
  }
};

export const bulkIndex = async (
  indexName: string,
  documents: any[]
): Promise<any> => {
  try {
    const operations = documents.flatMap((doc: any) => [
      { index: { _index: indexName, _id: doc.id } },
      doc,
    ]);

    const result = await client.bulk({
      body: operations,
      refresh: 'wait_for',
    });

    console.log(
      `✅ Bulk indexed ${documents.length} documents in ${indexName}`
    );
    return result;
  } catch (error) {
    console.error(`❌ Error bulk indexing in ${indexName}:`, error);
    throw error;
  }
};

export const getDocument = async (
  indexName: string,
  id: string
): Promise<any> => {
  try {
    const result = await client.get({
      index: indexName,
      id: id,
    });

    console.log(`✅ Retrieved document ${id} from ${indexName}`);
    return result;
  } catch (error) {
    console.error(`❌ Error getting document ${id} from ${indexName}:`, error);
    throw error;
  }
};

export const deleteIndex = async (indexName: string): Promise<void> => {
  try {
    const exists = await client.indices.exists({ index: indexName });

    if (exists) {
      await client.indices.delete({ index: indexName });
      console.log(`✅ Deleted index: ${indexName}`);
    } else {
      console.log(`ℹ️ Index ${indexName} does not exist`);
    }
  } catch (error) {
    console.error(`❌ Error deleting index ${indexName}:`, error);
    throw error;
  }
};

export const getIndices = async (): Promise<any> => {
  try {
    const result = await client.cat.indices({ format: 'json' });
    return result;
  } catch (error) {
    console.error('❌ Error getting indices:', error);
    throw error;
  }
};

export const getIndexStats = async (indexName: string): Promise<any> => {
  try {
    const result = await client.indices.stats({ index: indexName });
    return result;
  } catch (error) {
    console.error(`❌ Error getting stats for index ${indexName}:`, error);
    throw error;
  }
};

export const isConnected = (): boolean => {
  return connected;
};

export const getClient = (): Client => {
  return client;
};

// Default export for backward compatibility
const elasticsearchService = {
  initialize,
  connect,
  disconnect,
  healthCheck,
  createIndex,
  indexDocument,
  updateDocument,
  deleteDocument,
  search,
  bulkIndex,
  getDocument,
  deleteIndex,
  getIndices,
  getIndexStats,
  isConnected,
  getClient,
};

export default elasticsearchService;
