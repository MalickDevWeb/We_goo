import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SplashScreen = () => {
  const [show, setShow] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => navigate('/onboarding'), 500);
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Glow background */}
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full bg-accent/20 blur-[100px]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.6 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
          
          {/* Logo icon */}
          <motion.div
            className="relative z-10 w-28 h-28 rounded-[28px] bg-foreground flex items-center justify-center mb-6 shadow-2xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <span className="text-5xl font-bold text-background tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
              We
            </span>
          </motion.div>

          {/* Brand name */}
          <motion.h1
            className="relative z-10 text-4xl font-bold text-foreground tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <span style={{ fontFamily: 'Georgia, serif' }}>We</span>
            <span className="font-extrabold">go</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="relative z-10 mt-3 text-sm text-muted-foreground italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            {t('splash.tagline')}
          </motion.p>

          {/* Loading dots */}
          <motion.div
            className="relative z-10 flex gap-1.5 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-accent"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
