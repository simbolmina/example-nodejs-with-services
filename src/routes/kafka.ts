import express from 'express';
import KafkaController from '../controllers/KafkaController.js';

const router = express.Router();

// Get Kafka health status
router.get('/health', KafkaController.getHealth);

// Get Kafka connection status
router.get('/status', KafkaController.getConnectionStatus);

// Publish a custom event
router.post('/publish', KafkaController.publishCustomEvent);

// Publish product created event
router.post(
  '/events/product-created',
  KafkaController.publishProductCreatedEvent
);

// Publish product updated event
router.post(
  '/events/product-updated',
  KafkaController.publishProductUpdatedEvent
);

// Publish product deleted event
router.post(
  '/events/product-deleted',
  KafkaController.publishProductDeletedEvent
);

// Publish search analytics event
router.post(
  '/events/search-analytics',
  KafkaController.publishSearchAnalyticsEvent
);

// Publish system health event
router.post('/events/system-health', KafkaController.publishSystemHealthEvent);

// Publish performance metric event
router.post(
  '/events/performance-metric',
  KafkaController.publishPerformanceMetricEvent
);

export default router;
