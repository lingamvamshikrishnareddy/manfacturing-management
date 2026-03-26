import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMySubscription,
  createOrder,
  verifyPayment,
  SubscriptionData,
} from '../services/api/subscriptionAPI';

// ─── Plan definitions ─────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['5 Employees', '50 Products', '100 MB Storage', 'Basic Dashboard', 'Email Support'],
    colorStart: '#64748b',
    colorEnd: '#475569',
    badge: null,
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    features: ['25 Employees', '500 Products', '1 GB Storage', 'Advanced Reports', 'Priority Email'],
    colorStart: '#3b82f6',
    colorEnd: '#2563eb',
    badge: null,
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 2999,
    yearlyPrice: 29990,
    features: [
      '100 Employees',
      '5,000 Products',
      '10 GB Storage',
      'API Access',
      'Analytics Dashboard',
      'Priority Support',
      'Custom Branding',
    ],
    colorStart: '#8b5cf6',
    colorEnd: '#7c3aed',
    badge: 'Most Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 9999,
    yearlyPrice: 99990,
    features: [
      'Unlimited Employees',
      'Unlimited Products',
      'Unlimited Storage',
      'SSO / SAML Login',
      'Multi-location',
      'Dedicated Support',
      'Custom Integration',
    ],
    colorStart: '#f59e0b',
    colorEnd: '#d97706',
    badge: 'Best Value',
  },
];

const PLAN_ORDER = ['free', 'starter', 'professional', 'enterprise'];

function fmt(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function usagePercent(used: number, limit: number) {
  if (limit <= 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
}

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType }

const ToastContainer: React.FC<{ toasts: Toast[]; dismiss: (id: number) => void }> = ({ toasts, dismiss }) => (
  <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
    {toasts.map((t) => (
      <div
        key={t.id}
        onClick={() => dismiss(t.id)}
        style={{
          padding: '12px 20px',
          borderRadius: 10,
          background: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#6366f1',
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          maxWidth: 340,
          animation: 'fadeInUp 0.3s ease',
        }}
      >
        {t.message}
      </div>
    ))}
  </div>
);

// ─── Payment Gateway Modal ────────────────────────────────────────────────────
interface GatewayModalProps {
  planName: string;
  amount: number;
  interval: 'monthly' | 'yearly';
  onSelect: (gateway: 'razorpay' | 'dodo') => void;
  onClose: () => void;
  loading: boolean;
}

const GatewayModal: React.FC<GatewayModalProps> = ({ planName, amount, interval, onSelect, onClose, loading }) => (
  <div
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div style={{
      background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460,
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
        Subscribe to {planName}
      </h2>
      <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>
        {fmt(amount)} / {interval === 'monthly' ? 'month' : 'year'} · Choose your payment method
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          disabled={loading}
          onClick={() => onSelect('razorpay')}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 20px', borderRadius: 12, border: '2px solid #e2e8f0',
            background: loading ? '#f8fafc' : '#fff', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.borderColor = '#7c3aed'); }}
          onMouseLeave={(e) => { (e.currentTarget.style.borderColor = '#e2e8f0'); }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18,
          }}>R</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>Razorpay</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>UPI, Cards, Net Banking, Wallets</div>
          </div>
          {loading && <div style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>Processing…</div>}
        </button>

        <button
          disabled={loading}
          onClick={() => onSelect('dodo')}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 20px', borderRadius: 12, border: '2px solid #e2e8f0',
            background: loading ? '#f8fafc' : '#fff', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.borderColor = '#0ea5e9'); }}
          onMouseLeave={(e) => { (e.currentTarget.style.borderColor = '#e2e8f0'); }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18,
          }}>D</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>Dodo Payments</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>International cards &amp; crypto</div>
          </div>
        </button>
      </div>

      <button onClick={onClose} style={{
        marginTop: 20, width: '100%', padding: '12px', borderRadius: 10,
        border: '1px solid #e2e8f0', background: 'transparent', color: '#64748b',
        cursor: 'pointer', fontSize: 14, fontWeight: 600,
      }}>
        Cancel
      </button>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: number } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    (async () => {
      try {
        const sub = await getMySubscription();
        setSubscription(sub);
      } catch {
        // user may not have a subscription yet
      } finally {
        setLoadingSub(false);
      }
    })();
  }, []);

  const currentPlanIndex = subscription ? PLAN_ORDER.indexOf(subscription.plan) : 0;

  const handleSelect = (planId: string, planName: string, price: number) => {
    if (planId === 'free') return;
    const idx = PLAN_ORDER.indexOf(planId);
    if (subscription && idx <= currentPlanIndex) {
      addToast('You are already on this or a higher plan.', 'info');
      return;
    }
    setSelectedPlan({ id: planId, name: planName, price });
  };

  const handleGatewaySelect = async (gateway: 'razorpay' | 'dodo') => {
    if (!selectedPlan) return;
    setPaymentLoading(true);
    try {
      if (gateway === 'razorpay') {
        const orderData = await createOrder({
          planId: selectedPlan.id,
          gateway: 'razorpay',
          interval: billingInterval,
        });

        if (!orderData) throw new Error('Failed to create order');

        const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY || '';
        if (!razorpayKey) {
          addToast('Razorpay is not configured. Contact support.', 'error');
          setPaymentLoading(false);
          return;
        }

        const options = {
          key: razorpayKey,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Manufacturing MMS',
          description: `${selectedPlan.name} Plan — ${billingInterval}`,
          order_id: orderData.orderId,
          prefill: {},
          theme: { color: '#7c3aed' },
          handler: async (response: any) => {
            try {
              const result = await verifyPayment({
                gateway: 'razorpay',
                planId: selectedPlan.id,
                interval: billingInterval,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (result?.success) {
                addToast('🎉 Payment successful! Subscription activated.', 'success');
                setSelectedPlan(null);
                // Refresh subscription
                const sub = await getMySubscription();
                setSubscription(sub);
              } else {
                addToast(result?.message || 'Payment verification failed.', 'error');
              }
            } catch {
              addToast('Payment verification failed. Contact support.', 'error');
            }
          },
          modal: { ondismiss: () => setPaymentLoading(false) },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          addToast(`Payment failed: ${resp.error?.description || 'Unknown error'}`, 'error');
          setPaymentLoading(false);
        });
        rzp.open();
      } else {
        // Dodo (mock)
        await createOrder({ planId: selectedPlan.id, gateway: 'dodo', interval: billingInterval });
        const result = await verifyPayment({
          gateway: 'dodo',
          planId: selectedPlan.id,
          interval: billingInterval,
          dodo_payment_id: `dodo_mock_${Date.now()}`,
        });
        if (result?.success) {
          addToast('🎉 Dodo payment successful! Subscription activated.', 'success');
          setSelectedPlan(null);
          const sub = await getMySubscription();
          setSubscription(sub);
        } else {
          addToast(result?.message || 'Payment failed.', 'error');
        }
        setPaymentLoading(false);
      }
    } catch (err: any) {
      addToast(err?.response?.data?.message || err?.message || 'Something went wrong.', 'error');
      setPaymentLoading(false);
    }
  };

  // ─── Usage bar ─────────────────────────────────────────────────────────────
  const UsageBar: React.FC<{ label: string; used: number; limit: number; unit?: string }> = ({
    label, used, limit, unit = '',
  }) => {
    const pct = usagePercent(used, limit);
    const color = pct > 85 ? '#ef4444' : pct > 65 ? '#f59e0b' : '#10b981';
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
          <span style={{ color: '#475569', fontWeight: 600 }}>{label}</span>
          <span style={{ color: '#94a3b8' }}>
            {limit === -1 ? 'Unlimited' : `${used}${unit} / ${limit}${unit}`}
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${limit === -1 ? 30 : pct}%`,
            background: color, borderRadius: 99, transition: 'width 0.5s ease',
          }} />
        </div>
      </div>
    );
  };

  const sub = subscription;
  const currentPlan = PLANS.find((p) => p.id === (sub?.plan || 'free'));

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .plan-card { transition: transform 0.2s, box-shadow 0.2s; }
        .plan-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.12) !important; }
      `}</style>

      <ToastContainer toasts={toasts} dismiss={dismissToast} />
      {selectedPlan && (
        <GatewayModal
          planName={selectedPlan.name}
          amount={selectedPlan.price}
          interval={billingInterval}
          onSelect={handleGatewaySelect}
          onClose={() => { setSelectedPlan(null); setPaymentLoading(false); }}
          loading={paymentLoading}
        />
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: 0 }}>Subscription</h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 15 }}>
            Manage your plan, billing, and usage · <button
              onClick={() => navigate('/invoices')}
              style={{ color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15, padding: 0 }}
            >View Invoices →</button>
          </p>
        </div>

        {/* Current plan card */}
        {!loadingSub && sub && (
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            borderRadius: 20, padding: 28, color: '#fff', marginBottom: 36,
            display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start',
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 12, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                Current Plan
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>
                {currentPlan?.name || sub.plan}
              </div>
              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
                Status:{' '}
                <span style={{
                  background: sub.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
                  padding: '2px 8px', borderRadius: 99, fontWeight: 700,
                }}>
                  {sub.status.toUpperCase()}
                </span>
              </div>
              {sub.currentPeriodEnd && (
                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
                  Renews {new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              {sub.amount > 0 && (
                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
                  {fmt(sub.amount, sub.currency)} / {sub.interval}
                </div>
              )}
            </div>

            <div style={{ flex: 2, minWidth: 240, background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontSize: 12, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                Usage
              </div>
              <UsageBar
                label="Employees"
                used={sub.currentUsage?.employees || 0}
                limit={sub.usageLimit?.employees || 5}
              />
              <UsageBar
                label="Products"
                used={sub.currentUsage?.products || 0}
                limit={sub.usageLimit?.products || 50}
              />
              <UsageBar
                label="Storage"
                used={sub.currentUsage?.storage || 0}
                limit={sub.usageLimit?.storage || 100}
                unit=" MB"
              />
            </div>
          </div>
        )}

        {loadingSub && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <div style={{
              width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#7c3aed',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
            }} />
            Loading subscription…
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Billing toggle */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
            {subscription?.plan && subscription.plan !== 'free' ? 'Upgrade Your Plan' : 'Choose a Plan'}
          </h2>
          <div style={{
            display: 'inline-flex', background: '#e2e8f0', borderRadius: 99, padding: 4, gap: 0,
          }}>
            {(['monthly', 'yearly'] as const).map((i) => (
              <button
                key={i}
                onClick={() => setBillingInterval(i)}
                style={{
                  padding: '8px 24px', borderRadius: 99, border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                  background: billingInterval === i ? '#fff' : 'transparent',
                  color: billingInterval === i ? '#7c3aed' : '#64748b',
                  boxShadow: billingInterval === i ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {i === 'monthly' ? 'Monthly' : 'Yearly'}{i === 'yearly' && (
                  <span style={{ marginLeft: 6, fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '1px 6px', borderRadius: 99 }}>-17%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {PLANS.map((plan) => {
            const price = billingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const isCurrentPlan = sub?.plan === plan.id;
            const idx = PLAN_ORDER.indexOf(plan.id);
            const isDowngrade = !!(sub && idx < currentPlanIndex);

            return (
              <div
                key={plan.id}
                className="plan-card"
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  overflow: 'hidden',
                  boxShadow: plan.badge ? '0 8px 32px rgba(124,58,237,0.15)' : '0 2px 16px rgba(0,0,0,0.06)',
                  border: `2px solid ${plan.badge ? '#7c3aed' : isCurrentPlan ? '#10b981' : '#f1f5f9'}`,
                  position: 'relative',
                }}
              >
                {/* Header gradient */}
                <div style={{
                  background: `linear-gradient(135deg, ${plan.colorStart}, ${plan.colorEnd})`,
                  padding: '22px 22px 18px',
                  color: '#fff',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.85 }}>
                        {plan.badge || plan.name}
                      </div>
                      {plan.badge && <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{plan.name}</div>}
                    </div>
                    {isCurrentPlan && (
                      <span style={{
                        background: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 700,
                        padding: '4px 10px', borderRadius: 99, letterSpacing: 0.5,
                      }}>CURRENT</span>
                    )}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <span style={{ fontSize: 36, fontWeight: 800 }}>
                      {price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}
                    </span>
                    {price > 0 && (
                      <span style={{ fontSize: 14, opacity: 0.8, marginLeft: 4 }}>
                        /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div style={{ padding: '18px 22px' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                        <span style={{ color: '#10b981', fontSize: 16, lineHeight: 1 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelect(plan.id, plan.name, price)}
                    disabled={plan.id === 'free' || isCurrentPlan || isDowngrade}
                    style={{
                      width: '100%', padding: '12px', borderRadius: 10,
                      border: 'none', cursor: (plan.id === 'free' || isCurrentPlan || isDowngrade) ? 'not-allowed' : 'pointer',
                      fontWeight: 700, fontSize: 14,
                      background: isCurrentPlan ? '#f0fdf4' : (plan.id === 'free' || isDowngrade) ? '#f1f5f9' : `linear-gradient(135deg, ${plan.colorStart}, ${plan.colorEnd})`,
                      color: isCurrentPlan ? '#16a34a' : (plan.id === 'free' || isDowngrade) ? '#94a3b8' : '#fff',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {isCurrentPlan ? '✓ Current Plan' : plan.id === 'free' ? 'Free Forever' : isDowngrade ? 'Lower Plan' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ note */}
        <p style={{ textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: 13 }}>
          Need help choosing? <a href="mailto:support@mms.com" style={{ color: '#7c3aed' }}>Contact support →</a>
        </p>
      </div>
    </div>
  );
};

export default Subscription;
