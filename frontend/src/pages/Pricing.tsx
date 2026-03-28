import React, { useState } from 'react';
import { Button } from '../components/shared/Button';
import axios from '../services/api/config';

const Pricing = () => {
  const [interval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['5 Employees', '50 Products', '100 MB Storage', 'Basic Support'],
      buttonText: 'Current Plan',
    },
    {
      id: 'starter',
      name: 'Starter',
      price: interval === 'monthly' ? 999 : 9990,
      features: ['25 Employees', '500 Products', '1 GB Storage', 'Reports'],
      buttonText: 'Subscribe',
    },
    {
      id: 'professional',
      name: 'Professional',
      price: interval === 'monthly' ? 2999 : 29990,
      features: ['100 Employees', '5000 Products', '10 GB Storage', 'API Access', 'Priority Support'],
      buttonText: 'Subscribe',
      isPopular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: interval === 'monthly' ? 9999 : 99990,
      features: ['Unlimited Employees', 'Unlimited Products', 'Unlimited Storage', 'Custom Branding', 'SSO Login'],
      buttonText: 'Subscribe',
    },
  ];

  const handleSubscribe = async (planId: string, gateway: string) => {
    try {
      if (planId === 'free') return;
      
      const { data } = await axios.post('/api/subscription/create-order', {
        planId,
        gateway,
        interval
      });

      if (gateway === 'razorpay') {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY || 'dummy_key',
          amount: data.data.amount,
          currency: data.data.currency,
          name: 'Manufacturing MSME',
          description: `${planId} Subscription`,
          order_id: data.data.orderId,
          handler: async (response: any) => {
            const verifyRes = await axios.post('/api/subscription/verify', {
              ...response,
              gateway: 'razorpay',
              planId,
              interval
            });
            if (verifyRes.data.success) {
              alert('Payment successful!');
              window.location.href = '/dashboard';
            }
          },
        };
        const rzp1 = new (window as any).Razorpay(options);
        rzp1.open();
      } else if (gateway === 'dodo') {
        // Dodo implementation mockup
        alert('Dodo Payment Mockup Success');
      }
    } catch (error) {
      console.error(error);
      alert('Subscription failed');
    }
  };

  return (
    <div className="py-12 bg-gray-50 flex flex-col justify-center sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Pricing Plans</h2>
          <p className="mt-4 text-lg text-gray-600">Choose the right plan for your manufacturing business.</p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="relative flex w-64 rounded-full bg-gray-200 p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`relative w-1/2 whitespace-nowrap rounded-full py-2 text-sm font-medium ${interval === 'monthly' ? 'bg-white shadow' : 'text-gray-700'}`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`relative w-1/2 whitespace-nowrap rounded-full py-2 text-sm font-medium ${interval === 'yearly' ? 'bg-white shadow' : 'text-gray-700'}`}
            >
              Yearly billing (-20%)
            </button>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-4">
          {plans.map((plan) => (
            <div key={plan.id} className={`divide-y divide-gray-200 rounded-lg border ${plan.isPopular ? 'border-blue-500 shadow-xl' : 'border-gray-200 shadow-sm'} bg-white`}>
              <div className="p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{plan.name}</h3>
                {plan.isPopular && <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">Popular</span>}
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/{interval === 'monthly' ? 'mo' : 'yr'}</span>
                </p>
                <div className="mt-8 flex flex-col gap-2">
                  <Button 
                    onClick={() => handleSubscribe(plan.id, 'razorpay')}
                    disabled={plan.id === 'free'}
                    className="w-full"
                  >
                    Subscribe via Razorpay
                  </Button>
                  <Button 
                    onClick={() => handleSubscribe(plan.id, 'dodo')}
                    disabled={plan.id === 'free'}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Subscribe via Dodo Payments
                  </Button>
                </div>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-gray-900">What's included</h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
