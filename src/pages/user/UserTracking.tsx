import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Share2, ArrowLeft, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WegoMap, { carIcon, pickupIcon, destinationIcon } from '@/components/WegoMap';
import type { MapMarker } from '@/components/WegoMap';

// Buenos Aires mock coordinates
const PICKUP: [number, number] = [-34.6037, -58.3816];
const DESTINATION: [number, number] = [-34.5875, -58.4108];

// Interpolate between two points
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Generate a curved route between two points
const generateRoute = (from: [number, number], to: [number, number], steps = 20): [number, number][] => {
  const points: [number, number][] = [];
  const midLat = (from[0] + to[0]) / 2 + 0.003;
  const midLng = (from[1] + to[1]) / 2 - 0.005;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = t < 0.5
      ? lerp(from[0], midLat, t * 2)
      : lerp(midLat, to[0], (t - 0.5) * 2);
    const lng = t < 0.5
      ? lerp(from[1], midLng, t * 2)
      : lerp(midLng, to[1], (t - 0.5) * 2);
    points.push([lat, lng]);
  }
  return points;
};

const UserTracking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [etaMin, setEtaMin] = useState(8);

  const route = generateRoute(PICKUP, DESTINATION);

  // Simulate driver movement
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 1) { clearInterval(interval); return 1; }
        return Math.min(p + 0.008, 1);
      });
      setEtaMin(prev => Math.max(0, prev - 0.05));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const currentIndex = Math.floor(progress * (route.length - 1));
  const driverPos = route[currentIndex];

  const statusText = progress < 0.15
    ? t('user.tracking.arriving')
    : progress < 0.95
    ? t('user.tracking.inProgress')
    : t('user.tracking.completed');

  const markers: MapMarker[] = [
    { key: 'pickup', position: PICKUP, icon: pickupIcon },
    { key: 'destination', position: DESTINATION, icon: destinationIcon },
    { key: 'driver', position: driverPos, icon: carIcon },
  ];

  return (
    <div className="h-screen bg-background flex flex-col relative">
      {/* Back button overlay */}
      <div className="absolute top-4 left-4 z-[1000] safe-top">
        <button
          onClick={() => navigate('/user/dashboard')}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center tap-target"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* ETA overlay */}
      <div className="absolute top-4 right-4 z-[1000] safe-top">
        <div className="glass-strong rounded-2xl px-4 py-2 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-foreground">
            {Math.ceil(etaMin)} min
          </span>
        </div>
      </div>

      {/* Progress bar overlay */}
      <div className="absolute top-16 left-4 right-4 z-[1000] safe-top">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-accent"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <WegoMap
          markers={markers}
          routePoints={route}
          routeColor="#e62057"
        />
      </div>

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: 200 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="glass-strong rounded-t-3xl p-6 safe-bottom relative z-[1000]"
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
        
        {/* Status */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${progress >= 0.95 ? 'bg-accent2' : 'bg-accent animate-pulse'}`} />
          <div>
            <h3 className="font-semibold text-foreground">{t('user.tracking.status')}</h3>
            <p className="text-sm text-accent">{statusText}</p>
          </div>
        </div>

        {/* Driver Info */}
        <div className="glass rounded-2xl p-4 flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <span className="font-bold text-accent text-lg">RS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">Roberto Sánchez</p>
            <p className="text-xs text-muted-foreground">Toyota Corolla · ABC-123</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-accent">⭐ 4.8</span>
              <span className="text-xs text-muted-foreground">· 230 {t('driver.dashboard.rides')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 py-3.5 rounded-xl bg-secondary text-foreground text-sm font-medium tap-target flex items-center justify-center gap-2 transition-all active:scale-[0.97]">
            <Phone className="w-4 h-4 text-accent" />
            {t('user.tracking.call')}
          </button>
          <button className="flex-1 py-3.5 rounded-xl bg-secondary text-foreground text-sm font-medium tap-target flex items-center justify-center gap-2 transition-all active:scale-[0.97]">
            <MessageCircle className="w-4 h-4 text-accent" />
            {t('user.tracking.message')}
          </button>
          <button className="py-3.5 px-5 rounded-xl bg-secondary text-foreground tap-target flex items-center justify-center transition-all active:scale-[0.97]">
            <Share2 className="w-4 h-4 text-accent" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserTracking;
