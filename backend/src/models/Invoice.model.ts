import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  userId: mongoose.Types.ObjectId;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  status: 'paid' | 'pending' | 'cancelled';
  paymentGateway: 'razorpay' | 'dodo' | null;
  paymentId?: string;
  orderId?: string;
  periodStart: Date;
  periodEnd: Date;
  issuedAt: Date;
  paidAt?: Date;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Auto-incrementing invoice number counter
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model('Counter', CounterSchema);

export const getNextInvoiceNumber = async (): Promise<string> => {
  const counter = await Counter.findByIdAndUpdate(
    'invoiceNumber',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const num = counter!.seq.toString().padStart(6, '0');
  return `INV-${num}`;
};

const InvoiceSchema: Schema<IInvoice> = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    interval: { type: String, enum: ['monthly', 'yearly'], required: true },
    status: {
      type: String,
      enum: ['paid', 'pending', 'cancelled'],
      default: 'pending',
    },
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'dodo', null],
      default: null,
    },
    paymentId: { type: String },
    orderId: { type: String },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date },
    companyName: { type: String },
  },
  { timestamps: true }
);

InvoiceSchema.index({ userId: 1, issuedAt: -1 });
InvoiceSchema.index({ invoiceNumber: 1 });

const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export default Invoice;
