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
    <div className="h-[100svh] bg-background flex flex-col relative overflow-hidden">
      {/* Back button overlay */}
      <div className="absolute top-4 left-4 z-[1000] safe-top">
        <button
          onClick={() => navigate('/user/dashboard')}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center tap-target shadow-lg"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* ETA overlay */}
      <div className="absolute top-4 right-4 z-[1000] safe-top">
        <div className="glass-strong rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
          <Navigation className="w-4 h-4 text-accent" />
          <span className="text-sm font-bold text-foreground">
            {Math.ceil(etaMin)} min
          </span>
        </div>
      </div>

      {/* Progress bar overlay */}
      <div className="absolute top-16 left-4 right-4 z-[1000] safe-top">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden backdrop-blur-md">
          <motion.div
            className="h-full rounded-full gradient-accent"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        <WegoMap
          markers={markers}
          routePoints={route}
          routeColor="#e62057"
        />
      </div>

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="glass-strong rounded-t-[32px] safe-bottom relative z-[1000] max-h-[70vh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-white/5"
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto my-3 shrink-0" />
        
        <div className="overflow-y-auto px-6 pb-6 no-scrollbar">
          {/* Status */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-3 h-3 rounded-full ${progress >= 0.95 ? 'bg-accent2 shadow-[0_0_10px_#94c679]' : 'bg-accent animate-pulse shadow-[0_0_10px_#e62057]'}`} />
            <div>
              <h3 className="font-extrabold text-foreground text-lg">{t('user.tracking.status')}</h3>
              <p className="text-sm text-accent font-semibold">{statusText}</p>
            </div>
          </div>

          {/* Driver Info */}
          <div className="glass rounded-2xl p-4 flex items-center gap-4 mb-6 border border-white/5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shrink-0 border border-accent/10">
              <span className="font-bold text-accent text-xl">RS</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-base">Roberto Sánchez</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Toyota Corolla · <span className="text-foreground">ABC-123</span></p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                  <span className="text-xs text-accent font-bold">⭐ 4.8</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">230 {t('driver.dashboard.rides')}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 py-4 rounded-2xl bg-white/5 text-foreground text-sm font-bold tap-target flex items-center justify-center gap-2 transition-all active:scale-[0.97] hover:bg-white/10 active:bg-white/15 border border-white/5 shadow-sm">
              <Phone className="w-4 h-4 text-accent" />
              {t('user.tracking.call')}
            </button>
            <button className="flex-1 py-4 rounded-2xl bg-white/5 text-foreground text-sm font-bold tap-target flex items-center justify-center gap-2 transition-all active:scale-[0.97] hover:bg-white/10 active:bg-white/15 border border-white/5 shadow-sm">
              <MessageCircle className="w-4 h-4 text-accent" />
              {t('user.tracking.message')}
            </button>
            <button className="py-4 px-5 rounded-2xl bg-white/5 text-foreground tap-target flex items-center justify-center transition-all active:scale-[0.97] hover:bg-white/10 active:bg-white/15 border border-white/5 shadow-sm" aria-label="Share">
              <Share2 className="w-4 h-4 text-accent" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserTracking;
