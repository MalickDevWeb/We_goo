import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Car, ArrowRight, Plus, MessageCircle, AlertTriangle, Package, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
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
    { icon: MessageCircle, label: t('user.chat.title'), path: '/user/chat', color: 'text-accent' },
    { icon: AlertTriangle, label: t('user.emergency.title'), path: '/user/emergency', color: 'text-destructive' },
    { icon: Package, label: t('user.package.title'), path: '/user/package', color: 'text-accent2' },
    { icon: Search, label: t('user.lostItem.title'), path: '/user/lost-item', color: 'text-foreground' },
  ];

  return (
    <div className="safe-top px-6 pb-6">
      <div className="pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{t('splash.tagline')}</p>
            <h1 className="text-xl font-bold text-foreground mt-1">
              {t('user.dashboard.hello', { name: user?.name?.split(' ')[0] || '' })}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-sm font-bold text-accent">{user?.name?.charAt(0) || 'U'}</span>
          </div>
        </div>
      </div>

      {/* Wallet */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">{t('user.dashboard.balance')}</span>
          </div>
          <button onClick={() => navigate('/user/wallet')} className="flex items-center gap-1 text-xs text-accent tap-target px-2 py-1">
            <Plus className="w-3.5 h-3.5" />{t('user.dashboard.recharge')}
          </button>
        </div>
        <p className="text-3xl font-bold text-foreground">${user?.walletBalance?.toLocaleString() || '0'}</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-4 mb-5">
        <div className="glass rounded-2xl p-4 text-center">
          <Car className="w-5 h-5 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{user?.totalRides || 0}</p>
          <p className="text-xs text-muted-foreground">{t('user.dashboard.rides')}</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-accent2 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">${user?.totalSpent || 0}</p>
          <p className="text-xs text-muted-foreground">{t('user.dashboard.spent')}</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-5">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {quickActions.map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="glass rounded-xl p-3 flex flex-col items-center gap-2 min-w-[76px] tap-target transition-all active:scale-[0.96]"
            >
              <action.icon className={`w-5 h-5 ${action.color}`} />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Recent Rides */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('user.dashboard.recentRides')}</h2>
        {(user?.totalRides || 0) === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Car className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">{t('user.dashboard.noRides')}</p>
            <button onClick={() => navigate('/user/booking')} className="mt-4 gradient-accent text-accent-foreground px-6 py-3 rounded-xl text-sm font-medium tap-target inline-flex items-center gap-2 transition-transform active:scale-[0.98]">
              {t('user.dashboard.bookNow')}<ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <RidesList userId={user?.id || 0} />
        )}
      </motion.div>
    </div>
  );
};

export default UserDashboard;
