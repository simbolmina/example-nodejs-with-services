import { systemPaths } from './system.js';
import { productPaths } from './products.js';
import { categoryPaths } from './categories.js';
import { elasticsearchPaths } from './elasticsearch.js';
import { redisPaths } from './redis.js';

export const paths = {
  ...systemPaths,
  ...productPaths,
  ...categoryPaths,
  ...elasticsearchPaths,
  ...redisPaths,
};
