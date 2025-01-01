import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  iconBg: string;
}

export function StatsCard({
  title,
  value,
  trend,
  icon,
  iconBg,
}: StatsCardProps) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
      }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/60">{title}</p>
          <p className="text-2xl font-semibold text-white mt-1">{value}</p>
        </div>
        <div className={`${iconBg} p-3 rounded-xl`}>{icon}</div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <ArrowTrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
        <span className="text-green-400">{trend}</span>
        <span className="text-white/40 ml-1.5">vs last week</span>
      </div>
    </motion.div>
  );
}
