import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface PlanFeaturesProps {
  features: string[];
}

export function PlanFeatures({ features }: PlanFeaturesProps) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center space-x-2">
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
          <span className="text-white/60">{feature}</span>
        </div>
      ))}
    </div>
  );
}
