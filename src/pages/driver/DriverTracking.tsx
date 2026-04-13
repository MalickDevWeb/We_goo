import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, ArrowLeft, Navigation, ShieldCheck, MapPin, CheckCircle2, Play, Flag, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import WegoMap, { carIcon, pickupIcon, destinationIcon } from '@/components/WegoMap';
import type { MapMarker } from '@/components/WegoMap';
import * as api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { getRealRoute } from '@/services/mapService';
import { toast } from 'sonner';

const DriverTracking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [ride, setRide] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [pickup, setPickup] = useState<[number, number]>([0, 0]);
  const [destination, setDestination] = useState<[number, number]>([0, 0]);
  const [userName, setUserName] = useState("María López");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    if (!session) return;
    // In a real app, we would fetch the specific ride by ID from params
    api.getRidesByDriver(session.id).then(async (rides) => {
      const activeRide = rides.find(r => r.status !== 'completed' && r.status !== 'cancelled') || rides[rides.length - 1];
      if (activeRide) {
        setRide(activeRide);
        if (activeRide.pickupCoords && activeRide.destinationCoords) {
          setPickup(activeRide.pickupCoords);
          setDestination(activeRide.destinationCoords);
          const info = await getRealRoute(activeRide.pickupCoords, activeRide.destinationCoords);
          setRoute(info.coordinates);
          setTotalDistance(info.distance);
        }
        // Fetch user info
        const user = await api.getUserById(activeRide.userId);
        if (user) setUserName(user.name);
      }
    });
  }, [session]);

  // Poll for status changes (like cancellation)
  useEffect(() => {
    if (!ride || ride.status === 'completed' || ride.status === 'cancelled') return;
    const interval = setInterval(async () => {
      const updated = await api.getRides();
      const current = updated.find(r => r.id === ride.id);
      if (current && current.status === 'cancelled') {
        setRide(current);
        setShowReportModal(true);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [ride]);

  const updateStatus = async () => {
    if (!ride) return;
    let nextStatus: any = 'arriving';
    if (ride.status === 'accepted') nextStatus = 'arriving';
    else if (ride.status === 'arriving') nextStatus = 'in-progress';
    else if (ride.status === 'in-progress') nextStatus = 'completed';

    try {
      const updated = await api.updateRide(ride.id, { status: nextStatus });
      setRide(updated);
      toast.success(`Estado actualizado: ${nextStatus}`);
      if (nextStatus === 'completed') {
        setTimeout(() => navigate('/driver/dashboard'), 2000);
      }
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  const submitReport = async (reason: string) => {
    if (!ride) return;
    await api.reportUser(ride.userId, reason);
    toast.success("Usuario reportado");
    navigate('/driver/dashboard');
  };

  const getStatusAction = () => {
    switch (ride?.status) {
      case 'accepted': return { label: t('driver.dashboard.validateArrived'), icon: MapPin, color: 'bg-accent' };
      case 'arriving': return { label: t('driver.dashboard.startRide'), icon: Play, color: 'bg-accent2' };
      case 'in-progress': return { label: t('driver.dashboard.completeRide'), icon: Flag, color: 'bg-green-500' };
      default: return { label: t('common.back'), icon: CheckCircle2, color: 'bg-muted' };
    }
  };

  const action = getStatusAction();

  const driverPos = useMemo(() => {
    // For demo, driver is at pickup if 'accepted' or 'arriving', 
    // and moves towards destination if 'in-progress'
    if (ride?.status === 'in-progress') return destination; // Simple jump for demo
    return pickup;
  }, [ride, pickup, destination]);

  const markers: MapMarker[] = [
    { key: 'pickup', position: pickup, icon: pickupIcon },
    { key: 'destination', position: destination, icon: destinationIcon },
    { key: 'driver', position: driverPos, icon: carIcon },
  ];

  if (!ride) return <div className="h-screen flex items-center justify-center bg-background text-foreground">Cargando...</div>;

  return (
    <div className="h-[100svh] bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <WegoMap markers={markers} routePoints={route} routeColor="#e62057" center={driverPos} zoom={15} />
      </div>

      <div className="absolute top-4 left-4 z-[1000] safe-top">
        <button onClick={() => navigate('/user/dashboard')} className="w-12 h-12 rounded-full glass-strong flex items-center justify-center shadow-2xl border border-white/10 active:scale-90 transition-transform" aria-label={t('common.back')}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
      </div>

      <motion.div 
        initial={{ y: 300 }} animate={{ y: 0 }}
        className="absolute bottom-0 left-0 right-0 glass-strong rounded-t-[40px] safe-bottom z-[1001] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-white/10 p-8"
      >
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-6" />
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border-2 border-accent">
                <span className="text-xl font-bold text-accent">{userName.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">{userName}</h3>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{ride.status === 'in-progress' ? 'En viaje' : 'Punto de partida'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-accent" aria-label={t('user.tracking.call')}><Phone className="w-5 h-5" /></button>
              <button className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-accent2" aria-label={t('user.tracking.message')}><MessageCircle className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="glass rounded-[28px] p-5 space-y-3">
             <div className="flex items-start gap-4">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-accent ring-4 ring-accent/20" />
                <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Recogida</p>
                   <p className="text-sm font-bold text-foreground line-clamp-1">{ride.from}</p>
                </div>
             </div>
             <div className="ml-1 w-px h-6 bg-white/10" />
             <div className="flex items-start gap-4">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-accent2 ring-4 ring-accent2/20" />
                <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Destino</p>
                   <p className="text-sm font-bold text-foreground line-clamp-1">{ride.to}</p>
                </div>
             </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={updateStatus}
            className={`w-full py-5 rounded-3xl ${action.color} text-white font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-colors`}
          >
            <action.icon className="w-6 h-6" />
            {action.label}
          </motion.button>
        </div>
      </motion.div>

      {/* Cancellation / Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-strong rounded-[32px] p-8 max-w-sm w-full border border-white/10 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mb-6">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-black text-foreground mb-2">{t('driver.dashboard.cancelledTitle')}</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {t('driver.dashboard.cancelledDesc')}
              </p>
              
              <div className="space-y-3 mb-8">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t('driver.dashboard.reportReasonPrompt')}</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'impolite', label: t('driver.dashboard.reasons.impolite') },
                    { id: 'disruptive', label: t('driver.dashboard.reasons.disruptive') },
                    { id: 'no_show', label: t('driver.dashboard.reasons.no_show') },
                  ].map(reason => (
                    <button 
                      key={reason.id}
                      onClick={() => setReportReason(reason.id)}
                      className={`w-full py-3 px-4 rounded-xl border text-left text-sm font-bold transition-all ${
                        reportReason === reason.id 
                          ? 'bg-accent border-accent text-white' 
                          : 'bg-white/5 border-white/10 text-foreground'
                      }`}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  disabled={!reportReason}
                  onClick={() => submitReport(reportReason)}
                  className="w-full py-4 rounded-2xl bg-accent text-white font-black text-sm active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  {t('driver.dashboard.confirmReport')}
                </button>
                <button 
                  onClick={() => navigate('/driver/dashboard')}
                  className="w-full py-4 rounded-2xl glass border border-white/10 text-foreground font-black text-sm active:scale-[0.98] transition-all"
                >
                  {t('driver.dashboard.closeNoReport')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverTracking;
