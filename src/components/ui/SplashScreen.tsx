import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[#1B2A4A] flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <motion.div 
          className="w-24 h-24 mb-6 relative"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <img src="/favicon.svg" alt="PerfX Logo" className="w-full h-full object-contain drop-shadow-2xl" />
        </motion.div>
        
        <motion.h1
          className="text-white font-extrabold text-5xl tracking-tight"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
        >
          PerfX
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}
