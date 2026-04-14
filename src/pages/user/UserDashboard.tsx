import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Car, ArrowRight, Plus, MessageCircle, AlertTriangle, Package, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { servicesCatalog } from '@/lib/servicesCatalog';
import WegoMap from '@/components/WegoMap';
import * as api from '@/services/api';
import type { User, Ride } from '@/types';

const RidesList = ({ userId }: { userId: number }) => {
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    api.getRidesByUser(userId).then(r => setRides(r.slice(0, 3)));
  }, [userId]);

  return (
    <div className="space-y-3">
      {rides.map(ride => (
        <div key={ride.id} className="glass rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{ride.from} → {ride.to}</p>
            <p className="text-xs text-muted-foreground">{ride.date}</p>
          </div>
          <span className="text-sm font-semibold text-foreground">${ride.amount}</span>
        </div>
      ))}
    </div>
  );
};

const UserDashboard = () => {
  const { t } = useTranslation();
  const { session, profile, setProfile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (session && !profile) {
      api.getUserById(session.id).then(u => u && setProfile(u));
    }
  }, [session, profile, setProfile]);

  const user = profile as User | null;

  const quickActions = [
    { icon: AlertTriangle, label: t('user.emergency.title'), path: '/user/emergency', color: 'text-destructive' },
    { icon: Package, label: t('user.package.title'), path: '/user/package', color: 'text-accent2' },
    { icon: Search, label: t('user.lostItem.title'), path: '/user/lost-item', color: 'text-foreground' },
  ];

  return (
    <div className="h-full safe-top px-6 flex flex-col overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.18 }} 
        className="mt-2 mb-4 shrink-0"
      >
        <h1 className="text-base font-bold text-foreground mb-3">
          {t('user.dashboard.chooseService')}
        </h1>
        
        {/* Row 1 */}
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-6 px-6 mb-2">
          {servicesCatalog.filter(s => s.available || s.flag).slice(0, 3).map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.button
                key={service.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                onClick={() => navigate(`/services/${service.key}`)}
                className={`relative overflow-hidden rounded-[28px] h-32 w-44 shrink-0 shadow-2xl shadow-black/20 tap-target transition-all active:scale-[0.96] group ${!service.available ? 'opacity-70' : ''}`}
              >
                <img src={service.imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {service.flag && (
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-accent/90 backdrop-blur-md border border-white/10 shadow-lg">
                    <span className="text-[7px] font-black text-white uppercase tracking-tighter italic">Nouveau !</span>
                  </div>
                )}

                <div className="absolute left-4 right-4 bottom-4 flex flex-col gap-1">
                   <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-inner">
                     <Icon className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-sm font-black text-white tracking-tight leading-none pt-1">
                     {t(`services.${service.key}.title`)}
                   </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Row 2 */}
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-6 px-6">
          {servicesCatalog.filter(s => s.available || s.flag).slice(3).map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.button
                key={service.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                onClick={() => navigate(`/services/${service.key}`)}
                className={`relative overflow-hidden rounded-[28px] h-32 w-44 shrink-0 shadow-2xl shadow-black/20 tap-target transition-all active:scale-[0.96] group ${!service.available ? 'opacity-70' : ''}`}
              >
                <img src={service.imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {!service.available && (
                   <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/5">
                     <span className="text-[7px] font-bold text-white/60 uppercase">{t('common.comingSoon')}</span>
                   </div>
                )}

                <div className="absolute left-4 right-4 bottom-4 flex flex-col gap-1">
                   <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-inner">
                     <Icon className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-sm font-black text-white tracking-tight leading-none pt-1">
                     {t(`services.${service.key}.title`)}
                   </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Rides */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.6 }}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="flex items-center justify-between mb-4 px-1 shrink-0">
          <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t('user.dashboard.recentRides')}</h2>
          <button className="text-[10px] font-black text-accent uppercase tracking-widest active:scale-95 transition-all">VOIR TOUT</button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-6 rounded-[32px]">
          {(user?.totalRides || 0) === 0 ? (
            <div className="relative overflow-hidden rounded-[32px] h-[180px] group">
              {/* Dynamic Map Background */}
              <div className="absolute inset-0 z-0">
                <WegoMap markers={[]} zoom={14} variant="dark" className="w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 backdrop-blur-[1px] group-hover:backdrop-blur-none transition-all duration-700" />
              </div>

              {/* Glass Overlay Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[18px] bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-2xl">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg -mb-1">{t('user.dashboard.noRides')}</h3>
                    <p className="text-white/50 text-[10px] font-bold tracking-tight">
                      {t('user.dashboard.bookYourFirst')}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('/services/rides')} 
                  className="w-full h-14 rounded-[20px] glass border border-white/10 text-white font-black text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                  <span>{t('user.dashboard.bookNow')}</span>
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <RidesList userId={user?.id || 0} />
          )}
        </div>
      </motion.div>

      {/* FAB Chat */}
      <button
        onClick={() => navigate('/user/chat')}
        className="fixed bottom-[90px] right-6 w-14 h-14 bg-accent rounded-full shadow-lg shadow-accent/40 flex items-center justify-center text-white tap-target transition-transform active:scale-95 z-50"
        aria-label={t('user.chat.title')}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default UserDashboard;
