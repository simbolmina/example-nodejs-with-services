import express from 'express';
import {
  getSummary,
  getRecent,
  getDashboard,
  getPerformanceMetrics,
  getUserBehavior,
  getTrends,
  getComplexAnalytics,
} from '../controllers/AnalyticsController.js';

const router = express.Router();

router.get('/summary', getSummary);
router.get('/recent', getRecent);
router.get('/dashboard', getDashboard);

// Enhanced Analytics Routes
router.get('/performance', getPerformanceMetrics);
router.get('/user-behavior', getUserBehavior);
router.get('/trends', getTrends);
router.get('/complex', getComplexAnalytics);

export default router;
