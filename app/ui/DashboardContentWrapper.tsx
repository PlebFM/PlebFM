import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Plan, Subscription } from '../../models/Subscription';

type MarginSize = 'small' | 'medium' | 'large';

const marginSizes: Record<MarginSize, string> = {
  small: 'max-w-7xl',
  medium: 'max-w-6xl',
  large: 'max-w-5xl',
};

interface ContentWrapperProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  margin?: MarginSize;
}

export interface DashboardPageProps {
  queueData: any[];
  subscription: Subscription | null;
  currentPlan: Plan | null;
}

export function DashboardContentWrapper({
  children,
  title,
  subtitle,
  margin = 'medium',
}: ContentWrapperProps) {
  return (
    <main className={`${marginSizes[margin]} w-full mx-auto px-4 py-8 flex-1`}>
      <div className="min-h-[calc(100vh-16rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-white/60 mt-2 mb-8">{subtitle}</p>}
          {children}
        </motion.div>
      </div>
    </main>
  );
}
