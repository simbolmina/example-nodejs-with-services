import rabbitmqService, { NotificationMessage, AlertMessage } from '../lib/rabbitmq.js';

export const connectRabbitMQ = async (): Promise<void> => {
  await rabbitmqService.connect();
};

export const disconnectRabbitMQ = async (): Promise<void> => {
  await rabbitmqService.disconnect();
};

export const isRabbitMQConnected = (): boolean => {
  return rabbitmqService.isConnected();
};

export const publishNotificationService = async (notification: NotificationMessage): Promise<void> => {
  await rabbitmqService.publishNotification(notification);
};

export const publishAlertService = async (alert: AlertMessage): Promise<void> => {
  await rabbitmqService.publishAlert(alert);
};

export const publishEmailNotificationService = async (notification: NotificationMessage): Promise<void> => {
  await rabbitmqService.publishEmailNotification(notification);
};

// Business rule engine services
export const checkLowStockAlertService = async (product: any, threshold: number = 10): Promise<void> => {
  await rabbitmqService.checkLowStockAlert(product, threshold);
};

export const checkHighDemandAlertService = async (product: any, views24h: number, searches24h: number): Promise<void> => {
  await rabbitmqService.checkHighDemandAlert(product, views24h, searches24h);
};

export const checkPriceChangeAlertService = async (product: any, oldPrice: number, newPrice: number): Promise<void> => {
  await rabbitmqService.checkPriceChangeAlert(product, oldPrice, newPrice);
};

export const getRabbitMQHealthService = async (): Promise<any> => {
  return await rabbitmqService.healthCheck();
};

export default {
  connectRabbitMQ,
  disconnectRabbitMQ,
  isRabbitMQConnected,
  publishNotificationService,
  publishAlertService,
  publishEmailNotificationService,
  checkLowStockAlertService,
  checkHighDemandAlertService,
  checkPriceChangeAlertService,
  getRabbitMQHealthService
};
