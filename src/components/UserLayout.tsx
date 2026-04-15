import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Home, MapPin, Wallet, ClipboardList, User, Zap, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/services/socket';
import { useState, useEffect } from 'react';

const tabs = [
  { key: 'home',    path: '/user/dashboard', icon: Home          },
  { key: 'booking', path: '/user/booking',   icon: MapPin        },
  { key: 'wallet',  path: '/user/wallet',    icon: Wallet        },
  { key: 'history', path: '/user/history',   icon: ClipboardList },
  { key: 'profile', path: '/user/profile',   icon: User          },
];

const UserLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeActivity, setActiveActivity] = useState<any>(null);

  // Simulation: Show a live activity after 5 seconds of being on the app
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveActivity({
        id: '1',
        type: 'food',
        title: 'Commande en préparation',
        subtitle: 'Mama Pizza • Arrivée dans 12 min',
        icon: Zap
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-[100svh] bg-background flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 relative">
        
        {/* Global Live Activity Indicator */}
        <AnimatePresence>
          {activeActivity && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="fixed top-6 left-6 right-6 z-[2000] pointer-events-none"
            >
              <button 
                onClick={() => navigate('/user/history')}
                className="w-full max-w-sm mx-auto glass-strong rounded-[24px] p-4 border border-accent/30 shadow-[0_20px_40px_rgba(230,32,87,0.2)] flex items-center justify-between pointer-events-auto active:scale-95 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                    <Zap className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-[13px] font-black text-white tracking-tight">{activeActivity.title}</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {activeActivity.subtitle}
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-accent" />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <Outlet />
      </div>

      {/* Premium User Tab Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-[100] safe-bottom pb-4 px-6 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="glass-strong rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-around h-20 px-4 relative overflow-hidden">
            {/* Glossy highlight effect */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const active = location.pathname === tab.path;
              return (
                <button
                  key={tab.key}
                  onClick={() => navigate(tab.path)}
                  className="relative flex flex-col items-center justify-center py-2 px-3 active:scale-95 transition-all group"
                  aria-label={t(`tabs.${tab.key}`)}
                >
                  {active && (
                    <motion.div
                      layoutId="activeUserTabGlow"
                      className="absolute inset-0 bg-accent/10 rounded-2xl blur-md"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${active ? 'bg-accent shadow-lg shadow-accent/20 scale-110' : 'text-white/30 group-hover:text-white/50'}`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
                  </div>
                  
                  {active && (
                    <motion.span 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[8px] font-black text-white/40 absolute -bottom-1 uppercase tracking-widest"
                    >
                      {tab.key}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default UserLayout;
