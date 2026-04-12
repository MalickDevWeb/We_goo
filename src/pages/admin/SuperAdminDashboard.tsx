import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Car, MapPin, DollarSign, BarChart3, Settings, Flag, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as api from '@/services/api';
import type { User, Driver, PlatformStats, FeatureFlags, Settings as SettingsType, Stand } from '@/types';

type Tab = 'dashboard' | 'users' | 'stats' | 'stands' | 'settings' | 'flags';

const SuperAdminDashboard = () => {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stands, setStands] = useState<Stand[]>([]);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [settings, setSettings] = useState<SettingsType | null>(null);

  useEffect(() => {
    api.getPlatformStats().then(setStats);
    api.getUsers().then(setUsers);
    api.getDrivers().then(setDrivers);
    api.getStands().then(setStands);
    api.getFeatureFlags().then(setFlags);
    api.getSettings().then(setSettings);
  }, []);

  const toggleBlock = async (person: User | Driver) => {
    const blocked = !person.blocked;
    if (person.userType === 'user') {
      const updated = await api.updateUser(person.id, { blocked });
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } else {
      const updated = await api.updateDriver(person.id, { blocked });
      setDrivers(prev => prev.map(d => d.id === updated.id ? updated : d));
    }
    toast.success(t('common.success'));
  };

  const saveFlags = async () => {
    if (!flags) return;
    await api.updateFeatureFlags(flags);
    toast.success(t('superAdmin.featureFlags.saved'));
  };

  const saveSettings = async () => {
    if (!settings) return;
    await api.updateSettings(settings);
    toast.success(t('superAdmin.settings.saved'));
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const tabsList: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: t('superAdmin.dashboard.title') },
    { key: 'users', label: t('superAdmin.users.title') },
    { key: 'stands', label: t('superAdmin.stands.title') },
    { key: 'settings', label: t('superAdmin.settings.title') },
    { key: 'flags', label: t('superAdmin.featureFlags.title') },
  ];

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom px-6">
      <div className="pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{t('superAdmin.dashboard.title')}</h1>
        <button onClick={handleLogout} className="text-sm text-muted-foreground tap-target">{t('common.logout')}</button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabsList.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={`px-3 py-2 rounded-xl text-xs font-medium tap-target whitespace-nowrap transition-all ${tab === tb.key ? 'gradient-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && stats && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users, value: stats.totalUsers, label: t('superAdmin.dashboard.totalUsers') },
            { icon: Car, value: stats.activeDrivers, label: t('superAdmin.dashboard.activeDrivers') },
            { icon: MapPin, value: stats.totalStands, label: t('superAdmin.dashboard.totalStands') },
            { icon: DollarSign, value: `$${stats.todayRevenue.toLocaleString()}`, label: t('superAdmin.dashboard.todayRevenue') },
            { icon: BarChart3, value: stats.totalRides, label: t('superAdmin.dashboard.totalRides') },
            { icon: Car, value: stats.activeRides, label: t('superAdmin.dashboard.activeRides') },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass rounded-xl p-4 text-center">
              <s.icon className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('superAdmin.users.users')}</h3>
          <div className="space-y-2 mb-6">
            {users.map(u => (
              <div key={u.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.phone}</p>
                </div>
                <button onClick={() => toggleBlock(u)} className={`text-xs px-3 py-1.5 rounded-full tap-target font-medium ${u.blocked ? 'bg-destructive/20 text-destructive' : 'bg-accent2/20 text-accent2'}`}>
                  {u.blocked ? t('superAdmin.users.unblock') : t('superAdmin.users.block')}
                </button>
              </div>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('superAdmin.users.drivers')}</h3>
          <div className="space-y-2">
            {drivers.map(d => (
              <div key={d.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.phone} · ⭐ {d.rating}</p>
                </div>
                <button onClick={() => toggleBlock(d)} className={`text-xs px-3 py-1.5 rounded-full tap-target font-medium ${d.blocked ? 'bg-destructive/20 text-destructive' : 'bg-accent2/20 text-accent2'}`}>
                  {d.blocked ? t('superAdmin.users.unblock') : t('superAdmin.users.block')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'stands' && (
        <div className="space-y-3">
          {stands.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center"><p className="text-muted-foreground text-sm">{t('superAdmin.stands.noStands')}</p></div>
          ) : stands.map(s => (
            <div key={s.id} className="glass rounded-xl p-4">
              <p className="font-medium text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.location} · {s.driversCount} {t('superAdmin.users.drivers')}</p>
              <p className="text-sm font-semibold text-accent2 mt-1">${s.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && settings && (
        <div className="space-y-4">
          {[
            { key: 'commissionRate', label: t('superAdmin.settings.commissionRate'), type: 'number' },
            { key: 'supportPhone', label: t('superAdmin.settings.supportPhone'), type: 'text' },
            { key: 'termsUrl', label: t('superAdmin.settings.termsUrl'), type: 'text' },
            { key: 'privacyUrl', label: t('superAdmin.settings.privacyUrl'), type: 'text' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-sm text-muted-foreground mb-1 block">{field.label}</label>
              <input
                type={field.type}
                value={String(settings[field.key] || '')}
                onChange={e => setSettings({ ...settings, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                className="w-full py-3 px-4 rounded-xl bg-secondary text-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
              />
            </div>
          ))}
          <button onClick={saveSettings} className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target">{t('common.save')}</button>
        </div>
      )}

      {tab === 'flags' && flags && (
        <div className="space-y-3">
          {([
            ['version2_vehicle_rental', t('superAdmin.featureFlags.rental')],
            ['version2_commerce', t('superAdmin.featureFlags.commerce')],
            ['version2_restaurants', t('superAdmin.featureFlags.restaurants')],
            ['version2_hotels', t('superAdmin.featureFlags.hotels')],
            ['version2_logistics', t('superAdmin.featureFlags.logistics')],
          ] as [keyof FeatureFlags, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setFlags({ ...flags, [key]: !flags[key] })} className="w-full glass rounded-xl p-4 flex items-center justify-between tap-target">
              <span className="text-sm text-foreground">{label}</span>
              <div className={`w-12 h-7 rounded-full flex items-center px-1 transition-all ${flags[key] ? 'bg-accent2' : 'bg-muted'}`}>
                <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${flags[key] ? 'translate-x-5' : ''}`} />
              </div>
            </button>
          ))}
          <button onClick={saveFlags} className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target mt-4">{t('common.save')}</button>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
