import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, MapPin, Wallet } from 'lucide-react';

const slides = [
  { key: 'slide1', icon: Car },
  { key: 'slide2', icon: MapPin },
  { key: 'slide3', icon: Wallet },
];

const OnboardingScreen = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNext = () => {
    if (current < slides.length - 1) setCurrent(c => c + 1);
    else navigate('/services');
  };

  const handleSkip = () => navigate('/services');

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
      {/* Skip */}
      <div className="flex justify-end p-4">
        <button onClick={handleSkip} className="text-muted-foreground text-sm tap-target px-4 py-2">
          {t('common.skip')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon circle */}
            <div className="w-32 h-32 rounded-full glass flex items-center justify-center mb-10 glow-accent">
              <Icon className="w-14 h-14 text-accent" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-4">
              {t(`onboarding.${slide.key}Title`)}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-xs">
              {t(`onboarding.${slide.key}Desc`)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators + Button */}
      <div className="px-8 pb-8">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="tap-target flex items-center justify-center"
              aria-label={`Slide ${i + 1}`}
            >
              <div className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-accent' : 'w-2 bg-muted-foreground/30'}`} />
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold text-lg tap-target transition-transform active:scale-[0.98]"
        >
          {current === slides.length - 1 ? t('onboarding.getStarted') : t('common.next')}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
