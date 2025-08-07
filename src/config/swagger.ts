import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { paths } from './swagger/paths/index.js';
import { schemas } from './swagger/schemas/index.js';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'E-commerce Analytics Hub API',
    version: '1.0.0',
    description:
      'Real-time e-commerce analytics and notification system API with Elasticsearch and Kafka integration',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  paths,
  components: {
    schemas,
  },
};

export const setupSwagger = (app: Express) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });
};
