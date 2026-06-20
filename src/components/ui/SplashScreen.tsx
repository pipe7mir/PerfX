import { motion } from 'framer-motion';
import { PerfxLogo } from '../../assets/PerfxLogo';

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[#1B2A4A] flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
    >
      <PerfxLogo variant="intro" />
    </motion.div>
  );
}
