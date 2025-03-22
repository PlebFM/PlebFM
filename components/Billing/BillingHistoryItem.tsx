import { useState } from 'react';
import {
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentArrowDownIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import {
  CurrencyDollarIcon,
  ReceiptRefundIcon,
} from '@heroicons/react/24/solid';

interface BillingHistoryItemProps {
  id: string;
  number?: string;
  description: string;
  date: string;
  formattedDate?: string;
  amount: number;
  formattedAmount?: string;
  status: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  receiptUrl?: string;
  pdfUrl?: string;
  paymentMethod?: string;
  onDownload: (type: 'receipt' | 'pdf') => void;
}

export function BillingHistoryItem({
  id,
  number,
  description,
  date,
  formattedDate,
  amount,
  formattedAmount,
  status,
  periodStart,
  periodEnd,
  receiptUrl,
  pdfUrl,
  paymentMethod,
  onDownload,
}: BillingHistoryItemProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-400/10 text-green-400';
      case 'pending':
        return 'bg-orange-400/10 text-orange-400';
      case 'failed':
        return 'bg-red-400/10 text-red-400';
      case 'void':
        return 'bg-gray-400/10 text-gray-400';
      default:
        return 'bg-blue-400/10 text-blue-400';
    }
  };

  const displayDate = formattedDate || date;
  const displayAmount = formattedAmount
    ? `$${formattedAmount}`
    : `$${(amount / 100).toFixed(2)}`;

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden transition-all duration-200 bg-white/5 hover:bg-white/10">
      <div
        className="flex items-center justify-between py-4 px-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="h-6 w-6 text-white/60" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white font-medium">{description}</p>
              {number && (
                <span className="text-xs text-white/40">#{number}</span>
              )}
            </div>
            <p className="text-sm text-white/60">{displayDate}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-white font-medium">{displayAmount}</span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
              status,
            )}`}
          >
            {status}
          </span>
          {expanded ? (
            <ChevronUpIcon className="h-5 w-5 text-white/60" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-white/60" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-white/10">
          <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
            {paymentMethod && (
              <div className="flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4 text-white/60" />
                <span className="text-white/60">Payment Method:</span>
                <span className="text-white capitalize">{paymentMethod}</span>
              </div>
            )}

            {periodStart && periodEnd && (
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="h-4 w-4 text-white/60" />
                <span className="text-white/60">Billing Period:</span>
                <span className="text-white">
                  {periodStart} - {periodEnd}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            {receiptUrl && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDownload('receipt');
                }}
                className="flex items-center gap-1 text-sm px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-md transition-colors"
              >
                <ReceiptRefundIcon className="h-4 w-4" />
                View Receipt
              </button>
            )}

            {pdfUrl && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDownload('pdf');
                }}
                className="flex items-center gap-1 text-sm px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-md transition-colors"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                Download PDF
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
