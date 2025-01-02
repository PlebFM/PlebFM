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

export function QuickActions({ onSkip, onManageQueue }: QuickActionsProps) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
      }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onSkip}
          className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white rounded-xl p-4 transition-colors"
        >
          <ForwardIcon className="h-5 w-5" />
          <span>Skip Song</span>
        </button>
        <button
          onClick={onManageQueue}
          className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white rounded-xl p-4 transition-colors"
        >
          <QueueListIcon className="h-5 w-5" />
          <span>Manage Queue</span>
        </button>
      </div>
    </motion.div>
  );
}
