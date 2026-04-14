import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Power, Star, Car, DollarSign, Clock, Check, X, List, TrendingUp, Wallet, MessageCircle, ArrowLeft, LogOut, Navigation2, ChevronRight, Activity, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { Driver, Ride } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import driverPhoto from '@/assets/driver-roberto.png';

const DriverDashboard = () => {
  const { t } = useTranslation();
  const { session, profile, setProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);

  const driver = profile as Driver | null;

  useEffect(() => {
    if (session && !profile) {
      api.getDriverById(session.id).then(d => d && setProfile(d));
    }
    api.getAvailableRides().then(setAvailableRides);
  }, [session, profile, setProfile]);

  const toggleOnline = async () => {
    if (!driver || !session) return;
    const updated = await api.updateDriver(session.id, { isOnline: !driver.isOnline });
    setProfile(updated);
  };

  const acceptRide = async (ride: Ride) => {
    if (!session) return;
    await api.updateRide(ride.id, { status: 'accepted', driverId: session.id });
    setAvailableRides(prev => prev.filter(r => r.id !== ride.id));
    toast.success(t('common.success'));
    navigate('/driver/tracking');
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { icon: List, label: t('driver.rides.title'), path: '/driver/rides' },
    { icon: TrendingUp, label: t('driver.earnings.title'), path: '/driver/earnings' },
    { icon: Wallet, label: t('driver.wallet.title'), path: '/driver/wallet' },
    { icon: MessageCircle, label: t('user.chat.title'), path: '/driver/chat' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 300 } }
  };

  return (
    <div className="h-[100svh] bg-background relative overflow-hidden flex flex-col safe-top">
      {/* Premium Animated Background */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${driver?.isOnline ? 'bg-accent2/15' : 'bg-accent/15'}`} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 pt-6 pb-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl p-0.5 border-2 transition-colors duration-500 overflow-hidden shadow-2xl ${driver?.isOnline ? 'border-accent2' : 'border-white/10'}`}>
            <img src={driverPhoto} alt="Profile" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none mb-1">
              Salut, {driver?.name || 'Chauffeur'}
            </h1>
            <div className="flex items-center gap-1.5">
               <div className={`w-2 h-2 rounded-full animate-pulse ${driver?.isOnline ? 'bg-accent2' : 'bg-white/20'}`} />
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">
                 {driver?.isOnline ? 'En service' : 'Hors service'}
               </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => navigate('/driver/notifications')}
             className="w-12 h-12 rounded-2xl glass-strong border border-white/10 flex items-center justify-center active:scale-90 transition-transform relative"
           >
             <Bell className="w-5 h-5 text-white/60" />
             {availableRides.length > 0 && <div className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full border-2 border-background" />}
           </button>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pb-24">
        
        {/* Neon Online Toggle Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-8"
        >
          <button
            onClick={toggleOnline}
            className={`w-full rounded-[36px] p-2 border transition-all duration-700 relative overflow-hidden group ${
              driver?.isOnline 
                ? 'border-accent2/40 bg-accent2/5 shadow-[0_20px_50px_rgba(154,230,180,0.1)]' 
                : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${
                  driver?.isOnline ? 'bg-accent2 shadow-[0_0_30px_rgba(154,230,180,0.5)]' : 'bg-white/10'
                }`}>
                  <Power className={`w-7 h-7 ${driver?.isOnline ? 'text-white' : 'text-white/20'}`} />
                </div>
                <div className="text-left">
                  <span className={`block font-black text-lg tracking-tight ${driver?.isOnline ? 'text-white' : 'text-white/40'}`}>
                    {driver?.isOnline ? 'Vous êtes en ligne' : 'Vous êtes hors ligne'}
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/20">
                    {driver?.isOnline ? 'Prêt pour encaisser' : 'Reposez-vous bien'}
                  </span>
                </div>
              </div>

              <div className={`w-16 h-8 rounded-full flex items-center px-1.5 transition-all duration-700 ${
                driver?.isOnline ? 'bg-accent2/20 border border-accent2/30' : 'bg-white/5 border border-white/10'
              }`}>
                <motion.div 
                   animate={{ x: driver?.isOnline ? 32 : 0 }}
                   className={`w-5 h-5 rounded-full ${driver?.isOnline ? 'bg-accent2 shadow-[0_0_10px_rgba(154,230,180,1)]' : 'bg-white/20'}`} 
                />
              </div>
            </div>
          </button>
        </motion.div>

        {/* Stats Grid - Premium Horizontal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-10"
        >
          <div className="glass-strong rounded-[32px] p-6 border border-white/5 relative overflow-hidden group">
            <DollarSign className="w-5 h-5 text-accent mb-3" />
            <p className="text-2xl font-black text-white tracking-tight">{driver?.todayEarnings || 0} <span className="text-[10px] text-white/30 ml-0.5">CFA</span></p>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Gains du jour</p>
          </div>
          
          <div className="glass-strong rounded-[32px] p-6 border border-white/5 relative overflow-hidden group">
            <Activity className="w-5 h-5 text-accent2 mb-3" />
            <p className="text-2xl font-black text-white tracking-tight">{driver?.todayRides || 0}</p>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Courses</p>
          </div>
        </motion.div>

        {/* Available Rides Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
             <Navigation2 className="w-3 h-3 text-accent" />
             {t('driver.dashboard.availableRides')}
          </h2>
          <div className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${availableRides.length > 0 ? 'bg-accent/10 border-accent/20 text-accent animate-pulse' : 'bg-white/5 border-white/5 text-white/20'}`}>
            {availableRides.length} En attente
          </div>
        </div>

        <AnimatePresence mode="wait">
          {availableRides.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-[32px] p-10 text-center border border-white/5 opacity-40 bg-white/[0.02]"
            >
              <Car className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-xs font-black text-white uppercase tracking-widest">Recherche de courses en cours...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {availableRides.map(ride => (
                <motion.div 
                  key={ride.id} 
                  variants={itemVariants}
                  className="glass-strong rounded-[32px] border border-white/10 p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors"
                >
                  {/* Decorative gradient corner */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/10 to-transparent pointer-events-none" />

                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(230,32,87,0.5)]" />
                        <p className="text-sm font-black text-white truncate">{ride.from}</p>
                      </div>
                      <div className="w-px h-4 bg-white/10 ml-[3.5px]" />
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent2 shadow-[0_0_8px_rgba(154,230,180,0.5)]" />
                        <p className="text-sm font-black text-white truncate">{ride.to}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-black text-white mb-0.5 tracking-tight">{ride.amount} <span className="text-[10px] text-white/30">CFA</span></p>
                      <p className="text-[10px] font-bold text-white/40">{ride.distance} · {ride.etaMin} min</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={() => acceptRide(ride)} 
                      className="flex-1 h-14 rounded-2xl bg-accent2 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-accent2/20 active:scale-95 transition-transform"
                    >
                      <Check className="w-4 h-4" />
                      Accepter
                    </button>
                    <button className="flex-1 h-14 rounded-2xl glass border border-white/10 text-white/40 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-transform">
                      <X className="w-4 h-4" />
                      Ignorer
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DriverDashboard;
