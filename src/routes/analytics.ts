import express from 'express';
import {
  getSummary,
  getRecent,
  getDashboard,
} from '../controllers/AnalyticsController.js';

const router = express.Router();

router.get('/summary', getSummary);
router.get('/recent', getRecent);
router.get('/dashboard', getDashboard);

export default router;
