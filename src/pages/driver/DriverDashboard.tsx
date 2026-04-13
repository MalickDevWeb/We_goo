import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Power, Star, Car, DollarSign, Clock, Check, X, List, TrendingUp, Wallet, MessageCircle } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom px-6">
      <div className="pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-accent overflow-hidden bg-accent/20">
            <img src={driverPhoto} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{t('driver.dashboard.title')}</h1>
        </div>
        <button onClick={handleLogout} className="text-sm text-muted-foreground tap-target">{t('common.logout')}</button>
      </div>

      {/* Online Toggle */}
      <motion.button
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onClick={toggleOnline}
        className={`w-full rounded-2xl p-5 flex items-center justify-between tap-target mb-5 transition-all ${driver?.isOnline ? 'bg-accent2/10 border border-accent2/30' : 'glass'}`}
      >
        <div className="flex items-center gap-3">
          <Power className={`w-6 h-6 ${driver?.isOnline ? 'text-accent2' : 'text-muted-foreground'}`} />
          <span className={`font-semibold ${driver?.isOnline ? 'text-accent2' : 'text-muted-foreground'}`}>
            {driver?.isOnline ? t('driver.dashboard.online') : t('driver.dashboard.offline')}
          </span>
        </div>
        <div className={`w-12 h-7 rounded-full flex items-center px-1 transition-all ${driver?.isOnline ? 'bg-accent2' : 'bg-muted'}`}>
          <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${driver?.isOnline ? 'translate-x-5' : ''}`} />
        </div>
      </motion.button>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3 mb-5">
        {[
          { icon: Car, value: driver?.todayRides || 0, label: t('driver.dashboard.rides'), color: 'text-accent' },
          { icon: DollarSign, value: `$${driver?.todayEarnings || 0}`, label: t('driver.dashboard.earnings'), color: 'text-accent2' },
          { icon: Clock, value: `${driver?.hoursWorked || 0}h`, label: t('driver.dashboard.hours'), color: 'text-foreground' },
          { icon: Star, value: driver?.rating || 0, label: t('driver.dashboard.rating'), color: 'text-accent' },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-4 text-center">
            <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Navigation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex gap-3 mb-5 overflow-x-auto pb-1">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="glass rounded-xl p-3 flex flex-col items-center gap-2 min-w-[76px] tap-target transition-all active:scale-[0.96]"
          >
            <item.icon className="w-5 h-5 text-accent" />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Available Rides */}
      <h2 className="text-lg font-semibold text-foreground mb-4">{t('driver.dashboard.availableRides')}</h2>
      {availableRides.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Car className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{t('driver.dashboard.noRides')}</p>
        </div>
      ) : (
        <div className="space-y-3 pb-6">
          {availableRides.map(ride => (
            <motion.div key={ride.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-xl p-4">
              <p className="text-sm font-medium text-foreground mb-1">{ride.from} → {ride.to}</p>
              <p className="text-xs text-muted-foreground mb-2">{ride.distance} · ~{ride.etaMin} min</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-accent">${ride.amount}</span>
                <div className="flex gap-2">
                  <button onClick={() => acceptRide(ride)} className="w-10 h-10 rounded-full bg-accent2/20 flex items-center justify-center tap-target" aria-label={t('common.accept')}>
                    <Check className="w-5 h-5 text-accent2" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center tap-target" aria-label={t('common.cancel')}>
                    <X className="w-5 h-5 text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
