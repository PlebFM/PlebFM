import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';

export interface Activity {
  id: string;
  type: 'song_added' | 'song_played' | 'song_skipped';
  title: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
      }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-lg font-medium text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="bg-white/5 p-2 rounded-lg">
              <ClockIcon className="h-5 w-5 text-white/70" />
            </div>
            <div>
              <p className="text-sm text-white">{activity.title}</p>
              <p className="text-xs text-white/50">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
