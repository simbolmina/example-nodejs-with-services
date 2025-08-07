import express from 'express';
import {
  getHealth,
  getConnectionStatus,
  publishCustomEvent,
  publishProductCreatedEvent,
  publishProductUpdatedEvent,
  publishProductDeletedEvent,
  publishSearchAnalyticsEvent,
  publishSystemHealthEvent,
  publishPerformanceMetricEvent,
} from '../controllers/KafkaController.js';

const router = express.Router();

// Get Kafka health status
router.get('/health', getHealth);

// Get Kafka connection status
router.get('/status', getConnectionStatus);

// Publish a custom event
router.post('/publish', publishCustomEvent);

// Publish product created event
router.post('/events/product-created', publishProductCreatedEvent);

// Publish product updated event
router.post('/events/product-updated', publishProductUpdatedEvent);

// Publish product deleted event
router.post('/events/product-deleted', publishProductDeletedEvent);

// Publish search analytics event
router.post('/events/search-analytics', publishSearchAnalyticsEvent);

// Publish system health event
router.post('/events/system-health', publishSystemHealthEvent);

// Publish performance metric event
router.post('/events/performance-metric', publishPerformanceMetricEvent);

export default router;
