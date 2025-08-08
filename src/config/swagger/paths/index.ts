import { systemPaths } from './system.js';
import { productPaths } from './products.js';
import { categoryPaths } from './categories.js';
import { elasticsearchPaths } from './elasticsearch.js';
import { redisPaths } from './redis.js';
import { kafkaPaths } from './kafka.js';
import { analyticsPaths } from './analytics.js';
import { rabbitmqPaths } from './rabbitmq.js';

export const paths = {
  ...systemPaths,
  ...productPaths,
  ...categoryPaths,
  ...elasticsearchPaths,
  ...redisPaths,
  ...kafkaPaths,
  ...analyticsPaths,
  ...rabbitmqPaths,
};
