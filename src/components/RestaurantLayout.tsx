import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Wallet, 
  History, 
  User,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RestaurantLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/partner/restaurant', icon: LayoutDashboard, label: 'Tableau' },
    { path: '/partner/restaurant/menu', icon: UtensilsCrossed, label: 'Menu' },
    { path: '/partner/restaurant/wallet', icon: Wallet, label: 'Finance' },
    { path: '/partner/restaurant/orders', icon: History, label: 'Historique' },
    { path: '/partner/restaurant/profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="h-[100svh] bg-background overflow-hidden flex flex-col relative font-sans selection:bg-amber-500/30">
      {/* Dynamic Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative z-10 flex flex-col h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex-1 overflow-hidden h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Premium Bottom Navigation */}
      <nav className="relative z-[100] px-6 pb-6 pt-2 shrink-0">
        <div className="max-w-lg mx-auto glass-strong rounded-[32px] p-2 flex items-center justify-between border border-white/10 shadow-2xl relative overflow-hidden group">
          {/* Neon Track Effect */}
          <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50" />
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center py-2 px-1 gap-1 min-w-[64px] transition-all"
              >
                {isActive && (
                  <motion.div
                    layoutId="restaurant-nav-active"
                    className="absolute inset-0 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                
                <div className="relative">
                   <item.icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-amber-500 scale-110' : 'text-white/40'}`} />
                   {item.label === 'Tableau' && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,1)] animate-pulse" />
                   )}
                </div>
                
                <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'text-amber-500 opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-100'}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default RestaurantLayout;
