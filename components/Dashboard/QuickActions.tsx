import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  ForwardIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline';

interface QuickActionsProps {
  onSkip: () => void;
  onManageQueue: () => void;
}

const ActionButton = memo(function ActionButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white rounded-xl p-4 transition-colors"
    >
      {icon}
      <span>{children}</span>
    </button>
  );
});

export const QuickActions = memo(function QuickActions({
  onSkip,
  onManageQueue,
}: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        <ActionButton
          onClick={onSkip}
          icon={<ForwardIcon className="h-5 w-5" />}
        >
          Skip Song
        </ActionButton>
        <ActionButton
          onClick={onManageQueue}
          icon={<QueueListIcon className="h-5 w-5" />}
        >
          Manage Queue
        </ActionButton>
      </div>
    </motion.div>
  );
});
