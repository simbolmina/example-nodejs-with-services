import { Request, Response } from 'express';
import businessIntelligenceService, {
  AlertRule,
  CustomReport,
} from '../services/BusinessIntelligenceService.js';

// Alert Management
export const createAlertRule = async (req: Request, res: Response) => {
  try {
    const rule: AlertRule = req.body;

    if (!rule.id || !rule.name || !rule.type || !rule.condition) {
      return res.status(400).json({
        error: 'Missing required fields: id, name, type, condition',
      });
    }

    await businessIntelligenceService.createAlertRule(rule);
    return res.status(201).json({ message: 'Alert rule created successfully' });
  } catch (error) {
    console.error('❌ Error creating alert rule:', error);
    return res.status(500).json({ error: 'Failed to create alert rule' });
  }
};

export const getAlertRules = async (_req: Request, res: Response) => {
  try {
    const rules = await businessIntelligenceService.getAlertRules();
    return res.json(rules);
  } catch (error) {
    console.error('❌ Error fetching alert rules:', error);
    return res.status(500).json({ error: 'Failed to fetch alert rules' });
  }
};

export const updateAlertRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Alert rule ID is required' });
    }

    await businessIntelligenceService.updateAlertRule(id, updates);
    return res.json({ message: 'Alert rule updated successfully' });
  } catch (error) {
    console.error('❌ Error updating alert rule:', error);
    return res.status(500).json({ error: 'Failed to update alert rule' });
  }
};

export const deleteAlertRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Alert rule ID is required' });
    }

    await businessIntelligenceService.deleteAlertRule(id);
    return res.json({ message: 'Alert rule deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting alert rule:', error);
    return res.status(500).json({ error: 'Failed to delete alert rule' });
  }
};

// Trend Analysis
export const analyzeTrends = async (req: Request, res: Response) => {
  try {
    const { metric } = req.params;
    const days = Math.min(Number(req.query.days || 7), 30);

    if (!metric) {
      return res.status(400).json({ error: 'Metric parameter is required' });
    }

    const analysis = await businessIntelligenceService.analyzeTrends(
      metric,
      days
    );
    return res.json(analysis);
  } catch (error) {
    console.error('❌ Error analyzing trends:', error);
    return res.status(500).json({ error: 'Failed to analyze trends' });
  }
};

// Predictive Analytics
export const getPredictiveInsights = async (req: Request, res: Response) => {
  try {
    const { metric } = req.params;

    if (!metric) {
      return res.status(400).json({ error: 'Metric parameter is required' });
    }

    const insights =
      await businessIntelligenceService.generatePredictiveInsights(metric);
    return res.json(insights);
  } catch (error) {
    console.error('❌ Error generating predictive insights:', error);
    return res
      .status(500)
      .json({ error: 'Failed to generate predictive insights' });
  }
};

// Custom Reporting
export const createCustomReport = async (req: Request, res: Response) => {
  try {
    const report: CustomReport = req.body;

    if (!report.id || !report.name || !report.metrics) {
      return res.status(400).json({
        error: 'Missing required fields: id, name, metrics',
      });
    }

    await businessIntelligenceService.createCustomReport(report);
    return res
      .status(201)
      .json({ message: 'Custom report created successfully' });
  } catch (error) {
    console.error('❌ Error creating custom report:', error);
    return res.status(500).json({ error: 'Failed to create custom report' });
  }
};

export const getCustomReports = async (_req: Request, res: Response) => {
  try {
    const reports = await businessIntelligenceService.getCustomReports();
    return res.json(reports);
  } catch (error) {
    console.error('❌ Error fetching custom reports:', error);
    return res.status(500).json({ error: 'Failed to fetch custom reports' });
  }
};

export const generateCustomReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({ error: 'Report ID is required' });
    }

    const report =
      await businessIntelligenceService.generateCustomReport(reportId);
    return res.json(report);
  } catch (error) {
    console.error('❌ Error generating custom report:', error);
    return res.status(500).json({ error: 'Failed to generate custom report' });
  }
};

// Process Alerts (Admin endpoint)
export const processAlerts = async (_req: Request, res: Response) => {
  try {
    await businessIntelligenceService.processAlerts();
    return res.json({ message: 'Alerts processed successfully' });
  } catch (error) {
    console.error('❌ Error processing alerts:', error);
    return res.status(500).json({ error: 'Failed to process alerts' });
  }
};

export default {
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
};
