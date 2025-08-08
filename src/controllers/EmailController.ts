import { Request, Response } from 'express';
import emailService from '../services/EmailService.js';

export const sendLowStockAlertEmail = async (req: Request, res: Response) => {
  try {
    const { recipient, productName, currentStock, threshold, productId } =
      req.body;

    // Validate required fields
    if (
      !recipient ||
      !productName ||
      currentStock === undefined ||
      threshold === undefined ||
      !productId
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: [
          'recipient',
          'productName',
          'currentStock',
          'threshold',
          'productId',
        ],
      });
    }

    const success = await emailService.sendLowStockAlert(
      recipient,
      productName,
      currentStock,
      threshold,
      productId
    );

    if (success) {
      return res.json({
        success: true,
        message: 'Low stock alert email sent successfully',
        recipient,
        productName,
      });
    } else {
      return res.status(500).json({
        error: 'Failed to send low stock alert email',
      });
    }
  } catch (error) {
    console.error('❌ Error sending low stock alert email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const sendHighDemandAlertEmail = async (req: Request, res: Response) => {
  try {
    const { recipient, productName, views24h, searches24h, currentStock } =
      req.body;

    // Validate required fields
    if (
      !recipient ||
      !productName ||
      views24h === undefined ||
      searches24h === undefined ||
      currentStock === undefined
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: [
          'recipient',
          'productName',
          'views24h',
          'searches24h',
          'currentStock',
        ],
      });
    }

    const success = await emailService.sendHighDemandAlert(
      recipient,
      productName,
      views24h,
      searches24h,
      currentStock
    );

    if (success) {
      return res.json({
        success: true,
        message: 'High demand alert email sent successfully',
        recipient,
        productName,
      });
    } else {
      return res.status(500).json({
        error: 'Failed to send high demand alert email',
      });
    }
  } catch (error) {
    console.error('❌ Error sending high demand alert email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const sendPriceChangeAlertEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { recipient, productName, oldPrice, newPrice } = req.body;

    // Validate required fields
    if (
      !recipient ||
      !productName ||
      oldPrice === undefined ||
      newPrice === undefined
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['recipient', 'productName', 'oldPrice', 'newPrice'],
      });
    }

    const success = await emailService.sendPriceChangeAlert(
      recipient,
      productName,
      oldPrice,
      newPrice
    );

    if (success) {
      return res.json({
        success: true,
        message: 'Price change alert email sent successfully',
        recipient,
        productName,
      });
    } else {
      return res.status(500).json({
        error: 'Failed to send price change alert email',
      });
    }
  } catch (error) {
    console.error('❌ Error sending price change alert email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const sendWelcomeEmail = async (req: Request, res: Response) => {
  try {
    const { recipient, userName } = req.body;

    // Validate required fields
    if (!recipient || !userName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['recipient', 'userName'],
      });
    }

    const success = await emailService.sendWelcomeEmail(recipient, userName);

    if (success) {
      return res.json({
        success: true,
        message: 'Welcome email sent successfully',
        recipient,
        userName,
      });
    } else {
      return res.status(500).json({
        error: 'Failed to send welcome email',
      });
    }
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const sendCustomEmail = async (req: Request, res: Response) => {
  try {
    const { recipient, subject, htmlContent, textContent } = req.body;

    // Validate required fields
    if (!recipient || !subject || !htmlContent) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['recipient', 'subject', 'htmlContent'],
      });
    }

    const success = await emailService.sendCustomEmail(
      recipient,
      subject,
      htmlContent,
      textContent
    );

    if (success) {
      return res.json({
        success: true,
        message: 'Custom email sent successfully',
        recipient,
        subject,
      });
    } else {
      return res.status(500).json({
        error: 'Failed to send custom email',
      });
    }
  } catch (error) {
    console.error('❌ Error sending custom email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getEmailServiceStatus = async (_req: Request, res: Response) => {
  try {
    const isReady = emailService.isEmailServiceReady();

    return res.json({
      status: isReady ? 'ready' : 'not_initialized',
      message: isReady
        ? 'Email service is ready'
        : 'Email service not initialized',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('❌ Error checking email service status:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
