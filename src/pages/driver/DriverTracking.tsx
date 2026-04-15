import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, ArrowLeft, Navigation, ShieldCheck, MapPin, CheckCircle2, Play, Flag, X, MoreHorizontal, AlertTriangle, User, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WegoMap, { carIcon, pickupIcon, destinationIcon } from '@/components/WegoMap';
import type { MapMarker } from '@/components/WegoMap';
import * as api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { getRealRoute } from '@/services/mapService';
import { toast } from 'sonner';
import CameraScanner from '@/components/CameraScanner';

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
  
  // Validation Modals
  const [showValidation, setShowValidation] = useState<'none' | 'pickup' | 'delivery'>('none');
  const [pinInput, setPinInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

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
    
    // Status Flow: accepted -> arriving -> in-progress -> completed
    if (ride.status === 'accepted') {
       // Driver arrived at pickup
       handleStateChange('arriving');
    } else if (ride.status === 'arriving') {
       // Driver needs to validate pickup PIN
       setShowValidation('pickup');
    } else if (ride.status === 'in-progress') {
       // Driver needs to validate delivery OTP/QR
       setShowValidation('delivery');
    }
  };

  const handleStateChange = async (nextStatus: string) => {
    if (!ride) return;
    try {
      const updated = await api.updateRide(ride.id, { status: nextStatus as any });
      setRide(updated);
      toast.success(`Action validée avec succès`);
      setShowValidation('none');
      setPinInput('');
      setIsScanning(false);
      
      if (nextStatus === 'completed') {
        setTimeout(() => navigate('/driver/dashboard'), 2000);
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleValidationSubmit = () => {
     if (showValidation === 'pickup') {
        // Mock verification
        if (pinInput.length >= 4) {
           handleStateChange('in-progress');
        } else {
           toast.error('PIN invalide');
        }
     } else if (showValidation === 'delivery') {
        // Mock verification
        if (pinInput.length >= 4) {
           handleStateChange('completed');
        } else {
           toast.error('OTP invalide');
        }
     }
  };

  const handleQRScan = (data: string) => {
     toast.success('QR Code scanné avec succès');
     setTimeout(() => handleStateChange('completed'), 1000);
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
      case 'arriving': return { label: t('driver.dashboard.startRide'), icon: Play, color: 'bg-accent' };
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

      <div className="absolute top-0 left-0 right-0 z-[1000] safe-top flex items-center justify-between px-4 pt-4">
        <button 
          onClick={() => navigate('/driver/dashboard')} 
          className="w-12 h-12 rounded-full glass-strong flex items-center justify-center shadow-2xl border border-white/10 active:scale-90 transition-transform" 
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>

        <div className="flex flex-col items-center">
          <img src="/wego-logo.svg" alt="Wego" className="h-12 w-auto drop-shadow-lg" />
        </div>

        <div className="w-12 h-12 rounded-full glass-strong flex items-center justify-center border border-white/10 opacity-0 pointer-events-none">
           <MoreHorizontal className="w-6 h-6" />
        </div>
      </div>

      <motion.div 
        initial={{ y: 500 }} 
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="absolute bottom-0 left-0 right-0 glass-strong rounded-t-[40px] safe-bottom z-[1001] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-white/10"
      >
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto my-4" />
        
        <div className="px-8 pb-8 space-y-6">
          {/* ── Status Link & Triple Interaction ── */}
          <div className="flex items-center justify-between px-2 pb-2">
             <div className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                   <User className="w-4 h-4 text-accent" />
                </div>
                <span className="text-[7px] font-black text-white/40 uppercase tracking-widest truncate max-w-[50px]">{userName.split(' ')[0]}</span>
             </div>
             
             <div className="flex-1 px-4 flex items-center gap-1">
                <div className={`h-1 flex-1 rounded-full ${ride.status !== 'accepted' ? 'bg-accent shadow-[0_0_8px_rgba(230,32,87,0.5)]' : 'bg-white/10'}`} />
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${ride.status === 'in-progress' ? 'bg-accent/20 border-accent/30 animate-pulse' : (ride.status === 'completed' ? 'bg-accent/20 border-accent/30' : 'bg-white/5 border-white/5')}`}>
                   <Truck className={`w-2.5 h-2.5 ${ride.status === 'in-progress' ? 'text-accent' : (ride.status === 'completed' ? 'text-accent' : 'text-white/20')}`} />
                </div>
                <div className={`h-1 flex-1 rounded-full ${ride.status === 'completed' ? 'bg-accent shadow-[0_0_8px_rgba(230,32,87,0.5)]' : 'bg-white/10'}`} />
             </div>

             <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${ride.status === 'completed' ? 'bg-accent/20 border-accent/30' : 'bg-white/5 border-white/10'}`}>
                   <User className={`w-4 h-4 ${ride.status === 'completed' ? 'text-accent' : 'text-white/20'}`} />
                </div>
                <span className="text-[7px] font-black text-white/40 uppercase tracking-widest truncate max-w-[50px]">{ride.receiverName?.split(' ')[0] || 'Dest.'}</span>
             </div>
          </div>

          <div className="flex items-center justify-between p-4 glass rounded-3xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center overflow-hidden border border-accent/30">
                  <span className="text-xl font-black text-accent">{userName.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-background flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight leading-tight">{userName}</h3>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-0.5">
                  {ride.status === 'in-progress' ? 'En livraison vers dest.' : (ride.status === 'accepted' || ride.status === 'arriving' ? 'Collecte chez expéditeur' : 'Terminé')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const message = encodeURIComponent(`Bonjour, c'est votre chauffeur Wego pour le colis.`);
                  window.open(`https://wa.me/221770000000?text=${message}`, '_blank');
                }}
                className="w-12 h-12 rounded-2xl glass border border-white/10 flex items-center justify-center text-accent active:scale-90 transition-transform shadow-lg" 
                aria-label={t('user.tracking.call')}
              >
                <Phone className="w-5 h-5" />
              </button>
              <button 
                className="w-12 h-12 rounded-2xl glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white active:scale-90 transition-transform shadow-lg" 
                aria-label={t('user.tracking.message')}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Receiver Info Section (Conditional) */}
          {(ride.status === 'in-progress' || ride.status === 'completed') && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 glass rounded-3xl border border-white/5 flex items-center justify-between"
            >
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                     <User className="w-6 h-6 text-white/60" />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5">Contact Final (Destinataire)</p>
                     <h4 className="text-sm font-black text-white">{ride.receiverName || 'Chargement...'}</h4>
                     <p className="text-[10px] font-bold text-white/40">{ride.receiverPhone || '---'}</p>
                  </div>
               </div>
               <button 
                 title="Contacter le destinataire"
                 aria-label="Contacter le destinataire"
                 className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
               >
                 <MessageCircle className="w-5 h-5" />
               </button>
            </motion.div>
          )}

          {/* Route Details Glass Box */}
          <div className="glass-strong rounded-[32px] p-6 space-y-5 border border-white/5 relative overflow-hidden bg-white/[0.02]">
             {/* removed the accent/5 blur gradient */}
             
             <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                   <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-0.5">Point de départ</p>
                   <p className="text-sm font-black text-white truncate leading-tight">{ride.from}</p>
                </div>
             </div>
             
             <div className="ml-4 w-px h-4 bg-white/10" />
             
             <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-white/60" />
                </div>
                <div className="min-w-0 flex-1">
                   <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-0.5">Destination</p>
                   <p className="text-sm font-black text-white truncate leading-tight">{ride.to}</p>
                </div>
             </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={updateStatus}
            className={`w-full h-16 rounded-[24px] ${action.color} text-white font-black text-lg shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest`}
          >
            <action.icon className="w-6 h-6" />
            {action.label}
          </motion.button>
        </div>
      </motion.div>

      {/* Validation Modals (Pickup / Delivery) */}
      <AnimatePresence>
         {showValidation !== 'none' && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[2200] flex items-end justify-center p-4 bg-black/80 backdrop-blur-md"
             onClick={() => setShowValidation('none')}
           >
             <motion.div 
               initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="w-full max-w-sm glass-strong rounded-[36px] bg-background border border-white/10 shadow-2xl p-6"
               onClick={e => e.stopPropagation()}
             >
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-black text-white">
                      {showValidation === 'pickup' ? 'Validation Collecte' : 'Validation Livraison'}
                   </h2>
                   <button aria-label="Fermer" onClick={() => setShowValidation('none')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50">
                      <X className="w-4 h-4" />
                   </button>
                </div>

                <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-2xl border border-white/10">
                   <button 
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${!isScanning ? 'bg-accent/20 text-accent border border-accent/20' : 'text-white/40'}`}
                      onClick={() => setIsScanning(false)}
                   >
                      {showValidation === 'pickup' ? 'Saisir PIN' : 'Code OTP'}
                   </button>
                   <button 
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${isScanning ? 'bg-accent/20 text-accent border border-accent/20' : 'text-white/40'}`}
                      onClick={() => setIsScanning(true)}
                   >
                      Scanner QR
                   </button>
                </div>

                {isScanning ? (
                   <div className="mb-6">
                      <CameraScanner onScanSuccess={handleQRScan} />
                      <p className="text-[10px] text-white/40 text-center mt-4">
                         {showValidation === 'pickup' ? "Placez le QR Code de l'expéditeur dans le cadre pour certifier la collecte." : "Placez le QR Code du client dans le cadre pour valider la livraison automatiquement."}
                      </p>
                   </div>
                ) : (
                   <div className="space-y-6">
                      <div>
                         <p className="text-[10px] text-white/40 uppercase font-black tracking-widest pl-2 mb-2 pb-2">
                           Saisissez le {showValidation === 'pickup' ? 'code PIN de l\'expéditeur' : 'code OTP du destinataire'}
                         </p>
                         <input 
                           type="text"
                           placeholder="Ex: 4821"
                           value={pinInput}
                           onChange={e => setPinInput(e.target.value)}
                           className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-2xl font-mono text-center text-white outline-none focus:border-accent font-black tracking-[0.3em]"
                           maxLength={4}
                           autoFocus
                         />
                      </div>
                      <button 
                         onClick={handleValidationSubmit}
                         disabled={pinInput.length < 4}
                         className={`w-full py-4 rounded-2xl font-black text-white text-sm transition-all focus:outline-none disabled:opacity-30 bg-accent`}
                      >
                         Valider
                      </button>
                   </div>
                )}

             </motion.div>
           </motion.div>
         )}
      </AnimatePresence>

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
