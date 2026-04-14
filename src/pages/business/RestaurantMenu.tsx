import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  EyeOff, 
  Eye,
  Filter,
  Utensils,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_MENU = [
  { id: '1', name: 'Kebab Mixte Royal', category: 'Kebab', price: 4500, stock: true, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=400&fit=crop' },
  { id: '2', name: 'Pizza Margherita XL', category: 'Italien', price: 7500, stock: false, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop' },
  { id: '3', name: 'Burger Wego Supreme', category: 'Burger', price: 5500, stock: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop' },
];

const RestaurantMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(MOCK_MENU);
  const [search, setSearch] = useState('');

  const toggleStock = (id: string) => {
    setMenu(prev => prev.map(item => item.id === id ? { ...item, stock: !item.stock } : item));
  };

  return (
    <div className="h-full bg-background flex flex-col pt-8 overflow-hidden relative">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between shrink-0 mb-4 sticky top-0 bg-background/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl glass-strong flex items-center justify-center border border-white/10">
             <Utensils className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Mon Menu</h1>
        </div>
        <button 
          aria-label="Ajouter un plat"
          className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-90 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 relative z-10">
        
        {/* Search & Filter */}
        <div className="flex gap-3 mb-8">
           <div className="flex-1 glass-strong rounded-2xl border border-white/5 flex items-center px-4 py-3 border focus-within:border-amber-500/30 transition-all">
              <Search className="w-4 h-4 text-white/20 mr-3" />
              <input 
                type="text" 
                placeholder="Rechercher un plat..." 
                className="bg-transparent flex-1 outline-none text-sm font-semibold placeholder:text-white/20 text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <button 
             aria-label="Filtrer le menu"
             className="w-12 h-12 rounded-2xl glass-strong border border-white/10 flex items-center justify-center text-white/40"
           >
              <Filter className="w-4 h-4" />
           </button>
        </div>

        {/* Menu List */}
        <div className="space-y-4">
           {menu.map((item, idx) => (
             <motion.div
               key={item.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               className="glass-strong rounded-[28px] p-4 border border-white/5 flex gap-4 animate-in slide-in-from-bottom-2 duration-300"
             >
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0 py-1">
                   <div className="flex items-start justify-between">
                      <div>
                         <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">{item.category}</p>
                         <h3 className="text-sm font-black text-white truncate">{item.name}</h3>
                      </div>
                      <span className="text-sm font-black text-white">{item.price} CFA</span>
                   </div>

                   <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4">
                         <button 
                           onClick={() => toggleStock(item.id)}
                           className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${item.stock ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}
                         >
                            {item.stock ? <Eye className="w-3.2 h-3.2" /> : <EyeOff className="w-3.2 h-3.2" />}
                            <span className="text-[9px] font-black uppercase tracking-widest">{item.stock ? 'En stock' : 'Épuisé'}</span>
                         </button>
                      </div>
                      <div className="flex gap-2">
                         <button 
                           aria-label="Modifier le plat"
                           className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                         >
                            <Edit2 className="w-3.5 h-3.5" />
                         </button>
                         <button 
                           aria-label="Supprimer le plat"
                           className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-red-500 transition-colors"
                         >
                            <Trash2 className="w-3.5 h-3.5" />
                         </button>
                      </div>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </main>
    </div>
  );
};

export default RestaurantMenu;
