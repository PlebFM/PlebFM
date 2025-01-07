import { ReactNode } from 'react';

interface PaymentMethodCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
}

export function PaymentMethodCard({
  icon,
  title,
  subtitle,
  buttonText,
  onClick,
  disabled = false,
}: PaymentMethodCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <p className="text-white">{title}</p>
          <p className="text-sm text-white/60">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
      >
        {buttonText}
      </button>
    </div>
  );
}
