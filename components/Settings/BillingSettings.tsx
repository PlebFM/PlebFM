'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import BitcoinLogo from '../../public/bitcoin-logo.svg';
import { PLANS, type Plan } from '../../models/Subscription';
import { CurrentPlanCard } from '../Billing/CurrentPlanCard';
import { PaymentMethodCard } from '../Billing/PaymentMethodCard';
import { BillingHistoryItem } from '../Billing/BillingHistoryItem';

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

interface BillingSettingsProps {
  hostId: string;
}

export function BillingSettings({ hostId }: BillingSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan] = useState<Plan>(PLANS[1]); // Pro plan
  const [nextBillingDate] = useState('December 1, 2023');
  const [billingHistory] = useState<BillingHistory[]>([
    {
      id: '1',
      date: 'Nov 1, 2023',
      amount: 2900,
      status: 'paid',
      description: 'Pro Plan - Monthly',
    },
    {
      id: '2',
      date: 'Oct 1, 2023',
      amount: 2900,
      status: 'paid',
      description: 'Pro Plan - Monthly',
    },
  ]);

  useEffect(() => {
    if (router.query.success) {
      toast.success('Successfully subscribed!');
    } else if (router.query.canceled) {
      toast.error('Subscription canceled.');
    }
  }, [router.query]);

  const handleSubscribe = async (
    planId: string,
    paymentMethod: 'stripe' | 'bitcoin',
  ) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, paymentMethod }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      if (paymentMethod === 'stripe') {
        window.location.href = data.url;
      } else {
        toast.error('Bitcoin payments coming soon!');
      }
    } catch (error) {
      toast.error('Failed to start subscription process');
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="space-y-6">
        <CurrentPlanCard
          plan={currentPlan}
          nextBillingDate={nextBillingDate}
          onUpgrade={() => handleSubscribe('enterprise', 'stripe')}
          isLoading={isLoading}
        />

        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">
            Payment Methods
          </h3>
          <div className="space-y-4">
            <PaymentMethodCard
              icon={<CreditCardIcon className="h-6 w-6 text-white/60" />}
              title="Credit Card"
              subtitle="Powered by Stripe"
              buttonText="Update"
              onClick={() => handleSubscribe(currentPlan.id, 'stripe')}
              disabled={isLoading}
            />
            <PaymentMethodCard
              icon={
                <Image src={BitcoinLogo} alt="Bitcoin" className="h-6 w-6" />
              }
              title="Bitcoin"
              subtitle="Coming soon"
              buttonText="Set up"
              onClick={() => handleSubscribe(currentPlan.id, 'bitcoin')}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">
            Billing History
          </h3>
          <div className="space-y-4">
            {billingHistory.map(item => (
              <BillingHistoryItem
                key={item.id}
                description={item.description}
                date={item.date}
                amount={item.amount}
                status={item.status}
                onDownload={() => console.log('Download invoice', item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
