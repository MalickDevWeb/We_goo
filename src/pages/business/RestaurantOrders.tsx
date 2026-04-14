/* Same premium history style as Wallet, but focused on orders */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  History as HistoryIcon,
  Download,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const MOCK_HISTORY = [
  { id: '1022', customer: 'Fatou Kébé', total: 12500, date: 'Aujourd\'hui, 14:20', status: 'completed', items: '3x Pizza Royale, 2x Sprite' },
  { id: '1021', customer: 'Jean Mendy', total: 4200, date: 'Aujourd\'hui, 12:45', status: 'completed', items: '1x Tacos XL' },
  { id: '1020', customer: 'Saliou Ndiaye', total: 8500, date: 'Hier, 21:30', status: 'cancelled', items: 'Burger Wego, Wings' },
  { id: '1019', customer: 'Ouleye Seck', total: 15600, date: 'Hier, 19:15', status: 'completed', items: 'Plateau Sushi Large' },
];

const RestaurantOrders = () => {
  const [filter, setFilter] = useState('all');

  return (
    <div className="h-full bg-background flex flex-col pt-8 overflow-hidden relative">
      <header className="px-6 py-4 flex items-center justify-between shrink-0 mb-6 sticky top-0 bg-background/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl glass-strong flex items-center justify-center border border-white/10">
              <HistoryIcon className="w-6 h-6 text-amber-500" />
           </div>
           <h1 className="text-2xl font-black text-white tracking-tight">Historique</h1>
        </div>
        <button 
          aria-label="Télécharger le rapport"
          className="w-12 h-12 rounded-2xl glass-strong border border-white/10 flex items-center justify-center text-white/60 active:scale-90 transition-all"
        >
           <Download className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 relative z-10">
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
           {['all', 'completed', 'cancelled'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'glass-strong text-white/40 border border-white/5'}`}
             >
               {f === 'all' ? 'Toutes' : f === 'completed' ? 'Livrées' : 'Annulées'}
             </button>
           ))}
        </div>

        <div className="space-y-4">
           {MOCK_HISTORY.filter(o => filter === 'all' || o.status === filter).map((order, idx) => (
             <motion.div
               key={order.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: idx * 0.05 }}
               className="glass-strong rounded-[32px] p-6 border border-white/5 relative group"
             >
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                         {order.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                         <h3 className="text-sm font-black text-white">{order.customer}</h3>
                         <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{order.date}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-white">{order.total.toLocaleString()} CFA</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${order.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                         {order.status === 'completed' ? 'Succès' : 'Annulée'}
                      </p>
                   </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <p className="text-[11px] text-white/40 font-medium truncate max-w-[80%]">{order.items}</p>
                   <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-amber-500 transition-colors" />
                </div>
             </motion.div>
           ))}
        </div>
      </main>
    </div>
  );
};

export default RestaurantOrders;
