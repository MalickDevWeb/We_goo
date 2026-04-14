import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Car, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { Ride } from '@/types';

const DriverRides = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    if (session) api.getRidesByDriver(session.id).then(setRides);
  }, [session]);

  const statusColors: Record<string, string> = {
    completed: 'bg-accent2/20 text-accent2',
    'in-progress': 'bg-accent/20 text-accent',
    accepted: 'bg-primary/20 text-foreground',
    cancelled: 'bg-destructive/20 text-destructive',
    arriving: 'bg-accent/20 text-accent',
    available: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="h-[100svh] bg-background relative overflow-hidden flex flex-col safe-top">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent2/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 rounded-full glass-strong border border-white/10 flex items-center justify-center active:scale-90 transition-transform shadow-lg"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex flex-col items-center">
          <img src="/wego-logo.svg" alt="Wego" className="h-10 w-auto drop-shadow-lg" />
        </div>
        <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
           <Car className="w-5 h-5 text-accent" />
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-24">
        <h1 className="text-3xl font-black text-white tracking-tight mb-8">Vos Courses</h1>

        {rides.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-[40px] p-20 text-center border border-white/5 opacity-40 bg-white/[0.02]"
          >
            <Car className="w-16 h-16 text-white/40 mx-auto mb-6" />
            <p className="text-sm font-black text-white uppercase tracking-[0.2em]">{t('driver.rides.noRides')}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride, i) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-strong rounded-[32px] p-6 border border-white/5 relative overflow-hidden group hover:bg-white/[0.04] transition-colors"
                onClick={() => navigate(`/driver/tracking`)} // Simulate viewing details
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${statusColors[ride.status] || ''}`}>
                    {ride.status}
                  </div>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{ride.date}</span>
                </div>

                <div className="space-y-4 mb-5">
                   <div className="flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      <p className="text-sm font-black text-white truncate leading-tight">{ride.from}</p>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent2 mt-1.5 shrink-0" />
                      <p className="text-sm font-black text-white truncate leading-tight">{ride.to}</p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Navigation className="w-4 h-4 text-white/30" />
                     </div>
                     <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{ride.distance}</span>
                  </div>
                  <p className="text-2xl font-black text-white tracking-tight">
                    {ride.amount} <span className="text-[10px] text-white/30 ml-0.5">CFA</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverRides;
