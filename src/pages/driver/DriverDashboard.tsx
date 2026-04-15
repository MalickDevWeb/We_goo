import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Power, Star, Car, Package, UtensilsCrossed, ShoppingBag, DollarSign, Clock, Check, X, List, TrendingUp, Wallet, MessageCircle, ArrowLeft, LogOut, Navigation2, ChevronRight, Activity, Bell, MapPin, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { Driver, Ride } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import driverPhoto from '@/assets/driver-roberto.png';
import { useSocket } from '@/services/socket';

const DriverDashboard = () => {
  const { t } = useTranslation();
  const { session, profile, setProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // Mixed types of incoming requests for fully featured driver experience
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);

  const driver = profile as Driver | null;

  useSocket('new_request_incoming', (request: any) => {
     if (driver?.isOnline) {
        setAvailableRequests(prev => [request, ...prev]);
        toast('Nouvelle requête entrante !', {
           description: `${request.type === 'package' ? 'Colis' : request.type === 'restaurant' ? 'Repas' : 'Course'} | ${request.amount} FCFA`,
           icon: '🔔'
        });
     }
  });

  useEffect(() => {
    if (session && !profile) {
      api.getDriverById(session.id).then(d => d && setProfile(d));
    }
    
    // Initial fetch
    api.getAvailableRides().then(rides => {
        const enriched = rides.map((r, index) => {
           const category = index % 3 === 0 ? 'package' : index % 3 === 1 ? 'restaurant' : 'ride';
           return { ...r, category };
        });
        setAvailableRequests(enriched);
    });
  }, [session, profile, setProfile]);

  const toggleOnline = async () => {
    if (!driver || !session) return;
    const updated = await api.updateDriver(session.id, { isOnline: !driver.isOnline });
    setProfile(updated);
  };

  const acceptRequest = async (request: any) => {
    if (!session) return;
    
    // In real app, we update the ride/order status
    await api.updateRide(request.id, { status: 'accepted', driverId: session.id });
    setAvailableRequests(prev => prev.filter(r => r.id !== request.id));
    toast.success('Demande acceptée ! Navigation en cours...');
    navigate('/driver/tracking');
  };

  const declineRequest = (id: number) => {
    setAvailableRequests(prev => prev.filter(r => r.id !== id));
  };

  const getRequestIcon = (category: string) => {
     switch(category) {
        case 'package': return <Package className="w-5 h-5 text-accent" />;
        case 'restaurant': return <UtensilsCrossed className="w-5 h-5 text-orange-500" />;
        case 'commerce': return <ShoppingBag className="w-5 h-5 text-purple-500" />;
        default: return <User className="w-5 h-5 text-accent2" />; // Passager
     }
  };

  const getRequestColors = (category: string) => {
     switch(category) {
        case 'package': return 'border-accent/40 shadow-accent/20 bg-accent/5';
        case 'restaurant': return 'border-orange-500/40 shadow-orange-500/20 bg-orange-500/5';
        case 'commerce': return 'border-purple-500/40 shadow-purple-500/20 bg-purple-500/5';
        default: return 'border-accent2/40 shadow-accent2/20 bg-accent2/5';
     }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 20 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
  };

  return (
    <div className="h-[100svh] bg-[#020617] relative overflow-hidden flex flex-col safe-top">
      
      {/* ── Background Map / Heatmap Simulation ── */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${driver?.isOnline ? 'opacity-40' : 'opacity-10 grayscale'}`}>
         {/* Map placeholder pattern */}
         <div className="absolute inset-0 bg-[#0A0A0B] opacity-10" />
         
         {/* Demand Hotspots (Surge Pricing Heatmap) */}
         {driver?.isOnline && (
            <>
              <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-accent/30 rounded-full blur-[80px] animate-pulse pointer-events-none" />
              <div className="absolute top-[40%] right-[5%] w-80 h-80 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none [animation-duration:4s]" />
              <div className="absolute bottom-[20%] left-[30%] w-72 h-72 bg-accent2/20 rounded-full blur-[90px] animate-pulse pointer-events-none [animation-duration:5s]" />
            </>
         )}
         <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#020617]/80 to-[#020617] pointer-events-none" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-6 pb-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl p-0.5 border-2 transition-colors duration-500 overflow-hidden shadow-2xl ${driver?.isOnline ? 'border-emerald-500' : 'border-white/10'}`}>
            <img src={driverPhoto} alt="Profile" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none mb-1 shadow-black drop-shadow-xl">
              Salut, {driver?.name || 'Chauffeur'}
            </h1>
            <div className="flex items-center gap-1.5">
               <div className={`w-2 h-2 rounded-full animate-pulse ${driver?.isOnline ? 'bg-emerald-500' : 'bg-white/20'}`} />
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none drop-shadow-md">
                 {driver?.isOnline ? 'En service' : 'Hors service'}
               </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => navigate('/driver/notifications')}
             className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-95 transition-transform relative shadow-xl"
           >
             <Bell className="w-5 h-5 text-white/60" />
             {availableRequests.length > 0 && <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-accent rounded-full border-[3px] border-[#020617] shadow-[0_0_10px_rgba(230,32,87,1)]" />}
           </button>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pb-32 pt-2">
        
        {/* Neon Online Toggle Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6"
        >
          <button
            onClick={toggleOnline}
            className={`w-full rounded-[36px] p-2 border transition-all duration-700 relative overflow-hidden group shadow-2xl ${
              driver?.isOnline 
                ? 'border-emerald-500/40 bg-emerald-500/10 shadow-emerald-500/20' 
                : 'border-white/10 bg-black/40'
            }`}
          >
            <div className="flex items-center justify-between p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${
                  driver?.isOnline ? 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'bg-white/10'
                }`}>
                  <Power className={`w-7 h-7 ${driver?.isOnline ? 'text-black' : 'text-white/20'}`} />
                </div>
                <div className="text-left">
                  <span className={`block font-black text-lg tracking-tight ${driver?.isOnline ? 'text-white' : 'text-white/40'}`}>
                    {driver?.isOnline ? 'Vous êtes en ligne' : 'Vous êtes hors ligne'}
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">
                    {driver?.isOnline ? 'En attente de courses' : 'Reposez-vous bien'}
                  </span>
                </div>
              </div>

              <div className={`w-16 h-8 rounded-full flex items-center px-1.5 transition-all duration-700 ${
                driver?.isOnline ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5 border border-white/10'
              }`}>
                <motion.div 
                   animate={{ x: driver?.isOnline ? 32 : 0 }}
                   className={`w-5 h-5 rounded-full ${driver?.isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]' : 'bg-white/20'}`} 
                />
              </div>
            </div>
          </button>
        </motion.div>

        {/* Mini HUD Stats */}
        {driver?.isOnline && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 text-center flex flex-col items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
              <p className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none mb-1">Surge</p>
              <p className="text-xs font-black text-emerald-500">x1.4</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 text-center flex flex-col items-center justify-center cursor-pointer" onClick={() => navigate('/driver/earnings')}>
              <DollarSign className="w-4 h-4 text-accent2 mb-1" />
              <p className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none mb-1">Gains</p>
              <p className="text-xs font-black text-white">{driver?.todayEarnings || 0}F</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 text-center flex flex-col items-center justify-center">
              <Star className="w-4 h-4 text-yellow-400 mb-1" />
              <p className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none mb-1">Note</p>
              <p className="text-xs font-black text-white">{driver?.rating || '5.0'}</p>
            </div>
          </motion.div>
        )}

        {/* Available Requests Section */}
        {driver?.isOnline && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                 <Navigation2 className="w-3.5 h-3.5 text-accent animate-pulse" />
                 Requêtes ({availableRequests.length})
              </h2>
            </div>
        )}

        {driver?.isOnline ? (
          <AnimatePresence mode="wait">
            {availableRequests.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-[32px] p-8 text-center border border-white/5 opacity-60 bg-black/40 backdrop-blur-md"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 relative">
                   <div className="absolute inset-0 rounded-full border-2 border-accent border-r-transparent animate-spin" />
                   <MapPin className="w-6 h-6 text-white/60" />
                </div>
                <p className="text-xs font-black text-white tracking-widest">Recherche de clients...</p>
                <p className="text-[10px] uppercase text-white/40 mt-1">Vous êtes dans une zone de forte demande</p>
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <AnimatePresence>
                  {availableRequests.map(request => (
                    <motion.div 
                      key={request.id} 
                      variants={itemVariants}
                      exit="exit"
                      layout
                      className={`rounded-[32px] border p-5 relative overflow-hidden backdrop-blur-xl transition-all shadow-2xl ${getRequestColors(request.category)}`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                      
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#020617]/50 flex items-center justify-center border border-white/10 shadow-inner">
                             {getRequestIcon(request.category)}
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest block mb-0.5 drop-shadow-md">
                               {request.category === 'package' ? 'Livraison Colis' : request.category === 'restaurant' ? 'Commande Repas' : 'Course Passager'}
                            </span>
                            <span className="text-xl font-black text-white leading-none tracking-tight">{request.amount} <span className="text-[10px] text-white/40">CFA</span></span>
                          </div>
                        </div>
                        <div className="bg-[#020617]/50 border border-white/10 px-2 py-1.5 rounded-lg flex flex-col items-center">
                           <Clock className="w-3.5 h-3.5 text-white/60 mb-0.5" />
                           <span className="text-[10px] font-black text-white">4 min</span>
                        </div>
                      </div>

                      <div className="bg-[#020617]/40 rounded-2xl p-4 mb-5 border border-white/5 relative z-10">
                         {/* Route Line Connector */}
                         <div className="absolute left-[27px] top-[26px] bottom-[26px] w-[2px] bg-white/10" />
                         
                         <div className="flex flex-col gap-5 relative z-10">
                            <div className="flex items-start gap-3">
                               <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5 z-10 border border-[#020617]">
                                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                               </div>
                               <div>
                                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-black leading-tight">Départ</p>
                                  <p className="text-sm font-black text-white leading-tight">{request.from}</p>
                               </div>
                            </div>
                            <div className="flex items-start gap-3">
                               <div className="w-4 h-4 rounded-full bg-accent2/20 flex items-center justify-center shrink-0 mt-0.5 z-10 border border-[#020617]">
                                  <div className="w-1.5 h-1.5 rounded-full bg-accent2" />
                               </div>
                               <div>
                                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-black leading-tight">Destination</p>
                                  <p className="text-sm font-black text-white leading-tight">{request.to}</p>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="flex gap-2 relative z-10">
                        <button onClick={() => declineRequest(request.id)} aria-label="Refuser la requête" className="w-[60px] h-14 rounded-[20px] bg-[#020617]/40 text-white flex items-center justify-center active:scale-90 transition-transform hover:bg-[#020617]/60">
                           <X className="w-6 h-6 text-white/40" />
                        </button>
                        <button onClick={() => acceptRequest(request)} className="flex-1 h-14 rounded-[20px] bg-white text-black font-black text-sm uppercase tracking-widest active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                           <Check className="w-5 h-5" />
                           Accepter
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
           <div className="mt-20 text-center opacity-40">
              <Power className="w-12 h-12 mx-auto mb-4 text-white" />
              <p className="text-xs font-black text-white uppercase tracking-widest">Passez en ligne pour recevoir des courses</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
