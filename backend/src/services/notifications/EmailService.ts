import nodemailer from 'nodemailer';
import logger from '../../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  public async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        html: options.body
      });

      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject
      });
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }
}