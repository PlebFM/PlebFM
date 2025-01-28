import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import {
  DashboardLayout,
  getServerSidePropsForDashboard,
  type DashboardPageProps,
} from '../../components/Dashboard/HostDashboardLayout';
import { PLANS } from '../../models/Subscription';

export default function HostPlans({ host, currentPlan }: DashboardPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, paymentMethod: 'stripe' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!host) return null;

  return (
    <DashboardLayout
      host={host}
      title="Plans & Pricing"
      subtitle="Choose the plan that's right for you."
      margin="large"
      hideHeader={true}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map(plan => {
          const isCurrentPlan = currentPlan?.id === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative bg-white/5 rounded-lg p-6 border transition-colors ${
                isCurrentPlan
                  ? 'border-white/30'
                  : 'border-white/10 hover:border-white/20'
              } flex flex-col`}
            >
              {isCurrentPlan && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-white/10 rounded-md">
                  <span className="text-xs text-white/60">Current Plan</span>
                </div>
              )}
              <h2 className="text-xl font-bold text-white mt-2">{plan.name}</h2>
              <div className="mt-2 mb-6">
                <p className="text-3xl font-bold text-white">
                  ${(plan.price / 100).toFixed(2)}
                  <span className="text-lg text-white/60 font-normal">
                    /month
                  </span>
                </p>
              </div>

              <ul className="space-y-3 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isLoading || isCurrentPlan}
                className={`mt-6 w-full py-2 px-4 rounded-md transition-colors ${
                  plan.tier === 'pro'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                } disabled:opacity-50`}
              >
                {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = getServerSidePropsForDashboard;
