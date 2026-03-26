import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Subscription from '../../models/Subscription.model';
import Invoice, { getNextInvoiceNumber } from '../../models/Invoice.model';
import { getPlanById } from '../../config/subscription-plans';
import mongoose from 'mongoose';

// Razorpay order type
interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
  payment_capture?: boolean;
}

// Lazy initialization function - called when needed, after env vars are loaded
const getRazorpay = (): Razorpay | null => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (keyId && keySecret) {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return null;
};

// Mock Dodo Payments (replace with official SDK when available)
const dodoPayments = {
  createPaymentIntent: async (amount: number, currency: string) => {
    return { id: `dodo_pi_${Date.now()}`, client_secret: `secret_${Date.now()}` };
  },
};

class SubscriptionController {
  // ─── Get current subscription ───────────────────────────────────────────────
  static async getSubscription(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
        ? new mongoose.Types.ObjectId(req.user.userId)
        : null;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
      const subscription = await Subscription.findOne({ userId });
      res.status(200).json({ success: true, data: subscription });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // ─── Create payment order ────────────────────────────────────────────────────
  static async createOrder(req: Request, res: Response) {
    try {
      const { planId, gateway, interval } = req.body;
      const plan = getPlanById(planId);
      if (!plan) return res.status(400).json({ success: false, message: 'Invalid plan' });

      const amount = interval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

      if (gateway === 'razorpay') {
        const razorpay = getRazorpay();
        if (!razorpay) {
          return res.status(503).json({
            success: false,
            message:
              'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.',
          });
        }

        const order = await razorpay.orders.create({
          amount: amount * 100, // paise
          currency: plan.currency,
          receipt: `receipt_${Date.now()}`,
          payment_capture: true,
        }) as RazorpayOrder;

        const userId = req.user?.userId
          ? new mongoose.Types.ObjectId(req.user.userId)
          : null;

        // Ensure a subscription record exists
        if (userId) {
          let sub = await Subscription.findOne({ userId });
          if (!sub) {
            sub = new Subscription({ userId });
            await sub.save();
          }
        }

        return res.status(200).json({
          success: true,
          data: { orderId: order.id, amount: order.amount, currency: order.currency },
        });
      } else if (gateway === 'dodo') {
        const intent = await dodoPayments.createPaymentIntent(amount, plan.currency);
        return res.status(200).json({
          success: true,
          data: { intentId: intent.id, clientSecret: intent.client_secret },
        });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid gateway' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
  }

  // ─── Verify payment & activate subscription ─────────────────────────────────
  static async verifyPayment(req: Request, res: Response) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        gateway,
        planId,
        interval,
      } = req.body;

      const plan = getPlanById(planId);
      if (!plan) {
        return res.status(400).json({ success: false, message: 'Invalid plan' });
      }

      const userId = req.user?.userId
        ? new mongoose.Types.ObjectId(req.user.userId)
        : null;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }

      if (gateway === 'razorpay') {
        const razorpay = getRazorpay();
        if (!razorpay) {
          return res.status(503).json({
            success: false,
            message: 'Razorpay is not configured.',
          });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
          .update(body.toString())
          .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        // Activate subscription
        const periodStart = new Date();
        const periodEnd = new Date();
        if (interval === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        else periodEnd.setMonth(periodEnd.getMonth() + 1);

        let sub = await Subscription.findOne({ userId });
        if (!sub) sub = new Subscription({ userId });
        sub.status = 'active';
        sub.plan = planId;
        sub.paymentGateway = 'razorpay';
        sub.amount = interval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        sub.interval = interval;
        sub.currentPeriodStart = periodStart;
        sub.currentPeriodEnd = periodEnd;
        await sub.save();

        // Create invoice
        const invoiceNumber = await getNextInvoiceNumber();
        const invoice = new Invoice({
          invoiceNumber,
          userId,
          planId,
          planName: plan.name,
          amount: sub.amount,
          currency: plan.currency,
          interval,
          status: 'paid',
          paymentGateway: 'razorpay',
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          periodStart,
          periodEnd,
          issuedAt: new Date(),
          paidAt: new Date(),
        });
        await invoice.save();

        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          data: { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber },
        });
      } else if (gateway === 'dodo') {
        // Mock Dodo verification
        const periodStart = new Date();
        const periodEnd = new Date();
        if (interval === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        else periodEnd.setMonth(periodEnd.getMonth() + 1);

        let sub = await Subscription.findOne({ userId });
        if (!sub) sub = new Subscription({ userId });
        sub.status = 'active';
        sub.plan = planId;
        sub.paymentGateway = 'dodo';
        sub.amount = interval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        sub.interval = interval;
        sub.currentPeriodStart = periodStart;
        sub.currentPeriodEnd = periodEnd;
        await sub.save();

        // Create invoice
        const invoiceNumber = await getNextInvoiceNumber();
        const dodoPaymentId = req.body.dodo_payment_id || `dodo_mock_${Date.now()}`;
        const invoice = new Invoice({
          invoiceNumber,
          userId,
          planId,
          planName: plan.name,
          amount: sub.amount,
          currency: plan.currency,
          interval,
          status: 'paid',
          paymentGateway: 'dodo',
          paymentId: dodoPaymentId,
          periodStart,
          periodEnd,
          issuedAt: new Date(),
          paidAt: new Date(),
        });
        await invoice.save();

        return res.status(200).json({
          success: true,
          message: 'Payment verified via Dodo successfully',
          data: { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber },
        });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid gateway' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
  }

  // ─── Get invoice list ────────────────────────────────────────────────────────
  static async getInvoices(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
        ? new mongoose.Types.ObjectId(req.user.userId)
        : null;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [invoices, total] = await Promise.all([
        Invoice.find({ userId }).sort({ issuedAt: -1 }).skip(skip).limit(limit).lean(),
        Invoice.countDocuments({ userId }),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          invoices,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
  }

  // ─── Get single invoice ──────────────────────────────────────────────────────
  static async getInvoice(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
        ? new mongoose.Types.ObjectId(req.user.userId)
        : null;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }

      const invoice = await Invoice.findOne({ _id: req.params.id, userId }).lean();
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }

      return res.status(200).json({ success: true, data: invoice });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
  }
}

export default SubscriptionController;
