import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Store, 
  MapPin, 
  Clock, 
  Shield, 
  LogOut, 
  ChevronRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const RestaurantProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, logout } = useAuthStore();
  const restaurant = profile as any;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sections = [
    { icon: Store, label: 'Paramètres du Restaurant', path: '/partner/restaurant/settings' },
    { icon: Clock, label: 'Horaires d\'ouverture', path: '/partner/restaurant/hours' },
    { icon: Shield, label: 'Sécurité & Accès', path: '/partner/restaurant/security' },
    { icon: HelpCircle, label: 'Centre d\'aide', path: '/partner/restaurant/help' },
    { icon: FileText, label: 'Termes & Conditions', path: '/terms' },
  ];

  return (
    <div className="h-full bg-background flex flex-col pt-8 overflow-hidden relative">
      <header className="px-6 py-4 flex flex-col items-center shrink-0 mb-10">
         <div className="relative mb-6">
            <div className="w-28 h-28 rounded-[40px] bg-gradient-to-tr from-amber-500 to-orange-600 p-1 shadow-2xl shadow-amber-500/20">
               <div className="w-full h-full rounded-[38px] bg-secondary border-4 border-background overflow-hidden flex items-center justify-center">
                  <img src={profile?.photo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop"} alt="Avatar" className="w-full h-full object-cover" />
               </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center shadow-xl border-4 border-background">
               <Settings className="w-5 h-5" />
            </div>
         </div>
         <h2 className="text-2xl font-black text-white tracking-tight">{profile?.name || 'Le Gourmet Dakar'}</h2>
         <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Gérant : {profile?.ownerName || 'Directeur'}</p>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 space-y-4">
         {sections.map((item, idx) => (
           <motion.button
             key={item.path}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: idx * 0.05 }}
             onClick={() => navigate(item.path)}
             className="w-full glass-strong rounded-[28px] p-5 flex items-center justify-between border border-white/5 group active:bg-white/5 transition-all"
           >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all">
                    <item.icon className="w-6 h-6" />
                 </div>
                 <span className="text-sm font-black text-white/80">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-amber-500 transition-all" />
           </motion.button>
         ))}

         <button 
           onClick={handleLogout}
           className="w-full glass-strong rounded-[28px] p-5 flex items-center justify-between border border-red-500/10 text-red-500 active:bg-red-500/5 transition-all mt-6"
         >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <LogOut className="w-6 h-6" />
               </div>
               <span className="text-sm font-black uppercase tracking-widest">Déconnexion</span>
            </div>
         </button>
      </main>
    </div>
  );
};

export default RestaurantProfile;
