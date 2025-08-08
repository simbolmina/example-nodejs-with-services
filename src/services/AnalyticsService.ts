import redisService from '../lib/redis.js';

export interface AnalyticsSummary {
  searchTotal: number;
  topQueries: Array<{ query: string; count: number }>;
  productEventCounts: Record<string, number>;
  productViewsTop: Array<{ productId: string; views: number }>;
  systemEventCounts: Record<string, number>;
  performanceCounts: Record<string, number>;
}

export const getSummary = async (): Promise<AnalyticsSummary> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  const [
    searchTotalStr,
    queriesHash,
    productEvents,
    productViews,
    systemByType,
    perfCount,
  ] = await Promise.all([
    client.get('analytics:search:total'),
    client.hGetAll('analytics:search:queries'),
    client.hGetAll('analytics:products:events'),
    client.hGetAll('analytics:products:views'),
    client.hGetAll('analytics:system:byType'),
    client.hGetAll('analytics:performance:count'),
  ]);

  const searchTotal = Number(searchTotalStr || 0);
  const topQueries = Object.entries(queriesHash || {})
    .map(([query, count]) => ({ query, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const productViewsTop = Object.entries(productViews || {})
    .map(([productId, views]) => ({ productId, views: Number(views) }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);

  const productEventCounts: Record<string, number> = {};
  for (const [k, v] of Object.entries(productEvents || {})) {
    productEventCounts[k] = Number(v);
  }

  const systemEventCounts: Record<string, number> = {};
  for (const [k, v] of Object.entries(systemByType || {})) {
    systemEventCounts[k] = Number(v);
  }

  const performanceCounts: Record<string, number> = {};
  for (const [k, v] of Object.entries(perfCount || {})) {
    performanceCounts[k] = Number(v);
  }

  return {
    searchTotal,
    topQueries,
    productEventCounts,
    productViewsTop,
    systemEventCounts,
    performanceCounts,
  };
};

export const getRecentEvents = async (limit: number = 100) => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');
  const items = await client.lRange('analytics:events', 0, limit - 1);
  return items.map((s) => {
    try {
      return JSON.parse(s);
    } catch {
      return s;
    }
  });
};

export default {
  getSummary,
  getRecentEvents,
};
