import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Home, List, Wallet, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { key: 'home',          path: '/driver/dashboard', icon: Home       },
  { key: 'rides',         path: '/driver/rides',     icon: List       },
  { key: 'wallet',        path: '/driver/wallet',    icon: Wallet     },
  { key: 'notifications', path: '/driver/notifications', icon: Bell   },
  { key: 'profile',       path: '/driver/profile',   icon: User       },
];

const DriverLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="h-[100svh] bg-background flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
        <Outlet />
      </div>

      {/* Premium Driver Tab Bar */}
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
                      layoutId="activeTabGlow"
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

export default DriverLayout;
