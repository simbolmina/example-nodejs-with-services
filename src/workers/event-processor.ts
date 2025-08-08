import dotenv from 'dotenv';
import kafkaService, { EventSchema } from '../lib/kafka.js';
import redisService from '../lib/redis.js';

dotenv.config();

const PRODUCT_TOPIC = process.env.KAFKA_TOPIC_PRODUCTS || 'product-events';
const SEARCH_TOPIC = process.env.KAFKA_TOPIC_SEARCH || 'search-analytics';
const USER_TOPIC = process.env.KAFKA_TOPIC_USER || 'user-activity';
const SYSTEM_TOPIC = process.env.KAFKA_TOPIC_SYSTEM || 'system-events';
const PERF_TOPIC = process.env.KAFKA_TOPIC_PERF || 'performance-metrics';

const allTopics = [
  PRODUCT_TOPIC,
  SEARCH_TOPIC,
  USER_TOPIC,
  SYSTEM_TOPIC,
  PERF_TOPIC,
];

async function start() {
  let retryCount = 0;
  const maxRetries = 10;
  const retryDelay = 5000; // 5 seconds

  while (retryCount < maxRetries) {
    try {
      console.log(
        `🔄 Attempting to start Event Processor (attempt ${retryCount + 1}/${maxRetries})`
      );

      await kafkaService.connect();
      await redisService.connect();

      await kafkaService.subscribeToTopics(
        allTopics,
        async ({ topic, message }) => {
          const value = message.value?.toString();
          if (!value) return;
          let event: EventSchema | undefined;
          try {
            event = JSON.parse(value);
          } catch (e) {
            console.error('❌ Failed to parse event JSON:', e);
            return;
          }

          try {
            // Generic rolling log (last 1000)
            const logEntry = event
              ? {
                  topic,
                  id: event.id,
                  type: event.type,
                  timestamp: event.timestamp,
                  data: event.data,
                }
              : { topic };
            await redisService.lPush(
              'analytics:events',
              JSON.stringify(logEntry)
            );
            const client = redisService.getClient();
            if (client) await client.lTrim('analytics:events', 0, 999);

            if (!event) return;

            switch (topic) {
              case PRODUCT_TOPIC:
                await handleProductEvent(event);
                break;
              case SEARCH_TOPIC:
                await handleSearchAnalytics(event);
                break;
              case USER_TOPIC:
                await handleUserActivity(event);
                break;
              case SYSTEM_TOPIC:
                await handleSystemEvent(event);
                break;
              case PERF_TOPIC:
                await handlePerformanceMetric(event);
                break;
              default:
                break;
            }
          } catch (err) {
            console.error('❌ Error handling event:', err);
          }
        }
      );

      console.log(
        '🚀 Event Processor running. Subscribed to topics:',
        allTopics.join(', ')
      );
      return; // Success, exit the retry loop
    } catch (error) {
      retryCount++;
      console.error(
        `❌ Event Processor startup failed (attempt ${retryCount}/${maxRetries}):`,
        error
      );

      if (retryCount >= maxRetries) {
        console.error(
          '❌ Max retries reached. Event Processor startup failed.'
        );
        process.exit(1);
      }

      console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

async function handleProductEvent(event: EventSchema) {
  const type = event.type;
  const productId = event.data?.productId || event.data?.product?.id;
  if (!productId) return;
  // counters
  await redisService.hIncrBy('analytics:products:events', type, 1);
  await redisService.hIncrBy(`analytics:product:${productId}:events`, type, 1);

  if (type === 'product.created') {
    await redisService.hSet(
      `analytics:product:${productId}`,
      'createdAt',
      event.timestamp
    );
  }
  if (type === 'product.deleted') {
    await redisService.hSet(
      `analytics:product:${productId}`,
      'deletedAt',
      event.timestamp
    );
  }
}

async function handleSearchAnalytics(event: EventSchema) {
  const query = event.data?.query || '';
  const resultCount = Number(event.data?.resultCount || 0);
  // top-level counters
  await redisService.incrBy('analytics:search:total', 1);
  await redisService.hIncrBy('analytics:search:queries', query, 1);
  await redisService.hIncrBy(
    'analytics:search:resultCountDistribution',
    String(resultCount),
    1
  );
  // keep a rolling log (last 500)
  await redisService.lPush('analytics:search:events', JSON.stringify(event));
  const client = redisService.getClient();
  if (client) await client.lTrim('analytics:search:events', 0, 499);
}

async function handleUserActivity(event: EventSchema) {
  const productId = event.data?.productId;
  if (productId) {
    await redisService.hIncrBy('analytics:products:views', productId, 1);
    await redisService.hIncrBy(
      `analytics:product:${productId}:events`,
      'product.viewed',
      1
    );
  }
}

async function handleSystemEvent(event: EventSchema) {
  await redisService.incrBy('analytics:system:events', 1);
  await redisService.hIncrBy('analytics:system:byType', event.type, 1);
}

async function handlePerformanceMetric(event: EventSchema) {
  const metric = event.data?.metric;
  const value = Number(event.data?.value || 0);
  if (!metric) return;
  await redisService.hIncrBy('analytics:performance:count', metric, 1);
  // store last value and timestamp
  await redisService.hSet(
    `analytics:performance:${metric}`,
    'lastValue',
    String(value)
  );
  await redisService.hSet(
    `analytics:performance:${metric}`,
    'lastAt',
    event.timestamp
  );
}

// graceful shutdown
const shutdown = async () => {
  console.log('🔄 Event Processor shutting down...');
  try {
    // reuse disconnects from services
    // @ts-ignore - methods exist on default export
    await kafkaService.disconnect();
  } catch {}
  try {
    await redisService.disconnect();
  } catch {}
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
