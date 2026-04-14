import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Power, 
  Utensils, 
  ChefHat, 
  ArrowRight,
  ChevronRight,
  Bell,
  Star,
  MapPin
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const MOCK_ORDERS = [
  { id: '1024', customer: 'Awa Diop', items: 'Kebab Mixte, Coca 33cl', total: 6500, time: 'Il y a 2 min', status: 'pending' },
  { id: '1023', customer: 'Malick Sy', items: 'Burger Wego, Frites', total: 5500, time: 'Il y a 10 min', status: 'preparing' },
];

const RestaurantDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="h-full bg-background flex flex-col pt-8 overflow-hidden relative">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between shrink-0 mb-6 sticky top-0 bg-background/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[22px] bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-2xl shadow-amber-500/20">
            <div className="w-full h-full rounded-[20px] bg-secondary flex items-center justify-center overflow-hidden border-2 border-background">
               <img src={profile?.photo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop"} alt="Restaurant" className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none mb-1">
              {profile?.name || 'Le Gourmet Dakar'}
            </h1>
            <div className="flex items-center gap-1.5">
               <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,1)]' : 'bg-white/20'}`} />
               <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                 {isOnline ? 'Cuisine Ouverte' : 'Cuisine Fermée'}
               </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsOnline(!isOnline)}
          aria-label={isOnline ? "Fermer la cuisine" : "Ouvrir la cuisine"}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isOnline ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-white/5 border border-white/10 opacity-40'}`}
        >
          <Power className={`w-6 h-6 ${isOnline ? 'text-amber-500' : 'text-white/20'}`} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 relative z-10">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="glass-strong rounded-[32px] p-6 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-2xl -translate-x-4 -translate-y-4" />
              <TrendingUp className="w-5 h-5 text-amber-500 mb-3" />
              <p className="text-2xl font-black text-white tracking-tight">45 200 <span className="text-[10px] text-white/20 ml-1">CFA</span></p>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Gains du jour</p>
           </div>
           
           <div className="glass-strong rounded-[32px] p-6 border border-white/5 relative overflow-hidden">
              <ChefHat className="w-5 h-5 text-orange-500 mb-3" />
              <p className="text-2xl font-black text-white tracking-tight">12</p>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Commandes</p>
           </div>
        </div>

        {/* Active Orders Section */}
        <div className="space-y-6 mb-10">
           <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] opacity-40">Commandes Actives</h2>
              <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                {MOCK_ORDERS.length} Nouvelles
              </span>
           </div>

           <div className="space-y-4">
              <AnimatePresence>
                {MOCK_ORDERS.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-strong rounded-[32px] p-5 border border-white/5 relative group hover:border-amber-500/30 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'pending' ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-green-500/20 text-green-500'}`}>
                             <ChefHat className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Commande #{order.id}</p>
                             <h3 className="text-sm font-black text-white">{order.customer}</h3>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{order.time}</p>
                          <p className="text-xs font-black text-white mt-1">{order.total} CFA</p>
                       </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
                       <p className="text-xs text-white/50 italic leading-relaxed">"{order.items}"</p>
                    </div>

                    <div className="flex gap-2">
                       <button className="flex-1 h-12 rounded-xl border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/5 transition-all">Détails</button>
                       <button className="flex-[2] h-12 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                         Accepter
                       </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </div>

        {/* Quick Insights */}
        <div className="glass-strong rounded-[32px] p-8 border border-white/5 relative overflow-hidden mb-10">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center">
                 <Star className="w-6 h-6 text-black" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Score du chef</p>
                 <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">4.9</span>
                    <span className="text-[10px] text-white/20 font-bold">/ 5.0</span>
                 </div>
              </div>
           </div>
           <p className="text-xs text-white/40 leading-relaxed italic">"Plus de 98% de vos commandes ont été prêtes en moins de 15 minutes aujourd'hui. Excellent travail !"</p>
        </div>
      </main>
    </div>
  );
};

export default RestaurantDashboard;
