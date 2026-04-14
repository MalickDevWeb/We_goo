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
import type { User, Driver, PlatformStats, FeatureFlags, Settings as SettingsType, Stand } from '@/types';

type Tab = 'overview' | 'live' | 'entities' | 'merchants' | 'broadcast' | 'finance' | 'system';

const SuperAdminDashboard = () => {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [targetRole, setTargetRole] = useState<'all' | 'user' | 'driver' | 'merchant'>('all');

  useEffect(() => {
    api.getPlatformStats().then(setStats);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const sendBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    toast.success(`Broadcast envoyé à : ${targetRole.toUpperCase()}`);
    setBroadcastMsg('');
  };

  return (
    <div className="h-[100svh] bg-[#020617] overflow-hidden flex flex-col font-sans selection:bg-accent/30 relative">
      {/* Matrix Style Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Supreme Header */}
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
           <button onClick={handleLogout} className="w-10 h-10 rounded-xl glass-strong border border-white/10 flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all">
              <LogOut className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* God Navigation */}
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

      {/* Infinite Scroll Main Area */}
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
                    {/* Main Stats */}
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
                         </div>
                       ))}
                    </div>

                    {/* System Log Snippet */}
                    <div className="glass-strong rounded-[32px] p-6 border border-white/10 flex flex-col h-full bg-[#020617]/60">
                       <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Real-time Event Stream</h3>
                       <div className="flex-1 space-y-4 overflow-hidden">
                          {[
                            'User #1042 ACCEPTED ride #9902',
                            'Partner "Le Gourmet" COMPLETED order #512',
                            'New Driver REGISTRATION pending: Mamadou S.',
                            'System: Automated database optimization SUCCESS',
                            'Alert: High demand detected in Plateau',
                          ].map((log, i) => (
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
                       <p className="text-xs text-white/30 uppercase tracking-widest mt-2">Send high-priority alerts across the platform</p>
                    </div>

                    <div className="space-y-6">
                       <div className="flex gap-2">
                          {['all', 'user', 'driver', 'merchant'].map((r) => (
                            <button
                              key={r}
                              onClick={() => setTargetRole(r as any)}
                              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${targetRole === r ? 'bg-blue-500 border-blue-400 text-white shadow-lg' : 'glass-strong border-white/5 text-white/20'}`}
                            >
                              {r}
                            </button>
                          ))}
                       </div>
                       
                       <textarea 
                         value={broadcastMsg}
                         onChange={(e) => setBroadcastMsg(e.target.value)}
                         placeholder="Entrez votre message suprême..."
                         className="w-full h-40 glass-strong rounded-[32px] p-8 text-sm text-white placeholder:text-white/10 outline-none border border-white/5 focus:border-blue-500/30 transition-all resize-none"
                       />

                       <button 
                         onClick={sendBroadcast}
                         className="w-full h-16 rounded-[24px] bg-blue-600 text-white font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                       >
                          <Zap className="w-5 h-5 fill-current" />
                          Execute Broadcast
                       </button>
                    </div>
                 </div>
               )}

               {tab === 'live' && (
                 <div className="h-[60vh] glass-strong rounded-[40px] border border-white/10 relative overflow-hidden flex items-center justify-center bg-[#020617]/40 ring-1 ring-blue-500/10">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                       {/* Mock Map Grid */}
                       <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
                    </div>
                    <div className="relative text-center">
                       <Activity className="w-16 h-16 text-blue-500/20 animate-ping mx-auto mb-6" />
                       <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em]">Initializing Live Map Control</h3>
                       <p className="text-[9px] text-white/20 mt-2 italic">Secure data synchronization in progress...</p>
                    </div>

                    {/* Draggable Mock Entities */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          x: [Math.random() * 200 - 100, Math.random() * 200 - 100],
                          y: [Math.random() * 200 - 100, Math.random() * 200 - 100],
                        }}
                        transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
                        className="absolute w-4 h-4 rounded-full bg-blue-500/40 border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center"
                      >
                         <Car className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    ))}
                 </div>
               )}

               {tab === 'finance' && (
                 <div className="space-y-8">
                    <div className="flex items-center justify-between mb-8">
                       <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Supreme Ledger</h2>
                       <button className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-strong border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                          <Download className="w-4 h-4" /> Export Report
                       </button>
                    </div>
                    
                    <div className="glass-strong rounded-[40px] p-10 border border-white/10 bg-gradient-to-br from-[#020617] to-blue-900/10">
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Global Liquidity</p>
                       <p className="text-5xl font-black text-white tracking-tighter">142,500,000 <span className="text-xl text-white/10 tracking-widest ml-2 uppercase">CFA</span></p>
                    </div>

                    <div className="space-y-4">
                       {[
                         { desc: 'Direct Adjustment: Account #1002', amount: '+ 50,000', admin: 'Root (God Mode)', time: '10 min ago' },
                         { desc: 'Wego Commission Withdrawal', amount: '- 2.4M', admin: 'Auto-System', time: '1h ago' },
                       ].map((tx, i) => (
                         <div key={i} className="p-6 rounded-[28px] glass-strong border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400">
                                  <RefreshCw className="w-6 h-6" />
                               </div>
                               <div>
                                  <h4 className="text-sm font-bold text-white tracking-tight">{tx.desc}</h4>
                                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{tx.admin} · {tx.time}</p>
                               </div>
                            </div>
                            <span className={`text-sm font-black ${tx.amount.includes('+') ? 'text-green-500' : 'text-white'}`}>{tx.amount} CFA</span>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* Fallback for other tabs */}
               {!['overview', 'live', 'broadcast', 'finance'].includes(tab) && (
                 <div className="py-40 text-center">
                    <Activity className="w-20 h-20 text-blue-500/10 mx-auto mb-8 animate-pulse" />
                    <h3 className="text-[10px] font-black text-white tracking-[0.8em] uppercase opacity-20">Accessing Root Partition...</h3>
                 </div>
               )}
            </motion.div>
         </AnimatePresence>
      </main>
      
      {/* Bottom Status Bar */}
      <footer className="shrink-0 h-10 bg-[#020617] border-t border-white/5 px-6 flex items-center justify-between relative z-[100]">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Sys. Status:</span>
               <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Healthy</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Auth:</span>
               <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Root / GodMode</span>
            </div>
         </div>
         <p className="text-[9px] font-mono text-white/10 uppercase tracking-widest">We_goo Kernel v2.4.0-admin</p>
      </footer>
    </div>
  );
};

export default SuperAdminDashboard;
