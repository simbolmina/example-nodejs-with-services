import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string | undefined;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

let transporter: nodemailer.Transporter | null = null;

export const initializeEmailService = async () => {
  try {
    // Create test account for development (ethereal.email)
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log(
      '✅ Email service initialized (development mode - using Ethereal)'
    );
    console.log(`📧 Test account: ${testAccount.user}`);
    console.log('📧 View emails at: https://ethereal.email/');
  } catch (error) {
    console.error('❌ Failed to initialize email service:', error);
    throw error;
  }
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!transporter) {
      throw new Error('Email service not initialized');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM_ADDRESS || 'noreply@ecommerce-analytics.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('📧 Email sent successfully to:', options.to);
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));

    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  lowStockAlert: (data: {
    productName: string;
    currentStock: number;
    threshold: number;
    productId: string;
  }): EmailTemplate => ({
    subject: `Low Stock Alert - ${data.productName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Low Stock Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .product-info { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Low Stock Alert</h1>
          </div>
          <div class="content">
            <div class="alert">
              <h2>Product Stock Warning</h2>
              <p>The following product is running low on stock and may need immediate attention:</p>
            </div>
            
            <div class="product-info">
              <h3>${data.productName}</h3>
              <p><strong>Product ID:</strong> ${data.productId}</p>
              <p><strong>Current Stock:</strong> <span style="color: #dc3545; font-weight: bold;">${data.currentStock}</span></p>
              <p><strong>Threshold:</strong> ${data.threshold}</p>
              <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">CRITICAL</span></p>
            </div>
            
            <p>Please take immediate action to restock this product to avoid stockouts.</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This is an automated alert from the E-commerce Analytics Hub.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Low Stock Alert - ${data.productName}

Product ${data.productName} is running low on stock.

Product ID: ${data.productId}
Current Stock: ${data.currentStock}
Threshold: ${data.threshold}
Status: CRITICAL

Please take immediate action to restock this product to avoid stockouts.

This is an automated alert from the E-commerce Analytics Hub.`,
  }),

  highDemandAlert: (data: {
    productName: string;
    views24h: number;
    searches24h: number;
    currentStock: number;
  }): EmailTemplate => ({
    subject: `High Demand Alert - ${data.productName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>High Demand Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; }
          .alert { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .product-info { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .metric { background: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 High Demand Alert</h1>
          </div>
          <div class="content">
            <div class="alert">
              <h2>Product Demand Surge</h2>
              <p>The following product is experiencing high demand and may need attention:</p>
            </div>
            
            <div class="product-info">
              <h3>${data.productName}</h3>
              <div class="metrics">
                <div class="metric">
                  <h4>Views (24h)</h4>
                  <p style="font-size: 24px; font-weight: bold; color: #28a745;">${data.views24h}</p>
                </div>
                <div class="metric">
                  <h4>Searches (24h)</h4>
                  <p style="font-size: 24px; font-weight: bold; color: #28a745;">${data.searches24h}</p>
                </div>
              </div>
              <p><strong>Current Stock:</strong> ${data.currentStock}</p>
            </div>
            
            <p>Consider increasing stock levels or running a promotion for this product.</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This is an automated alert from the E-commerce Analytics Hub.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `High Demand Alert - ${data.productName}

Product ${data.productName} is experiencing high demand.

Views (24h): ${data.views24h}
Searches (24h): ${data.searches24h}
Current Stock: ${data.currentStock}

Consider increasing stock levels or running a promotion for this product.

This is an automated alert from the E-commerce Analytics Hub.`,
  }),

  priceChangeAlert: (data: {
    productName: string;
    oldPrice: string;
    newPrice: string;
    changePercent: string;
  }): EmailTemplate => ({
    subject: `Price Change Alert - ${data.productName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Price Change Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .product-info { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .price-change { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Price Change Alert</h1>
          </div>
          <div class="content">
            <div class="alert">
              <h2>Product Price Update</h2>
              <p>The following product has had a significant price change:</p>
            </div>
            
            <div class="product-info">
              <h3>${data.productName}</h3>
              <div class="price-change">
                <p><strong>Old Price:</strong> $${data.oldPrice}</p>
                <p><strong>New Price:</strong> $${data.newPrice}</p>
                <p><strong>Change:</strong> <span style="font-weight: bold;">${data.changePercent}%</span></p>
              </div>
            </div>
            
            <p>Please review this price change and ensure it aligns with your pricing strategy.</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This is an automated alert from the E-commerce Analytics Hub.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Price Change Alert - ${data.productName}

Product ${data.productName} price has been updated.

Old Price: $${data.oldPrice}
New Price: $${data.newPrice}
Change: ${data.changePercent}%

Please review this price change and ensure it aligns with your pricing strategy.

This is an automated alert from the E-commerce Analytics Hub.`,
  }),

  welcomeEmail: (data: {
    userName: string;
    userEmail: string;
  }): EmailTemplate => ({
    subject: 'Welcome to E-commerce Analytics Hub',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; }
          .welcome { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome!</h1>
          </div>
          <div class="content">
            <div class="welcome">
              <h2>Hello ${data.userName}!</h2>
              <p>Welcome to the E-commerce Analytics Hub. We're excited to have you on board!</p>
              <p>You'll receive real-time alerts and analytics about your e-commerce operations.</p>
            </div>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This email was sent to ${data.userEmail}
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to E-commerce Analytics Hub

Hello ${data.userName}!

Welcome to the E-commerce Analytics Hub. We're excited to have you on board!

You'll receive real-time alerts and analytics about your e-commerce operations.

If you have any questions, feel free to reach out to our support team.

This email was sent to ${data.userEmail}`,
  }),
};

// Helper function to strip HTML tags for text version
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

export const isEmailServiceInitialized = (): boolean => {
  return transporter !== null;
};

export default {
  initializeEmailService,
  sendEmail,
  emailTemplates,
  isEmailServiceInitialized,
};
