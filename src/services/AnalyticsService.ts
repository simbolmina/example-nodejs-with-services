import redisService from '../lib/redis.js';

export interface AnalyticsSummary {
  searchTotal: number;
  topQueries: Array<{ query: string; count: number }>;
  productEventCounts: Record<string, number>;
  productViewsTop: Array<{ productId: string; views: number }>;
  systemEventCounts: Record<string, number>;
  performanceCounts: Record<string, number>;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  totalRequests: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface UserBehaviorMetrics {
  activeUsers: number;
  sessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topUserActions: Array<{ action: string; count: number }>;
}

export interface TrendData {
  period: string;
  searchTrends: Array<{ date: string; count: number }>;
  productViewTrends: Array<{ date: string; count: number }>;
  errorTrends: Array<{ date: string; count: number }>;
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

// Enhanced Analytics Features

export const getPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  const [
    responseTimeStr,
    totalRequestsStr,
    errorCountStr,
    throughputStr,
    memoryUsageStr,
    cpuUsageStr,
  ] = await Promise.all([
    client.get('analytics:performance:avgResponseTime'),
    client.get('analytics:performance:totalRequests'),
    client.get('analytics:performance:errorCount'),
    client.get('analytics:performance:throughput'),
    client.get('analytics:performance:memoryUsage'),
    client.get('analytics:performance:cpuUsage'),
  ]);

  const totalRequests = Number(totalRequestsStr || 0);
  const errorCount = Number(errorCountStr || 0);

  return {
    averageResponseTime: Number(responseTimeStr || 0),
    totalRequests,
    errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
    throughput: Number(throughputStr || 0),
    memoryUsage: Number(memoryUsageStr || 0),
    cpuUsage: Number(cpuUsageStr || 0),
  };
};

export const getUserBehaviorMetrics =
  async (): Promise<UserBehaviorMetrics> => {
    const client = redisService.getClient();
    if (!client) throw new Error('Redis not connected');

    const [
      activeUsersStr,
      sessionDurationStr,
      bounceRateStr,
      conversionRateStr,
      userActionsHash,
    ] = await Promise.all([
      client.get('analytics:users:active'),
      client.get('analytics:users:avgSessionDuration'),
      client.get('analytics:users:bounceRate'),
      client.get('analytics:users:conversionRate'),
      client.hGetAll('analytics:users:actions'),
    ]);

    const topUserActions = Object.entries(userActionsHash || {})
      .map(([action, count]) => ({ action, count: Number(count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      activeUsers: Number(activeUsersStr || 0),
      sessionDuration: Number(sessionDurationStr || 0),
      bounceRate: Number(bounceRateStr || 0),
      conversionRate: Number(conversionRateStr || 0),
      topUserActions,
    };
  };

export const getTrendData = async (days: number = 7): Promise<TrendData> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  const now = new Date();
  const searchTrends = [];
  const productViewTrends = [];
  const errorTrends = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr =
      date.toISOString().split('T')[0] || date.toISOString().slice(0, 10);

    const [searchCount, viewCount, errorCount] = await Promise.all([
      client.get(`analytics:trends:search:${dateStr}`),
      client.get(`analytics:trends:views:${dateStr}`),
      client.get(`analytics:trends:errors:${dateStr}`),
    ]);

    searchTrends.push({ date: dateStr, count: Number(searchCount || 0) });
    productViewTrends.push({ date: dateStr, count: Number(viewCount || 0) });
    errorTrends.push({ date: dateStr, count: Number(errorCount || 0) });
  }

  return {
    period: `${days} days`,
    searchTrends,
    productViewTrends,
    errorTrends,
  };
};

export const getComplexAnalytics = async (filters?: {
  dateRange?: { start: string; end: string };
  eventType?: string;
  productId?: string;
}) => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  // Get all events and filter them
  const allEvents = await getRecentEvents(1000);

  let filteredEvents = allEvents;

  if (filters?.dateRange) {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);

    filteredEvents = filteredEvents.filter((event) => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  if (filters?.eventType) {
    filteredEvents = filteredEvents.filter(
      (event) => event.type === filters.eventType
    );
  }

  if (filters?.productId) {
    filteredEvents = filteredEvents.filter(
      (event) => event.data?.productId === filters.productId
    );
  }

  // Calculate analytics
  const eventCounts: Record<string, number> = {};
  const productInteractions: Record<string, number> = {};
  const userSessions: Set<string> = new Set();

  filteredEvents.forEach((event) => {
    // Count event types
    eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;

    // Track product interactions
    if (event.data?.productId) {
      productInteractions[event.data.productId] =
        (productInteractions[event.data.productId] || 0) + 1;
    }

    // Track unique sessions
    if (event.data?.sessionId) {
      userSessions.add(event.data.sessionId);
    }
  });

  return {
    totalEvents: filteredEvents.length,
    uniqueSessions: userSessions.size,
    eventBreakdown: eventCounts,
    topProducts: Object.entries(productInteractions)
      .map(([productId, count]) => ({ productId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    averageEventsPerSession:
      userSessions.size > 0 ? filteredEvents.length / userSessions.size : 0,
  };
};

export default {
  getSummary,
  getRecentEvents,
  getPerformanceMetrics,
  getUserBehaviorMetrics,
  getTrendData,
  getComplexAnalytics,
};
