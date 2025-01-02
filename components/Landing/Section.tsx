import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'host';
}

export default function Section({
  children,
  className = '',
  variant = 'default',
}: SectionProps) {
  const baseClasses = 'flex-1 backdrop-blur-2xl p-6 rounded-lg';
  const variantClasses =
    variant === 'host' ? 'bg-orange-100/10' : 'bg-white/10';

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
}
