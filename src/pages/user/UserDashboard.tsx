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
    <div className="min-h-full safe-top px-6 pb-20">


      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.18 }} 
        className="mt-4 mb-8"
      >
        <h1 className="text-lg font-bold text-foreground mb-4">
          {t('user.dashboard.chooseService')}
        </h1>


        
        {/* Row 1 */}
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-6 px-6 mb-2">
          {servicesCatalog.filter(s => s.available || s.flag).slice(0, 3).map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.key}
                onClick={() => navigate(`/services/${service.key}`)}
                className={`relative overflow-hidden rounded-2xl h-28 w-40 shrink-0 glass tap-target transition-all active:scale-[0.98] ${!service.available ? 'opacity-60' : ''}`}
              >
                <img src={service.imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {!service.available && (
                  <span className="absolute top-2 right-2 text-[8px] font-bold bg-accent2 text-accent2-foreground px-1.5 py-0.5 rounded-full uppercase">
                    Bientôt
                  </span>
                )}
                <div className="absolute left-3 right-3 bottom-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white truncate text-left">
                    {t(`services.${service.key}.title`)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Row 2 */}
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-6 px-6">
          {servicesCatalog.filter(s => s.available || s.flag).slice(3).map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.key}
                onClick={() => navigate(`/services/${service.key}`)}
                className={`relative overflow-hidden rounded-2xl h-28 w-40 shrink-0 glass tap-target transition-all active:scale-[0.98] ${!service.available ? 'opacity-60' : ''}`}
              >
                <img src={service.imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {!service.available && (
                  <span className="absolute top-2 right-2 text-[8px] font-bold bg-accent2 text-accent2-foreground px-1.5 py-0.5 rounded-full uppercase">
                    Bientôt
                  </span>
                )}
                <div className="absolute left-3 right-3 bottom-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white truncate text-left">
                    {t(`services.${service.key}.title`)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Rides */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('user.dashboard.recentRides')}</h2>
        {(user?.totalRides || 0) === 0 ? (
          <div className="relative overflow-hidden rounded-3xl h-[180px] shadow-xl border border-white/5 bg-[#121212]">
            {/* Adjusted Map Background (Slightly Darkened) */}
            <div className="absolute inset-0 z-0">
              <WegoMap markers={[]} center={[4.3857, 18.5562]} zoom={13} variant="dark" className="w-full h-full opacity-80" />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            {/* Compact Content Overlay */}
            <div className="relative z-10 h-full flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-bold text-base mb-0.5 drop-shadow-md">
                    {t('user.dashboard.noRides')}
                  </h3>
                  <p className="text-white/70 text-[11px] max-w-[140px] leading-tight drop-shadow-sm font-medium">
                    Réservez votre premier trajet avec We_goo.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/user/booking')} 
                className="gradient-accent text-accent-foreground w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl shadow-accent/40 active:scale-90 transition-all hover:scale-105"
                aria-label={t('user.dashboard.bookNow')}
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <RidesList userId={user?.id || 0} />
        )}
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
