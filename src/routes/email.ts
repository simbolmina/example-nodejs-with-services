import express from 'express';
import {
  sendLowStockAlertEmail,
  sendHighDemandAlertEmail,
  sendPriceChangeAlertEmail,
  sendWelcomeEmail,
  sendCustomEmail,
  getEmailServiceStatus
} from '../controllers/EmailController.js';

const router = express.Router();

// Email service status
router.get('/status', getEmailServiceStatus);

// Send low stock alert email
router.post('/low-stock-alert', sendLowStockAlertEmail);

// Send high demand alert email
router.post('/high-demand-alert', sendHighDemandAlertEmail);

// Send price change alert email
router.post('/price-change-alert', sendPriceChangeAlertEmail);

// Send welcome email
router.post('/welcome', sendWelcomeEmail);

// Send custom email
router.post('/custom', sendCustomEmail);

export default router;
