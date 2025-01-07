import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface BillingHistoryItemProps {
  description: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  onDownload: () => void;
}

export function BillingHistoryItem({
  description,
  date,
  amount,
  status,
  onDownload,
}: BillingHistoryItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10">
      <div className="flex items-center space-x-3">
        <DocumentTextIcon className="h-6 w-6 text-white/60" />
        <div>
          <p className="text-white">{description}</p>
          <p className="text-sm text-white/60">{date}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-white">${(amount / 100).toFixed(2)}</span>
        <span className="px-2 py-1 text-xs rounded-full bg-green-400/10 text-green-400">
          {status}
        </span>
        <button
          onClick={onDownload}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          Download
        </button>
      </div>
    </div>
  );
}
