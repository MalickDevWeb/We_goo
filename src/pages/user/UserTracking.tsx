import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, ArrowLeft, Navigation, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WegoMap, { carIcon, pickupIcon, destinationIcon } from '@/components/WegoMap';
import type { MapMarker } from '@/components/WegoMap';
import * as api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { getRealRoute } from '@/services/mapService';
import driverPhoto from '@/assets/driver-roberto.png';
import { X } from 'lucide-react';
import { toast } from 'sonner';

// Helper for distance between two points (in km)
const getDistance = (p1: [number, number], p2: [number, number]) => {
  const R = 6371; // Earth radius
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLon = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper to calculate bearing
const getBearing = (start: [number, number], end: [number, number]) => {
  const y = Math.sin((end[1] - start[1]) * Math.PI / 180) * Math.cos(end[0] * Math.PI / 180);
  const x = Math.cos(start[0] * Math.PI / 180) * Math.sin(end[0] * Math.PI / 180) -
    Math.sin(start[0] * Math.PI / 180) * Math.cos(end[0] * Math.PI / 180) * Math.cos((end[1] - start[1]) * Math.PI / 180);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

const UserTracking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [progress, setProgress] = useState(0);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [realDuration, setRealDuration] = useState(10);
  const [pickup, setPickup] = useState<[number, number]>([0, 0]);
  const [destination, setDestination] = useState<[number, number]>([0, 0]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [rideId, setRideId] = useState<number | null>(null);

  const driverPhone = "+34600000000";
  const driverName = "Roberto Sánchez";

  useEffect(() => {
    if (!session) return;
    api.getRidesByUser(session.id).then(async (rides) => {
      if (rides.length > 0) {
        const lastRide = rides[rides.length - 1];
        setRideId(lastRide.id);
        if (lastRide.pickupCoords && lastRide.destinationCoords) {
          setPickup(lastRide.pickupCoords);
          setDestination(lastRide.destinationCoords);
          const info = await getRealRoute(lastRide.pickupCoords, lastRide.destinationCoords);
          setRoute(info.coordinates);
          setTotalDistance(info.distance);
          setRealDuration(lastRide.durationMin || info.duration || 10);
        }
      }
    });
  }, [session]);

  const speedKmh = useMemo(() => {
    if (totalDistance === 0 || realDuration === 0) return 40;
    // Speed = Distance / Time (converted to hours)
    return totalDistance / (realDuration / 60);
  }, [totalDistance, realDuration]);

  useEffect(() => {
    if (route.length === 0 || totalDistance === 0) return;
    
    const tickIntervalMs = 400;
    const distancePerTick = (speedKmh / 3600) * (tickIntervalMs / 1000);
    const progressIncrement = distancePerTick / totalDistance;

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 1) { clearInterval(interval); return 1; }
        return Math.min(p + progressIncrement, 1);
      });
    }, tickIntervalMs);
    return () => clearInterval(interval);
  }, [route, totalDistance, speedKmh]);
  
  // Timer for cancellation check
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const distanceRemaining = Math.max(0, totalDistance * (1 - progress));
  const currentEtaMin = (distanceRemaining / speedKmh) * 60;
  const distanceRemainingLabel = distanceRemaining.toFixed(1);

  // Interpolation logic
  const segmentData = useMemo(() => {
    if (route.length < 2) return { cumulative: [0], total: 0 };
    const cum = [0];
    let total = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const d = getDistance(route[i], route[i+1]);
      total += d;
      cum.push(total);
    }
    return { cumulative: cum, total };
  }, [route]);

  const driverPos = useMemo(() => {
    if (route.length < 2) return pickup;
    const targetDist = progress * segmentData.total;
    let i = 0;
    while (i < segmentData.cumulative.length - 1 && segmentData.cumulative[i+1] < targetDist) {
      i++;
    }
    const p1 = route[i];
    const p2 = route[i+1];
    const distInSegment = targetDist - segmentData.cumulative[i];
    const segmentTotal = segmentData.cumulative[i+1] - segmentData.cumulative[i];
    const t = segmentTotal === 0 ? 0 : distInSegment / segmentTotal;
    
    return [
      p1[0] + (p2[0] - p1[0]) * t,
      p1[1] + (p2[1] - p1[1]) * t
    ] as [number, number];
  }, [progress, route, segmentData, pickup]);

  const rotation = useMemo(() => {
    if (route.length < 2) return 0;
    const i = Math.floor(progress * (route.length - 1));
    const nextIdx = Math.min(i + 1, route.length - 1);
    return getBearing(route[i], route[nextIdx]);
  }, [progress, route]);

  const statusText = progress < 0.15 ? 'En approche' : progress < 0.95 ? 'Trajet en cours' : 'Arrivé';

  const markers: MapMarker[] = [
    { key: 'pickup', position: pickup, icon: pickupIcon },
    { key: 'destination', position: destination, icon: destinationIcon },
    { key: 'driver', position: driverPos, icon: carIcon, rotation: rotation },
  ];

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Bonjour ${driverName}, je suis votre passager Wego.`);
    window.open(`https://wa.me/${driverPhone.replace('+', '')}?text=${message}`, '_blank');
  };

  const handleCancelRide = async () => {
    if (!rideId) return;
    await api.updateRide(rideId, { status: 'cancelled' });
    toast.info("Viaje cancelado");
    navigate('/user/dashboard');
  };

  const isPenaltyEligible = elapsedSeconds > 120; // 2 minutes

  return (
    <div className="h-[100svh] bg-background relative overflow-hidden">
      {/* Map View - Full Screen Background */}
      <div className="absolute inset-0 z-0">
        <WegoMap 
          markers={markers} 
          routePoints={route} 
          routeColor="#e62057" 
          center={driverPos} // Auto-follow driver
          zoom={16}
        />
        
        {/* Pulsating Destination Overlay (Visual only) */}
        {!isCollapsed && (
          <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
             <div className="w-20 h-20 rounded-full bg-accent/5 animate-ping absolute -translate-x-10 -translate-y-10" />
          </div>
        )}
      </div>

      {/* Header Row: Back button + Wego wordmark */}
      <div className="absolute top-0 left-0 right-0 z-[1000] safe-top flex items-center justify-between px-4 pt-4">
        <button
          onClick={() => navigate('/user/dashboard')}
          className="w-12 h-12 rounded-full glass-strong flex items-center justify-center shadow-2xl border border-white/10 active:scale-90 transition-transform"
          aria-label="Retour"
          title="Retour"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>

        {/* Wego Logo centered */}
        <div className="flex flex-col items-center">
          <img src="/wego-logo.svg" alt="Wego" className="h-12 w-auto drop-shadow-lg" />
        </div>

        {/* Time/Distance compact pill */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass-strong rounded-2xl px-4 py-2.5 flex flex-col items-center shadow-lg border border-accent/20 bg-background/70 backdrop-blur-2xl min-w-[90px]"
        >
          <div className="flex items-center gap-1 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-accent">Live</span>
          </div>
          <span className="text-xl font-black text-foreground tabular-nums leading-none">
            {Math.ceil(currentEtaMin)}<span className="text-xs text-muted-foreground font-bold">m</span>
          </span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
            {distanceRemainingLabel} km
          </span>
        </motion.div>
      </div>

      {/* Bottom Interface - Floating Over Map */}
      <motion.div 
        initial={{ y: 500 }} 
        animate={{ y: isCollapsed ? 360 : 0 }} 
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="absolute bottom-0 left-0 right-0 glass-strong rounded-t-[40px] safe-bottom z-[1001] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-white/10"
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex flex-col items-center py-4 tap-target"
          aria-label={isCollapsed ? "Expand details" : "Collapse details"}
        >
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </button>
        
        <div className="px-8 pb-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-4 h-4 rounded-full bg-accent animate-pulse shadow-lg`} />
                <div className={`absolute inset-0 rounded-full bg-accent animate-ping opacity-50`} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground leading-tight tracking-tight">{statusText}</h3>
                <p className="text-sm text-accent font-bold uppercase tracking-tighter shrink-0">{progress >= 0.95 ? 'Le chauffeur est arrivé !' : 'Votre taxi est en route'}</p>
              </div>
            </div>
            <div className="bg-accent/10 px-3 py-1.5 rounded-full flex items-center gap-2 border border-accent/20">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-black text-accent uppercase tracking-tight">Trajet Sécurisé</span>
            </div>
          </div>

          <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5 shadow-inner">
            <motion.div className="h-full gradient-accent" animate={{ width: `${progress * 100}%` }} transition={{ type: "spring", damping: 20 }} />
          </div>

          {/* Driver Card */}
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[28px] p-5 flex items-center gap-5 border border-white/10 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
              <div 
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent to-accent/60 p-1 shrink-0 cursor-pointer active:scale-95 transition-transform"
                onClick={() => setShowPhotoModal(true)}
              >
                 <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center border-2 border-background overflow-hidden">
                    <img 
                      src={driverPhoto} 
                      alt={driverName} 
                      className="w-full h-full object-cover"
                    />
                 </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-black text-foreground text-xl tracking-tight">{driverName}</p>
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                    <span className="text-xs text-accent font-black font-mono">⭐ 4.9</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-bold tracking-wide uppercase">Toyota Corolla · <span className="text-foreground">ABC-123</span></p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleWhatsApp} className="py-5 rounded-2xl glass border border-white/10 text-foreground font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg hover:bg-white/5">
              <div className="p-2 bg-accent/20 rounded-xl">
                <Phone className="w-5 h-5 text-accent" />
              </div>
              WhatsApp
            </button>
            <button onClick={handleWhatsApp} className="py-5 rounded-2xl glass border border-white/10 text-foreground font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg hover:bg-white/5">
              <div className="p-2 bg-accent/20 rounded-xl">
                <MessageCircle className="w-5 h-5 text-accent" />
              </div>
              Message
            </button>
          </div>
          
          {progress < 0.15 && (
            <button 
              onClick={() => setShowCancelModal(true)}
              className="w-full mt-2 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-black text-sm active:scale-95 transition-all shadow-lg hover:bg-destructive/20 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              {t('user.tracking.cancel')}
            </button>
          )}
        </div>
      </motion.div>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-strong rounded-[32px] p-8 max-w-sm w-full border border-white/10 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-foreground mb-2">{t('user.tracking.cancelConfirmTitle')}</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {isPenaltyEligible 
                  ? t('user.tracking.cancelPenaltyDesc')
                  : t('user.tracking.cancelConfirmDesc')}
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleCancelRide}
                  className="w-full py-4 rounded-2xl bg-destructive text-white font-black text-sm active:scale-[0.98] transition-all"
                >
                  {t('common.confirm')}
                </button>
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="w-full py-4 rounded-2xl glass border border-white/10 text-foreground font-black text-sm active:scale-[0.98] transition-all"
                >
                  {t('common.continue')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driver Photo Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
            onClick={() => setShowPhotoModal(false)}
          >
            <button 
              className="absolute top-10 right-6 w-12 h-12 rounded-full glass flex items-center justify-center active:scale-90 transition-transform"
              onClick={() => setShowPhotoModal(false)}
              aria-label="Cerrar foto"
              title="Cerrar foto"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-sm w-full aspect-square rounded-[40px] overflow-hidden shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={driverPhoto} 
                alt={driverName} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 pt-12 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-2xl font-black text-white mb-1">{driverName}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-accent2/20 px-2 py-0.5 rounded-lg border border-accent2/30">
                    <span className="text-xs text-accent2 font-black">⭐ 4.9</span>
                  </div>
                  <span className="text-xs text-white/60 font-medium uppercase tracking-widest">Chauffeur Vérifié</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserTracking;
