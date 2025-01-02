import Link from 'next/link';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'text';
  className?: string;
  onClick?: () => void;
}

export default function Button({
  children,
  href,
  variant = 'primary',
  className = '',
  onClick,
}: ButtonProps) {
  const baseClasses =
    'block w-full text-center py-3 px-4 rounded-lg transition-colors';

  const variantClasses = {
    primary: 'bg-orange-300/90 hover:bg-orange-300 text-black',
    secondary: 'border border-orange-300/50 hover:border-orange-300',
    text: 'text-orange-300/90 hover:text-orange-300 text-sm',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={combinedClasses}>
      {children}
    </button>
  );
}
