import redisService from '../lib/redis.js';
import rabbitmqService from './RabbitMQService.js';

export interface AlertRule {
  id: string;
  name: string;
  type: 'threshold' | 'trend' | 'anomaly';
  condition: string;
  threshold?: number;
  enabled: boolean;
  notificationType: 'email' | 'webhook' | 'slack';
  recipients: string[];
}

export interface TrendAnalysis {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  confidence: number;
  recommendation: string;
}

export interface PredictiveInsight {
  metric: string;
  prediction: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  filters: Record<string, any>;
  schedule?: string; // cron expression
  recipients: string[];
}

// Alert Management
export const createAlertRule = async (rule: AlertRule): Promise<void> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  await client.hSet('bi:alert_rules', rule.id, JSON.stringify(rule));
  console.log(`✅ Alert rule "${rule.name}" created`);
};

export const getAlertRules = async (): Promise<AlertRule[]> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  const rules = await client.hGetAll('bi:alert_rules');
  return Object.values(rules).map((rule) => JSON.parse(rule));
};

export const updateAlertRule = async (
  id: string,
  updates: Partial<AlertRule>
): Promise<void> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  const existingRule = await client.hGet('bi:alert_rules', id);
  if (!existingRule) throw new Error('Alert rule not found');

  const rule = { ...JSON.parse(existingRule), ...updates };
  await client.hSet('bi:alert_rules', id, JSON.stringify(rule));
  console.log(`✅ Alert rule "${rule.name}" updated`);
};

export const deleteAlertRule = async (id: string): Promise<void> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  await client.hDel('bi:alert_rules', id);
  console.log(`✅ Alert rule deleted`);
};

// Trend Detection
export const analyzeTrends = async (
  metric: string,
  days: number = 7
): Promise<TrendAnalysis> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  const now = new Date();
  const values: number[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const value = await client.get(`analytics:trends:${metric}:${dateStr}`);
    values.push(Number(value || 0));
  }

  // Calculate trend
  const recentAvg = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const previousAvg =
    values.slice(0, -3).reduce((a, b) => a + b, 0) /
    Math.max(values.length - 3, 1);

  const changePercent =
    previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  let trend: 'increasing' | 'decreasing' | 'stable';
  if (changePercent > 5) trend = 'increasing';
  else if (changePercent < -5) trend = 'decreasing';
  else trend = 'stable';

  const confidence = Math.min(Math.abs(changePercent) / 10, 1) * 100;

  let recommendation = '';
  if (trend === 'increasing') {
    recommendation = `Consider scaling up resources as ${metric} is trending upward`;
  } else if (trend === 'decreasing') {
    recommendation = `Investigate potential issues as ${metric} is declining`;
  } else {
    recommendation = `${metric} is stable, no immediate action required`;
  }

  return {
    metric,
    trend,
    changePercent,
    confidence,
    recommendation,
  };
};

// Predictive Analytics (Basic)
export const generatePredictiveInsights = async (
  metric: string
): Promise<PredictiveInsight[]> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  const insights: PredictiveInsight[] = [];

  // Simple linear regression for prediction
  const now = new Date();
  const values: number[] = [];

  for (let i = 14; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const value = await client.get(`analytics:trends:${metric}:${dateStr}`);
    values.push(Number(value || 0));
  }

  if (values.length >= 7) {
    // Calculate simple moving average trend
    const recentAvg = values.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const previousAvg =
      values.slice(0, -7).reduce((a, b) => a + b, 0) /
      Math.max(values.length - 7, 1);

    const trend = recentAvg - previousAvg;
    const prediction = recentAvg + trend * 3; // Predict 3 days ahead

    const confidence = Math.min(
      (Math.abs(trend) / Math.max(recentAvg, 1)) * 100,
      95
    );

    insights.push({
      metric,
      prediction: Math.max(prediction, 0),
      confidence,
      timeframe: '3 days',
      factors: ['historical trend', 'seasonal patterns', 'moving average'],
    });
  }

  return insights;
};

// Custom Reporting
export const createCustomReport = async (
  report: CustomReport
): Promise<void> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  await client.hSet('bi:custom_reports', report.id, JSON.stringify(report));
  console.log(`✅ Custom report "${report.name}" created`);
};

export const getCustomReports = async (): Promise<CustomReport[]> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  const reports = await client.hGetAll('bi:custom_reports');
  return Object.values(reports).map((report) => JSON.parse(report));
};

export const generateCustomReport = async (reportId: string): Promise<any> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  const reportDataStr = await client.hGet('bi:custom_reports', reportId);
  if (!reportDataStr) throw new Error('Custom report not found');

  const report: CustomReport = JSON.parse(reportDataStr);

  // Generate report data based on metrics and filters
  const reportData: Record<string, any> = {};

  for (const metric of report.metrics) {
    if (metric === 'search_total') {
      const total = await client.get('analytics:search:total');
      reportData[metric] = Number(total || 0);
    } else if (metric === 'active_users') {
      const active = await client.get('analytics:users:active');
      reportData[metric] = Number(active || 0);
    } else if (metric === 'error_rate') {
      const totalRequests = await client.get(
        'analytics:performance:totalRequests'
      );
      const errorCount = await client.get('analytics:performance:errorCount');
      const total = Number(totalRequests || 0);
      const errors = Number(errorCount || 0);
      reportData[metric] = total > 0 ? (errors / total) * 100 : 0;
    }
    // Add more metrics as needed
  }

  return {
    reportId,
    reportName: report.name,
    generatedAt: new Date().toISOString(),
    data: reportData,
    filters: report.filters,
  };
};

// Automated Alert Processing
export const processAlerts = async (): Promise<void> => {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  const rules = await getAlertRules();

  for (const rule of rules) {
    if (!rule.enabled) continue;

    try {
      let shouldTrigger = false;
      let alertMessage = '';

      if (rule.type === 'threshold') {
        const currentValue = await getMetricValue(rule.condition);
        if (rule.threshold && currentValue > rule.threshold) {
          shouldTrigger = true;
          alertMessage = `${rule.condition} exceeded threshold: ${currentValue} > ${rule.threshold}`;
        }
      } else if (rule.type === 'trend') {
        const trend = await analyzeTrends(rule.condition, 7);
        if (trend.trend === 'decreasing' && trend.confidence > 70) {
          shouldTrigger = true;
          alertMessage = `${rule.condition} is trending downward: ${trend.changePercent.toFixed(2)}% decrease`;
        }
      }

      if (shouldTrigger) {
        await sendAlert(rule, alertMessage);
      }
    } catch (error) {
      console.error(`❌ Error processing alert rule "${rule.name}":`, error);
    }
  }
};

async function getMetricValue(metric: string): Promise<number> {
  const client = redisService.getClient();
  if (!client) throw new Error('Redis not connected');

  const value = await client.get(`analytics:${metric}`);
  return Number(value || 0);
}

async function sendAlert(rule: AlertRule, message: string): Promise<void> {
  if (rule.notificationType === 'email') {
    for (const recipient of rule.recipients) {
      await rabbitmqService.publishEmailNotificationService({
        type: 'email',
        recipient,
        subject: `Alert: ${rule.name}`,
        template: 'custom-alert',
        data: {
          ruleName: rule.name,
          message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  console.log(`🚨 Alert triggered: ${rule.name} - ${message}`);
}

export default {
  createAlertRule,
  getAlertRules,
  updateAlertRule,
  deleteAlertRule,
  analyzeTrends,
  generatePredictiveInsights,
  createCustomReport,
  getCustomReports,
  generateCustomReport,
  processAlerts,
};
