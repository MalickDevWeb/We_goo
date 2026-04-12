import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, CheckCircle2, Clock, Truck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WegoMap, { packageIcon, pickupIcon, destinationIcon } from '@/components/WegoMap';
import type { MapMarker } from '@/components/WegoMap';

const ORIGIN: [number, number] = [-34.6158, -58.4333];
const DESTINATION: [number, number] = [-34.5725, -58.4167];
const CURRENT: [number, number] = [-34.5950, -58.4250];

const generateRoute = (from: [number, number], to: [number, number], steps = 15): [number, number][] => {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push([
      from[0] + (to[0] - from[0]) * t + Math.sin(t * Math.PI) * 0.003,
      from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * 0.004,
    ]);
  }
  return points;
};

interface TrackingStep {
  icon: typeof Package;
  label: string;
  time: string;
  done: boolean;
  active: boolean;
}

const PackageTracking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0.45);

  const route = generateRoute(ORIGIN, DESTINATION);

  // Simulate movement
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 0.003, 1));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const currentIndex = Math.floor(progress * (route.length - 1));
  const packagePos = route[currentIndex];

  const markers: MapMarker[] = [
    { key: 'origin', position: ORIGIN, icon: pickupIcon },
    { key: 'destination', position: DESTINATION, icon: destinationIcon },
    { key: 'package', position: packagePos, icon: packageIcon },
  ];

  const steps: TrackingStep[] = [
    { icon: Package, label: t('user.package.title'), time: '09:30', done: true, active: false },
    { icon: CheckCircle2, label: 'Recogido', time: '10:15', done: true, active: false },
    { icon: Truck, label: 'En tránsito', time: '10:45', done: false, active: true },
    { icon: MapPin, label: 'Entregado', time: '--:--', done: false, active: false },
  ];

  return (
    <div className="h-screen bg-background flex flex-col relative">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-[1000] safe-top">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center tap-target"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Tracking number overlay */}
      <div className="absolute top-4 right-4 z-[1000] safe-top">
        <div className="glass-strong rounded-2xl px-4 py-2">
          <p className="text-[10px] text-muted-foreground">TRACKING</p>
          <p className="text-sm font-bold text-foreground tracking-wider">WG-2025-0412</p>
        </div>
      </div>

      {/* Map */}
      <div className="h-[55%]">
        <WegoMap
          markers={markers}
          routePoints={route}
          routeColor="#94c679"
        />
      </div>

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="flex-1 glass-strong rounded-t-3xl p-6 safe-bottom relative z-[1000] overflow-y-auto"
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-5" />

        {/* Package info */}
        <div className="glass rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-accent2/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-accent2" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Paquete #WG-2025-0412</p>
              <p className="text-xs text-muted-foreground">Documentos · 0.5 kg</p>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-muted-foreground">{t('user.booking.pickup')}</p>
              <p className="text-foreground font-medium">Av. Rivadavia 5200</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">{t('user.booking.destination')}</p>
              <p className="text-foreground font-medium">Av. Cabildo 1900</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="space-y-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-start gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    step.done ? 'bg-accent2/20' : step.active ? 'bg-accent/20 animate-pulse' : 'bg-muted'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      step.done ? 'text-accent2' : step.active ? 'text-accent' : 'text-muted-foreground'
                    }`} />
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 h-10 ${step.done ? 'bg-accent2/40' : 'bg-muted'}`} />
                  )}
                </div>

                {/* Content */}
                <div className="pt-1 pb-3">
                  <p className={`text-sm font-medium ${step.active ? 'text-accent' : step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.time}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ETA */}
        <div className="glass rounded-xl p-4 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">{t('user.booking.eta')}</span>
          </div>
          <span className="font-bold text-foreground">~25 min</span>
        </div>
      </motion.div>
    </div>
  );
};

export default PackageTracking;
