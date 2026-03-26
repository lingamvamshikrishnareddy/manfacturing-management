import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
    userId: mongoose.Types.ObjectId;
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'trial';
    accountType: 'individual' | 'msme' | 'business';
    // Payment Gateway
    paymentGateway: 'razorpay' | 'dodo' | null;
    razorpaySubscriptionId?: string;
    razorpayCustomerId?: string;
    dodoSubscriptionId?: string;
    dodoCustomerId?: string;
    // Current period
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEnd?: Date;
    // Usage limits
    usageLimit: {
        employees: number;
        products: number;
        storage: number; // in MB
    };
    currentUsage: {
        employees: number;
        products: number;
        storage: number;
    };
    // Billing
    amount: number;
    currency: string;
    interval: 'monthly' | 'yearly';
    cancelAtPeriodEnd: boolean;
    cancelledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema: Schema<ISubscription> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    plan: {
        type: String,
        enum: ['free', 'starter', 'professional', 'enterprise'],
        default: 'free',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'expired', 'trial'],
        default: 'trial',
    },
    accountType: {
        type: String,
        enum: ['individual', 'msme', 'business'],
        default: 'individual',
    },
    paymentGateway: {
        type: String,
        enum: ['razorpay', 'dodo', null],
        default: null,
    },
    razorpaySubscriptionId: { type: String },
    razorpayCustomerId: { type: String },
    dodoSubscriptionId: { type: String },
    dodoCustomerId: { type: String },
    currentPeriodStart: {
        type: Date,
        default: Date.now,
    },
    currentPeriodEnd: {
        type: Date,
        default: () => {
            const d = new Date();
            d.setDate(d.getDate() + 14); // 14 day trial
            return d;
        },
    },
    trialEnd: {
        type: Date,
        default: () => {
            const d = new Date();
            d.setDate(d.getDate() + 14);
            return d;
        },
    },
    usageLimit: {
        employees: { type: Number, default: 5 },
        products: { type: Number, default: 50 },
        storage: { type: Number, default: 100 }, // MB
    },
    currentUsage: {
        employees: { type: Number, default: 0 },
        products: { type: Number, default: 0 },
        storage: { type: Number, default: 0 },
    },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    interval: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    cancelledAt: { type: Date },
}, {
    timestamps: true,
});

SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ plan: 1 });

const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
export default Subscription;
