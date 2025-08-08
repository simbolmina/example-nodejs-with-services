import emailService, { EmailOptions } from '../lib/email.js';

export const initializeEmailService = async (): Promise<void> => {
  await emailService.initializeEmailService();
};

export const sendLowStockAlert = async (
  recipient: string,
  productName: string,
  currentStock: number,
  threshold: number,
  productId: string
): Promise<boolean> => {
  try {
    const template = emailService.emailTemplates.lowStockAlert({
      productName,
      currentStock,
      threshold,
      productId,
    });

    const emailOptions: EmailOptions = {
      to: recipient,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    return await emailService.sendEmail(emailOptions);
  } catch (error) {
    console.error('❌ Error sending low stock alert email:', error);
    return false;
  }
};

export const sendHighDemandAlert = async (
  recipient: string,
  productName: string,
  views24h: number,
  searches24h: number,
  currentStock: number
): Promise<boolean> => {
  try {
    const template = emailService.emailTemplates.highDemandAlert({
      productName,
      views24h,
      searches24h,
      currentStock,
    });

    const emailOptions: EmailOptions = {
      to: recipient,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    return await emailService.sendEmail(emailOptions);
  } catch (error) {
    console.error('❌ Error sending high demand alert email:', error);
    return false;
  }
};

export const sendPriceChangeAlert = async (
  recipient: string,
  productName: string,
  oldPrice: number,
  newPrice: number
): Promise<boolean> => {
  try {
    const changePercent = (
      (Math.abs(newPrice - oldPrice) / oldPrice) *
      100
    ).toFixed(2);

    const template = emailService.emailTemplates.priceChangeAlert({
      productName,
      oldPrice: oldPrice.toFixed(2),
      newPrice: newPrice.toFixed(2),
      changePercent,
    });

    const emailOptions: EmailOptions = {
      to: recipient,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    return await emailService.sendEmail(emailOptions);
  } catch (error) {
    console.error('❌ Error sending price change alert email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (
  recipient: string,
  userName: string
): Promise<boolean> => {
  try {
    const template = emailService.emailTemplates.welcomeEmail({
      userName,
      userEmail: recipient,
    });

    const emailOptions: EmailOptions = {
      to: recipient,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    return await emailService.sendEmail(emailOptions);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
};

export const sendCustomEmail = async (
  recipient: string,
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<boolean> => {
  try {
    const emailOptions: EmailOptions = {
      to: recipient,
      subject,
      html: htmlContent,
      text: textContent,
    };

    return await emailService.sendEmail(emailOptions);
  } catch (error) {
    console.error('❌ Error sending custom email:', error);
    return false;
  }
};

export const isEmailServiceReady = (): boolean => {
  return emailService.isEmailServiceInitialized();
};

export default {
  initializeEmailService,
  sendLowStockAlert,
  sendHighDemandAlert,
  sendPriceChangeAlert,
  sendWelcomeEmail,
  sendCustomEmail,
  isEmailServiceReady,
};
