'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import BitcoinLogo from '../../public/bitcoin-logo.svg';
import { type Plan } from '../../models/Subscription';
import { CurrentPlanCard } from '../Billing/CurrentPlanCard';
import { PaymentMethodCard } from '../Billing/PaymentMethodCard';
import { BillingHistoryItem } from '../Billing/BillingHistoryItem';

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  receiptUrl?: string;
}

type BillingSettingsProps = {
  status: string;
  currentPlan: Plan;
};

export function BillingSettings({ status, currentPlan }: BillingSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [nextBillingDate] = useState('December 1, 2023');
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    async function fetchBillingHistory() {
      // Skip fetching for free tier
      if (currentPlan.id === 'free') {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const res = await fetch('/api/billing/history');
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setBillingHistory(data.invoices);
      } catch (error) {
        console.error('Failed to fetch billing history:', error);
        toast.error('Failed to load billing history');
      } finally {
        setIsLoadingHistory(false);
      }
    }

    fetchBillingHistory();
  }, [currentPlan.id]);

  useEffect(() => {
    if (status === 'success') {
      toast.success('Successfully subscribed!');
    } else if (status === 'canceled') {
      toast.error('Subscription canceled.');
    }
  }, [status]);

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
          {currentPlan.id === 'free' ? (
            <p className="text-white/60 text-center py-4">
              Billing history is available for paid plans only
            </p>
          ) : isLoadingHistory ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-lg" />
              ))}
            </div>
          ) : billingHistory.length > 0 ? (
            <div className="space-y-4">
              {billingHistory.map(item => (
                <BillingHistoryItem
                  key={item.id}
                  description={item.description}
                  date={item.date}
                  amount={item.amount}
                  status={item.status}
                  onDownload={() => {
                    if (item.receiptUrl) {
                      window.open(item.receiptUrl, '_blank');
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-4">
              No billing history available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
