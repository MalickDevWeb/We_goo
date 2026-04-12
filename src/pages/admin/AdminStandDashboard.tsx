import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { DollarSign, Users, Car, AlertTriangle, Search, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as api from '@/services/api';
import type { User, Driver } from '@/types';

const AdminStandDashboard = () => {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'dashboard' | 'recharge' | 'drivers'>('dashboard');
  const [searchPhone, setSearchPhone] = useState('');
  const [foundPerson, setFoundPerson] = useState<(User | Driver) | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => { api.getDrivers().then(setDrivers); }, []);

  const handleSearch = async () => {
    const user = await api.getUserByPhone(searchPhone);
    if (user) { setFoundPerson(user); return; }
    const driver = await api.getDriverByPhone(searchPhone);
    if (driver) { setFoundPerson(driver); return; }
    setFoundPerson(null);
    toast.error(t('adminStand.recharge.notFound'));
  };

  const handleRecharge = async () => {
    if (!foundPerson || !rechargeAmount) return;
    const amount = parseInt(rechargeAmount);
    const newBalance = foundPerson.walletBalance + amount;
    if (foundPerson.userType === 'user') await api.updateUser(foundPerson.id, { walletBalance: newBalance });
    else await api.updateDriver(foundPerson.id, { walletBalance: newBalance });
    await api.createTransaction({ userId: foundPerson.id, type: 'credit', title: t('user.wallet.recharge'), amount, date: new Date().toISOString().split('T')[0], balance: newBalance });
    toast.success(t('adminStand.recharge.success', { amount: String(amount), name: foundPerson.name }));
    setFoundPerson({ ...foundPerson, walletBalance: newBalance });
    setRechargeAmount('');
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const tabs = [
    { key: 'dashboard' as const, label: t('adminStand.dashboard.title') },
    { key: 'recharge' as const, label: t('adminStand.recharge.title') },
    { key: 'drivers' as const, label: t('adminStand.drivers.title') },
  ];

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom px-6">
      <div className="pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{t('adminStand.dashboard.title')}</h1>
        <button onClick={handleLogout} className="text-sm text-muted-foreground tap-target">{t('common.logout')}</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={`px-4 py-2 rounded-xl text-sm font-medium tap-target whitespace-nowrap transition-all ${tab === tb.key ? 'gradient-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: DollarSign, value: '$45,000', label: t('adminStand.dashboard.revenue'), color: 'text-accent2' },
            { icon: Users, value: '15', label: t('adminStand.dashboard.activeDrivers'), color: 'text-accent' },
            { icon: Car, value: '128', label: t('adminStand.dashboard.recharges'), color: 'text-foreground' },
            { icon: AlertTriangle, value: '$2,300', label: t('adminStand.dashboard.debts'), color: 'text-destructive' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4 text-center">
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'recharge' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input value={searchPhone} onChange={e => setSearchPhone(e.target.value)} placeholder={t('adminStand.recharge.searchPlaceholder')} className="flex-1 py-4 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target" />
            <button onClick={handleSearch} className="px-4 rounded-xl gradient-accent text-accent-foreground tap-target"><Search className="w-5 h-5" /></button>
          </div>
          {foundPerson && (
            <div className="glass rounded-2xl p-5">
              <p className="text-sm text-accent2 mb-1">{t('adminStand.recharge.userFound')}</p>
              <p className="font-semibold text-foreground">{foundPerson.name}</p>
              <p className="text-sm text-muted-foreground mb-4">{t('user.wallet.balance')}: ${foundPerson.walletBalance}</p>
              <input type="number" value={rechargeAmount} onChange={e => setRechargeAmount(e.target.value)} placeholder={t('adminStand.recharge.amount')} className="w-full py-4 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target mb-4" />
              <button onClick={handleRecharge} disabled={!rechargeAmount} className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target disabled:opacity-40">{t('adminStand.recharge.confirm')}</button>
            </div>
          )}
        </div>
      )}

      {tab === 'drivers' && (
        <div className="space-y-3">
          {drivers.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center"><p className="text-muted-foreground text-sm">{t('adminStand.drivers.noDrivers')}</p></div>
          ) : drivers.map(d => (
            <div key={d.id} className="glass rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{d.name}</p>
                <p className="text-xs text-muted-foreground">⭐ {d.rating} · {d.totalRides} {t('driver.dashboard.rides')}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${d.isOnline ? 'bg-accent2/20 text-accent2' : 'bg-muted text-muted-foreground'}`}>
                {d.isOnline ? t('driver.dashboard.online') : t('driver.dashboard.offline')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminStandDashboard;
