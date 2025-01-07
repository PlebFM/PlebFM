import Link from 'next/link';
import { Plan } from '../../models/Subscription';
import { PlanFeatures } from './PlanFeatures';

interface CurrentPlanCardProps {
  plan: Plan;
  nextBillingDate: string;
  onUpgrade: () => void;
  isLoading?: boolean;
}

export function CurrentPlanCard({
  plan,
  nextBillingDate,
  onUpgrade,
  isLoading = false,
}: CurrentPlanCardProps) {
  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-4">Current Plan</h2>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-white">{plan.name}</p>
          <p className="text-white/60">
            ${(plan.price / 100).toFixed(2)}/month
          </p>
          <p className="text-sm text-white/60 mt-2">
            Next billing date: {nextBillingDate}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={onUpgrade}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            Upgrade Plan
          </button>
          <Link
            href="/host/plans"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            View all plans →
          </Link>
        </div>
      </div>
      <PlanFeatures features={plan.features} />
    </div>
  );
}
