import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Car, 
  MapPin, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Flag, 
  ShieldAlert, 
  ShieldCheck,
  Store,
  Hotel,
  ArrowUpRight,
  Search,
  MoreVertical,
  Bell,
  LogOut,
  ChevronRight,
  Zap,
  Activity,
  Globe,
  Radio,
  Cpu,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  Truck,
  Download
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as api from '@/services/api';
import type { User, Driver, PlatformStats, FeatureFlags, Settings as SettingsType, Merchant, Broadcast, SystemMetrics } from '@/types';

type Tab = 'overview' | 'live' | 'entities' | 'merchants' | 'broadcast' | 'finance' | 'system';

const SuperAdminDashboard = () => {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [settingsData, setSettingsData] = useState<SettingsType | null>(null);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [targetRole, setTargetRole] = useState<'all' | 'user' | 'driver' | 'merchant'>('all');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [isRebooting, setIsRebooting] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<{ id: number; x: number; y: number; type: 'car' | 'bike' }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [s, u, d, f, st, m, b, mt] = await Promise.all([
        api.getPlatformStats(),
        api.getUsers(),
        api.getDrivers(),
        api.getFeatureFlags(),
        api.getSettings(),
        api.getMerchants(),
        api.getBroadcasts(),
        api.getSystemMetrics()
      ]);
      setStats(s);
      setUsers(u);
      setDrivers(d);
      setFlags(f);
      setSettingsData(st);
      setMerchants(m);
      setBroadcasts(b);
      setMetrics(mt);
    };
    fetchData();

    // Map Simulation markers
    const initialMarkers = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      type: Math.random() > 0.3 ? 'car' : ('bike' as any)
    }));
    setMapMarkers(initialMarkers);

    const mapInterval = setInterval(() => {
      setMapMarkers(prev => prev.map(m => ({
        ...m,
        x: m.x + (Math.random() - 0.5) * 2,
        y: m.y + (Math.random() - 0.5) * 2
      })));
    }, 4000);

    const metricsInterval = setInterval(async () => {
      if (tab === 'system') {
        const newMetrics = await api.getSystemMetrics();
        setMetrics(newMetrics);
      }
    }, 5000);

    return () => {
      clearInterval(mapInterval);
      clearInterval(metricsInterval);
    };
  }, [tab]);

  const handleLogout = () => { logout(); navigate('/'); };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    const newBroadcast = await api.createBroadcast({ message: broadcastMsg, target: targetRole });
    setBroadcasts(prev => [newBroadcast, ...prev]);
    toast.success(`Broadcast envoyé à : ${targetRole.toUpperCase()}`);
    setBroadcastMsg('');
  };

  const toggleUserBlock = async (userId: number, currentBlocked: boolean) => {
    await api.updateUser(userId, { blocked: !currentBlocked });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: !currentBlocked } : u));
    toast.success(`Utilisateur ${!currentBlocked ? 'bloqué' : 'débloqué'}`);
  };

  const toggleDriverBlock = async (driverId: number, currentBlocked: boolean) => {
    await api.updateDriver(driverId, { blocked: !currentBlocked });
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, blocked: !currentBlocked } : d));
    toast.success(`Chauffeur ${!currentBlocked ? 'bloqué' : 'débloqué'}`);
  };

  const toggleFlag = async (key: keyof FeatureFlags) => {
    if (!flags) return;
    const newFlags = { ...flags, [key]: !flags[key] };
    await api.updateFeatureFlags({ [key]: !flags[key] });
    setFlags(newFlags);
    toast.success(`Feature Flag ${key} updated`);
  };

  const updateCommission = async (rate: number) => {
    if (!settingsData) return;
    const newSettings = await api.updateSettings({ commissionRate: rate });
    setSettingsData(newSettings);
    toast.success(`Commission mise à jour : ${rate}%`);
  };

  const updateMerchantStatus = async (merchantId: number, status: 'active' | 'suspended') => {
    const updated = await api.updateMerchant(merchantId, { status });
    setMerchants(prev => prev.map(m => m.id === merchantId ? updated : m));
    toast.success(`Marchand ${status === 'active' ? 'activé' : 'suspendu'}`);
  };

  const handleAdjustWallet = async () => {
    if (!selectedUser || !adjAmount) return;
    try {
      const updated = await api.adjustWallet(selectedUser.id, parseFloat(adjAmount), adjReason);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      toast.success(`Ajustement de ${adjAmount} CFA effectué pour ${selectedUser.name}`);
      setSelectedUser(null);
      setAdjAmount('');
      setAdjReason('');
    } catch (e) {
      toast.error("Erreur lors de l'ajustement");
    }
  };

  const handleReboot = async () => {
    setIsRebooting(true);
    toast.loading("Rebooting all system clusters...", { duration: 2000 });
    await api.rebootNodes();
    setIsRebooting(false);
    toast.success("All nodes online. Integrity check passed.");
  };

  return (
    <div className="h-[100svh] bg-[#020617] overflow-hidden flex flex-col font-sans selection:bg-accent/30 relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <header className="shrink-0 pt-8 px-6 pb-6 flex items-center justify-between sticky top-0 bg-[#020617]/80 backdrop-blur-xl z-[100] border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 shadow-2xl shadow-blue-500/20">
              <div className="w-full h-full rounded-[14px] bg-secondary flex items-center justify-center border-2 border-[#020617]">
                 <ShieldAlert className="w-6 h-6 text-blue-400" />
              </div>
           </div>
           <div>
              <h1 className="text-xl font-black text-white tracking-widest uppercase">Wego God Mode</h1>
              <div className="flex items-center gap-1.5 pt-0.5">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
                 <span className="text-[10px] font-black text-blue-400/40 uppercase tracking-[0.2em]">Omniscient Access Active</span>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden md:flex flex-col items-end mr-2">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Server Load</p>
              <div className="w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                 <div className="w-[34%] h-full bg-blue-500" />
              </div>
           </div>
            <button 
              onClick={handleLogout} 
              aria-label="Logout"
              className="w-10 h-10 rounded-xl glass-strong border border-white/10 flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all font-sans"
            >
               <LogOut className="w-5 h-5" />
            </button>
        </div>
      </header>

      <nav className="shrink-0 px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-[#020617]/40 backdrop-blur-md">
         {[
           { key: 'overview', icon: Activity, label: 'Overview' },
           { key: 'live', icon: Radio, label: 'Live Map' },
           { key: 'entities', icon: Users, label: 'Users' },
           { key: 'merchants', icon: Store, label: 'Merchants' },
           { key: 'broadcast', icon: MessageSquare, label: 'Broadcast' },
           { key: 'finance', icon: DollarSign, label: 'Financials' },
           { key: 'system', icon: Cpu, label: 'System' },
         ].map((tb) => (
           <button
             key={tb.key}
             onClick={() => setTab(tb.key as Tab)}
             aria-label={`Mode : ${tb.label}`}
             className={`shrink-0 px-5 py-2.5 rounded-2xl flex items-center gap-2.5 transition-all active:scale-95 ${tab === tb.key ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'glass-strong text-white/30 border border-white/5 hover:text-white/60'}`}
           >
             <tb.icon className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">{tb.label}</span>
           </button>
         ))}
      </nav>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24 relative z-10">
         <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
                {tab === 'overview' && stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        {[
                          { icon: DollarSign, label: 'Today Revenue', value: stats.todayRevenue.toLocaleString() + ' CFA', color: 'text-green-400' },
                          { icon: Zap, label: 'Active Sockets', value: '4,102', color: 'text-blue-400' },
                          { icon: Truck, label: 'Current Deliveries', value: stats.activeRides, color: 'text-amber-400' },
                          { icon: Globe, label: 'Regions Active', value: '8', color: 'text-purple-400' },
                        ].map((s, i) => (
                          <div key={i} className="glass-strong rounded-[32px] p-8 border border-white/10 relative overflow-hidden group hover:border-blue-500/20 transition-all">
                             <s.icon className={`w-6 h-6 ${s.color} mb-4`} />
                             <p className="text-3xl font-black text-white tracking-tighter">{s.value}</p>
                             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-2">{s.label}</p>
                             <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="w-4 h-4 text-white/20" />
                             </div>
                          </div>
                        ))}
                     </div>
  
                     <div className="glass-strong rounded-[32px] p-6 border border-white/10 flex flex-col h-full bg-[#020617]/60">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Real-time Stream</h3>
                           <button onClick={() => { api.getPlatformStats().then(setStats); toast.success("Sinc..."); }} className="p-2 rounded-lg glass-strong text-white/20 hover:text-white transition-colors">
                              <RefreshCw className="w-3 h-3" />
                           </button>
                        </div>
                        <div className="flex-1 space-y-4 overflow-hidden">
                           {['User #1042 ACCEPTED ride #9902', 'Partner "Le Gourmet" COMPLETED order #512', 'New Driver REGISTRATION: Mamadou S.'].map((log, i) => (
                             <div key={i} className="flex gap-3 items-start animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="w-1.5 h-1.5 bg-blue-500/40 rounded-full mt-1.5" />
                                <p className="text-[11px] font-mono text-white/40 leading-relaxed italic truncate">{log}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}

               {tab === 'broadcast' && (
                 <div className="max-w-xl mx-auto space-y-8 py-10">
                    <div className="text-center">
                       <div className="w-20 h-20 rounded-[32px] bg-blue-500/10 flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                          <Radio className="w-10 h-10 text-blue-400 animate-pulse" />
                       </div>
                       <h2 className="text-2xl font-black text-white tracking-tight">Supreme Broadcast</h2>
                    </div>
                    <div className="space-y-6">
                       <div className="flex gap-2">
                          {['all', 'user', 'driver', 'merchant'].map((r) => (
                            <button key={r} onClick={() => setTargetRole(r as any)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${targetRole === r ? 'bg-blue-500 text-white' : 'glass-strong text-white/20'}`}>{r}</button>
                          ))}
                       </div>
                       <textarea value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} placeholder="Message..." className="w-full h-40 glass-strong rounded-[32px] p-8 text-sm text-white outline-none border border-white/5 focus:border-blue-500/30 transition-all resize-none" />
                       <button onClick={sendBroadcast} className="w-full h-16 rounded-[24px] bg-blue-600 text-white font-black uppercase tracking-[0.4em] text-xs transition-all flex items-center justify-center gap-3"><Zap className="w-5 h-5" /> Execute Broadcast</button>
                    </div>
                 </div>
               )}

               {tab === 'live' && (
                 <div className="h-[60vh] glass-strong rounded-[40px] border border-white/10 relative overflow-hidden bg-[#020617]/40 ring-1 ring-blue-500/10">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                       <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                       <div className="w-80 h-80 rounded-full border border-blue-500/10 animate-[ping_3s_infinite]" />
                    </div>
                    {mapMarkers.map(m => (
                      <motion.div key={m.id} initial={false} animate={{ x: `${m.x}%`, y: `${m.y}%` }} transition={{ duration: 4, ease: "linear" }} className="absolute w-8 h-8 -ml-4 -mt-4 rounded-xl glass-strong border border-blue-500/30 flex items-center justify-center shadow-2xl group">
                         {m.type === 'car' ? <Car className="w-4 h-4 text-blue-400" /> : <Zap className="w-4 h-4 text-amber-400" />}
                         <div className="absolute inset-0 rounded-xl border border-blue-400/20 animate-pulse" />
                      </motion.div>
                    ))}
                    <div className="absolute bottom-8 left-8 p-4 glass-strong rounded-2xl border border-white/5">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Live Sync: Active</span>
                       </div>
                    </div>
                 </div>
               )}

               {tab === 'finance' && (
                 <div className="space-y-8 animate-in slide-in-from-right duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="glass-strong rounded-[40px] p-10 border border-white/10 bg-gradient-to-br from-[#020617] to-blue-900/10">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Global Liquidity</p>
                          <p className="text-4xl font-black text-white tracking-tighter">142,500,000 CFA</p>
                       </div>
                       <div className="glass-strong rounded-[40px] p-10 border border-white/10 flex flex-col justify-center">
                          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Platform Fee (15%)</p>
                          <p className="text-4xl font-black text-white tracking-tighter">21,375,000 CFA</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       {[ { desc: 'Adjustment #1002', amount: '+ 50,000', admin: 'Root', time: '10m' } ].map((tx, i) => (
                         <div key={i} className="p-6 rounded-[28px] glass-strong border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <h4 className="text-sm font-bold text-white">{tx.desc}</h4>
                            <span className="text-sm font-black text-green-500">{tx.amount} CFA</span>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {tab === 'entities' && (
                 <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <div className="glass-strong rounded-[40px] border border-white/10 overflow-hidden">
                          <div className="p-6 border-b border-white/5 bg-white/5">
                             <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Users ({users.length})</h3>
                          </div>
                          <div className="divide-y divide-white/5">
                             {users.map(u => (
                               <div key={u.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                  <div className="flex items-center gap-3">
                                     <Users className="w-5 h-5 text-blue-400" />
                                     <p className="text-xs font-bold text-white">{u.name}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <button onClick={() => setSelectedUser(u)} className="w-8 h-8 rounded-lg glass-strong text-blue-400/60 transition-all"><DollarSign className="w-4 h-4" /></button>
                                     <button onClick={() => toggleUserBlock(u.id, !!u.blocked)} className={`w-8 h-8 rounded-lg ${u.blocked ? 'text-red-500' : 'text-white/20'}`}>{u.blocked ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}</button>
                                  </div>
                               </div>
                             ))}
                             <AnimatePresence>
                               {selectedUser && (
                                 <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-blue-500/5 p-6 space-y-4">
                                    <div className="flex gap-3">
                                       <input value={adjAmount} onChange={e => setAdjAmount(e.target.value)} placeholder="Amount" className="flex-1 glass-strong rounded-xl p-3 text-xs text-white" />
                                       <button onClick={handleAdjustWallet} className="px-6 rounded-xl bg-blue-600 text-white text-[10px] font-black">Apply</button>
                                    </div>
                                 </motion.div>
                               )}
                             </AnimatePresence>
                          </div>
                       </div>
                       <div className="glass-strong rounded-[40px] border border-white/10 overflow-hidden">
                          <div className="p-6 border-b border-white/5 bg-white/5">
                             <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Drivers ({drivers.length})</h3>
                          </div>
                          <div className="divide-y divide-white/5">
                             {drivers.map(d => (
                               <div key={d.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                  <p className="text-xs font-bold text-white">{d.name}</p>
                                  <button onClick={() => toggleDriverBlock(d.id, !!d.blocked)} className={`w-8 h-8 rounded-lg ${d.blocked ? 'text-red-500' : 'text-white/20'}`}>{d.blocked ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}</button>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {tab === 'merchants' && (
                 <div className="max-w-4xl mx-auto space-y-4">
                    {merchants.map(m => (
                      <div key={m.id} className="p-6 rounded-[32px] glass-strong border border-white/5 flex items-center justify-between">
                         <h4 className="text-sm font-bold text-white">{m.name}</h4>
                         <button onClick={() => updateMerchantStatus(m.id, m.status === 'active' ? 'suspended' : 'active')} className={`w-10 h-10 rounded-xl ${m.status === 'active' ? 'text-white/20' : 'text-green-500'}`}>{m.status === 'active' ? <LogOut className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}</button>
                      </div>
                    ))}
                 </div>
               )}

               {tab === 'system' && flags && metrics && (
                 <div className="max-w-4xl mx-auto space-y-12 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {[ { label: 'CPU', val: metrics.cpuUsage.toFixed(1) + '%' }, { label: 'RAM', val: metrics.memoryUsage.toFixed(1) + '%' } ].map((m, i) => (
                         <div key={i} className="glass-strong p-6 rounded-[32px] border border-white/10">
                            <p className="text-xl font-black text-white">{m.val}</p>
                            <p className="text-[8px] font-black text-white/20 uppercase mt-1">{m.label}</p>
                         </div>
                       ))}
                    </div>
                    <div className="p-6 rounded-[28px] bg-red-500/10 border border-red-500/20">
                       <button onClick={handleReboot} disabled={isRebooting} className="w-full py-4 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase">{isRebooting ? '...' : 'Force Reboot'}</button>
                    </div>
                 </div>
               )}

            </motion.div>
         </AnimatePresence>
      </main>

      <footer className="shrink-0 h-10 bg-[#020617] border-t border-white/5 px-6 flex items-center justify-between relative z-[100]">
         <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Sys. Status: <span className="text-green-500">Healthy</span></p>
         <p className="text-[9px] font-mono text-white/10 uppercase tracking-widest">We_goo Kernel v2.4.0-admin</p>
      </footer>
    </div>
  );
};

export default SuperAdminDashboard;
