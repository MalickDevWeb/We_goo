import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import type { UserType } from '@/types';

const slides = [
  { key: 'slide1', imageFile: 'voiture.jpg' },
  { key: 'slide2', imageFile: 'portable.jpg' },
  { key: 'slide3', imageFile: 'sacs.jpg' },
];

const OnboardingScreen = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session } = useAuthStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (session) {
      const redirectMap: Record<UserType, string> = {
        user: '/user/dashboard',
        driver: '/driver/dashboard',
        'admin-stand': '/admin-stand/dashboard',
        'super-admin': '/super-admin/dashboard',
      };
      navigate(redirectMap[session.userType] || '/services', { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    // Only play audio if we are definitely staying on this page (no active session redirect)
    if (audioRef.current && !session) {
      audioRef.current.play().catch(e => console.log('Audio autoplay blocked by browser:', e));
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        audioRef.current?.pause();
      } else if (!session) {
        audioRef.current?.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intervalId = window.setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Ensure the sound stops immediately when leaving the page
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      // Global safety fallback for any other audio elements
      document.querySelectorAll('audio').forEach(a => {
        a.pause();
        a.currentTime = 0;
      });
    };
  }, [session]);

  const handleContinue = () => navigate('/permissions');

  const handleSkip = () => navigate('/permissions');

  const slide = slides[current];
  const bgSrc = encodeURI(`/images/wego/${slide.imageFile}`);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background safe-top safe-bottom">
      {/* Background Audio configured to play only here */}
      <audio ref={audioRef} src="/audio/wego-onboarding.mp3" loop preload="auto" className="hidden" />

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0"
        >
          <motion.img
            src={bgSrc}
            alt={t(`onboarding.${slide.key}Title`)}
            className="absolute inset-0 h-full w-full object-cover"
            loading={current === 0 ? 'eager' : 'lazy'}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1.02 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        </motion.div>
      </AnimatePresence>

      {/* Skip */}
      <div className="absolute right-0 top-0 z-20 p-4">
        <button
          onClick={handleSkip}
          className="rounded-full bg-black/25 px-4 py-2 text-sm text-white/90 backdrop-blur-md ring-1 ring-white/15 tap-target"
        >
          {t('common.skip')}
        </button>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-10">
        <div className="mx-auto w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-white drop-shadow-sm">
            {t(`onboarding.${slide.key}Title`)}
          </h2>
          <p className="mt-3 text-white/80 leading-relaxed">
            {t(`onboarding.${slide.key}Desc`)}
          </p>

          {/* Dots */}
          <div className="mt-7 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="tap-target flex items-center justify-center"
                aria-label={`Slide ${i + 1}`}
              >
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'w-8 bg-white' : 'w-2 bg-white/35'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleContinue}
            className="mt-6 w-full rounded-2xl gradient-accent text-accent-foreground py-4 text-lg font-semibold tap-target transition-transform active:scale-[0.98]"
          >
            {t('common.continue')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
