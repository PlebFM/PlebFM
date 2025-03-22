'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  CreditCardIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import BitcoinLogo from '../../public/bitcoin-logo.svg';
import { type Plan } from '../../models/Subscription';
import { CurrentPlanCard } from '../Billing/CurrentPlanCard';
import { PaymentMethodCard } from '../Billing/PaymentMethodCard';
import { BillingHistoryItem } from '../Billing/BillingHistoryItem';

interface BillingHistory {
  id: string;
  number?: string;
  date: string;
  formattedDate?: string;
  amount: number;
  formattedAmount?: string;
  status: string;
  description: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  receiptUrl?: string;
  pdfUrl?: string;
  paymentMethod?: string;
}

interface BillingHistoryResponse {
  invoices: BillingHistory[];
  hasMore: boolean;
  lastInvoiceId: string | null;
}

type BillingSettingsProps = {
  status: string;
  currentPlan: Plan;
};

type StatusFilter = 'all' | 'paid' | 'pending' | 'failed';

export function BillingSettings({ status, currentPlan }: BillingSettingsProps) {
  // Subscription management
  const [isLoading, setIsLoading] = useState(false);
  const [nextBillingDate] = useState('December 1, 2023');

  // Billing history state
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [hasMoreInvoices, setHasMoreInvoices] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchBillingHistory = useCallback(
    async (startingAfter?: string) => {
      // If loading more pages, don't reset the existing history
      if (!startingAfter) {
        setIsLoadingHistory(true);
      }

      try {
        // Build query params
        const params = new URLSearchParams();
        if (startingAfter) params.append('startingAfter', startingAfter);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        params.append('limit', '10');

        const url = `/api/billing/history?${params.toString()}`;
        const res = await fetch(url);

        const data: BillingHistoryResponse = await res.json();

        if (!res.ok) throw new Error(res.statusText);

        // If loading more, append to existing history; otherwise replace
        if (startingAfter) {
          setBillingHistory(prev => [...prev, ...data.invoices]);
        } else {
          setBillingHistory(data.invoices);
        }

        setHasMoreInvoices(data.hasMore);
        setLastInvoiceId(data.lastInvoiceId);
      } catch (error) {
        console.error('Failed to fetch billing history:', error);
        toast.error('Failed to load billing history');
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [statusFilter],
  );

  // Load initial billing history
  useEffect(() => {
    // Only fetch billing history for paid plans
    if (currentPlan && currentPlan.id !== 'free') {
      fetchBillingHistory();
    } else {
      setIsLoadingHistory(false);
    }
  }, [currentPlan, statusFilter, fetchBillingHistory]);

  // Handle subscription status messages
  useEffect(() => {
    if (status === 'success') {
      toast.success('Successfully subscribed!');
    } else if (status === 'canceled') {
      toast.error('Subscription canceled.');
    }
  }, [status]);

  const handleLoadMore = () => {
    if (lastInvoiceId) {
      fetchBillingHistory(lastInvoiceId);
    }
  };

  const handleFilterChange = (newFilter: StatusFilter) => {
    if (newFilter !== statusFilter) {
      setStatusFilter(newFilter);
    }
  };

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

  const handleDownload = (item: BillingHistory, type: 'receipt' | 'pdf') => {
    if (type === 'receipt' && item.receiptUrl) {
      window.open(item.receiptUrl, '_blank');
    } else if (type === 'pdf' && item.pdfUrl) {
      window.open(item.pdfUrl, '_blank');
    } else {
      toast.error('Download URL not available');
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
          <div className="flex flex-wrap items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Billing History
            </h3>

            {currentPlan?.id !== 'free' && (
              <div className="flex gap-2 mt-2 sm:mt-0">
                <div className="bg-white/5 text-white rounded-md">
                  <div className="relative inline-flex border rounded-md border-white/10">
                    <button
                      onClick={() => handleFilterChange('all')}
                      className={`px-3 py-1.5 text-sm ${
                        statusFilter === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'text-white/60 hover:text-white'
                      } rounded-l-md transition-colors`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleFilterChange('paid')}
                      className={`px-3 py-1.5 text-sm ${
                        statusFilter === 'paid'
                          ? 'bg-purple-600 text-white'
                          : 'text-white/60 hover:text-white'
                      } transition-colors`}
                    >
                      Paid
                    </button>
                    <button
                      onClick={() => handleFilterChange('pending')}
                      className={`px-3 py-1.5 text-sm ${
                        statusFilter === 'pending'
                          ? 'bg-purple-600 text-white'
                          : 'text-white/60 hover:text-white'
                      } transition-colors`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleFilterChange('failed')}
                      className={`px-3 py-1.5 text-sm ${
                        statusFilter === 'failed'
                          ? 'bg-purple-600 text-white'
                          : 'text-white/60 hover:text-white'
                      } rounded-r-md transition-colors`}
                    >
                      Failed
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => fetchBillingHistory()}
                  className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Refresh"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {currentPlan?.id === 'free' ? (
            <p className="text-white/60 text-center py-4">
              Billing history is available for paid plans only
            </p>
          ) : isLoadingHistory && billingHistory.length === 0 ? (
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
                  id={item.id}
                  number={item.number}
                  description={item.description}
                  date={item.date}
                  formattedDate={item.formattedDate}
                  amount={item.amount}
                  formattedAmount={item.formattedAmount}
                  status={item.status}
                  periodStart={item.periodStart}
                  periodEnd={item.periodEnd}
                  receiptUrl={item.receiptUrl}
                  pdfUrl={item.pdfUrl}
                  paymentMethod={item.paymentMethod}
                  onDownload={type => handleDownload(item, type)}
                />
              ))}

              {hasMoreInvoices && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-md transition-colors flex items-center gap-2"
                    disabled={isLoadingHistory}
                  >
                    {isLoadingHistory ? 'Loading...' : 'Load More'}
                    {isLoadingHistory && (
                      <span className="animate-spin inline-block w-4 h-4 border-t-2 border-white rounded-full" />
                    )}
                  </button>
                </div>
              )}
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
