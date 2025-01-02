import { motion } from 'framer-motion';

export default function CompleteStep() {
  return (
    <div className="space-y-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-16 h-16 mx-auto bg-orange-300/20 rounded-full flex items-center justify-center"
      >
        <div className="w-12 h-12 bg-orange-300/40 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-orange-300 rounded-full" />
        </div>
      </motion.div>
      <p className="text-white/80">
        Your jukebox has been created. Redirecting you to your dashboard...
      </p>
    </div>
  );
}
