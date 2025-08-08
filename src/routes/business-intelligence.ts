import express from 'express';
import {
  createAlertRule,
  getAlertRules,
  updateAlertRule,
  deleteAlertRule,
  analyzeTrends,
  getPredictiveInsights,
  createCustomReport,
  getCustomReports,
  generateCustomReport,
  processAlerts,
} from '../controllers/BusinessIntelligenceController.js';

const router = express.Router();

// Alert Management
router.post('/alerts', createAlertRule);
router.get('/alerts', getAlertRules);
router.put('/alerts/:id', updateAlertRule);
router.delete('/alerts/:id', deleteAlertRule);

// Trend Analysis
router.get('/trends/:metric', analyzeTrends);

// Predictive Analytics
router.get('/predictive/:metric', getPredictiveInsights);

// Custom Reporting
router.post('/reports', createCustomReport);
router.get('/reports', getCustomReports);
router.get('/reports/:reportId/generate', generateCustomReport);

// Admin
router.post('/process-alerts', processAlerts);

export default router;
