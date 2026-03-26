export interface PlanFeatures {
  employees: number;
  products: number;
  storage: number; // MB
  reports: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  advancedAnalytics: boolean;
  multiLocation: boolean;
  ssoLogin: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number; // INR
  yearlyPrice: number;  // INR
  currency: string;
  features: PlanFeatures;
  // Razorpay Plan IDs (set these after creating plans in Razorpay dashboard)
  razorpayMonthlyPlanId?: string;
  razorpayYearlyPlanId?: string;
  // Dodo Plan IDs
  dodoMonthlyPlanId?: string;
  dodoYearlyPlanId?: string;
  trialDays: number;
  isPopular?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'INR',
    features: {
      employees: 5,
      products: 50,
      storage: 100,
      reports: false,
      apiAccess: false,
      prioritySupport: false,
      customBranding: false,
      advancedAnalytics: false,
      multiLocation: false,
      ssoLogin: false,
    },
    trialDays: 0,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Great for small businesses & MSMEs',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    currency: 'INR',
    features: {
      employees: 25,
      products: 500,
      storage: 1000,
      reports: true,
      apiAccess: false,
      prioritySupport: false,
      customBranding: false,
      advancedAnalytics: false,
      multiLocation: false,
      ssoLogin: false,
    },
    trialDays: 14,
    razorpayMonthlyPlanId: process.env.RAZORPAY_STARTER_MONTHLY_PLAN_ID,
    razorpayYearlyPlanId: process.env.RAZORPAY_STARTER_YEARLY_PLAN_ID,
    dodoMonthlyPlanId: process.env.DODO_STARTER_MONTHLY_PLAN_ID,
    dodoYearlyPlanId: process.env.DODO_STARTER_YEARLY_PLAN_ID,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing businesses',
    monthlyPrice: 2999,
    yearlyPrice: 29990,
    currency: 'INR',
    features: {
      employees: 100,
      products: 5000,
      storage: 10000,
      reports: true,
      apiAccess: true,
      prioritySupport: true,
      customBranding: true,
      advancedAnalytics: true,
      multiLocation: false,
      ssoLogin: false,
    },
    trialDays: 14,
    isPopular: true,
    razorpayMonthlyPlanId: process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID,
    razorpayYearlyPlanId: process.env.RAZORPAY_PRO_YEARLY_PLAN_ID,
    dodoMonthlyPlanId: process.env.DODO_PRO_MONTHLY_PLAN_ID,
    dodoYearlyPlanId: process.env.DODO_PRO_YEARLY_PLAN_ID,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large-scale manufacturing operations',
    monthlyPrice: 9999,
    yearlyPrice: 99990,
    currency: 'INR',
    features: {
      employees: -1, // unlimited
      products: -1,
      storage: -1,
      reports: true,
      apiAccess: true,
      prioritySupport: true,
      customBranding: true,
      advancedAnalytics: true,
      multiLocation: true,
      ssoLogin: true,
    },
    trialDays: 30,
    razorpayMonthlyPlanId: process.env.RAZORPAY_ENT_MONTHLY_PLAN_ID,
    razorpayYearlyPlanId: process.env.RAZORPAY_ENT_YEARLY_PLAN_ID,
    dodoMonthlyPlanId: process.env.DODO_ENT_MONTHLY_PLAN_ID,
    dodoYearlyPlanId: process.env.DODO_ENT_YEARLY_PLAN_ID,
  },
};

export const getPlanById = (planId: string): Plan | null => {
  return SUBSCRIPTION_PLANS[planId] || null;
};

export const getPlanLimits = (planId: string) => {
  const plan = getPlanById(planId);
  if (!plan) return SUBSCRIPTION_PLANS.free.features;
  return plan.features;
};
