import axios from './config';

export interface SubscriptionData {
  _id: string;
  userId: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'trial';
  paymentGateway: 'razorpay' | 'dodo' | null;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usageLimit: { employees: number; products: number; storage: number };
  currentUsage: { employees: number; products: number; storage: number };
  cancelAtPeriodEnd: boolean;
}

export interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  status: 'paid' | 'pending' | 'cancelled';
  paymentGateway: 'razorpay' | 'dodo' | null;
  paymentId?: string;
  orderId?: string;
  periodStart: string;
  periodEnd: string;
  issuedAt: string;
  paidAt?: string;
}

export interface CreateOrderPayload {
  planId: string;
  gateway: 'razorpay' | 'dodo';
  interval: 'monthly' | 'yearly';
}

export interface VerifyPaymentPayload {
  gateway: 'razorpay' | 'dodo';
  planId: string;
  interval: 'monthly' | 'yearly';
  // Razorpay fields
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  // Dodo fields
  dodo_payment_id?: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

export const getMySubscription = async (): Promise<SubscriptionData | null> => {
  const res = await axios.get('/api/subscription/my-subscription');
  return res.data?.data ?? null;
};

export const createOrder = async (payload: CreateOrderPayload) => {
  const res = await axios.post('/api/subscription/create-order', payload);
  return res.data?.data;
};

export const verifyPayment = async (payload: VerifyPaymentPayload) => {
  const res = await axios.post('/api/subscription/verify', payload);
  return res.data;
};

export const getInvoices = async (page = 1, limit = 10) => {
  const res = await axios.get('/api/subscription/invoices', { params: { page, limit } });
  return res.data?.data;
};

export const getInvoice = async (id: string): Promise<InvoiceData | null> => {
  const res = await axios.get(`/api/subscription/invoices/${id}`);
  return res.data?.data ?? null;
};
