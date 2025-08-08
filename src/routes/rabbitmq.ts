import express from 'express';
import {
  getRabbitMQHealth,
  publishNotification,
  publishAlert,
  publishEmailNotification,
  testLowStockAlert,
  testHighDemandAlert,
  testPriceChangeAlert,
} from '../controllers/RabbitMQController.js';

const router = express.Router();

// Health check
router.get('/health', getRabbitMQHealth);

// Publish notifications and alerts
router.post('/notifications', publishNotification);
router.post('/alerts', publishAlert);
router.post('/email', publishEmailNotification);

// Test business rule alerts
router.post('/test/low-stock', testLowStockAlert);
router.post('/test/high-demand', testHighDemandAlert);
router.post('/test/price-change', testPriceChangeAlert);

export default router;
