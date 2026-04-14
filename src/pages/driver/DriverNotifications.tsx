import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, BellOff, CheckCircle, Info, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nouveau Bonus !',
    message: 'Complétez 5 courses aujourd\'hui pour gagner 5 000 CFA de bonus.',
    time: 'Il y a 10 min',
    type: 'success',
    read: false,
  },
  {
    id: '2',
    title: 'Mise à jour tarifaire',
    message: 'Les tarifs de nuit ont été augmentés de 15% pour votre zone.',
    time: 'Il y a 1 heure',
    type: 'info',
    read: false,
  },
  {
    id: '3',
    title: 'Attention : Zone dense',
    message: 'Forte demande dans le quartier du Plateau. Dirigez-vous vers là-bas.',
    time: 'Il y a 2 heures',
    type: 'warning',
    read: true,
  },
];

const DriverNotifications = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-accent2" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Info className="w-5 h-5 text-accent" />;
    }
  };

  return (
    <div className="h-full bg-background relative overflow-hidden flex flex-col pt-8">
      {/* Background orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent2/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between shrink-0 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center active:scale-90 transition-transform shadow-lg border border-white/10"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
        </div>
        <button 
          onClick={markAllRead}
          className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
        >
          Tout lire
        </button>
      </header>

      <main className="relative z-10 flex-1 px-6 pb-24 overflow-y-auto no-scrollbar">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <BellOff className="w-16 h-16 text-white mb-4" />
            <p className="text-sm font-black text-white uppercase tracking-widest text-center px-10">Aucune notification pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
             {notifications.map((notif, idx) => (
               <motion.div
                 key={notif.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 className={`glass-strong rounded-[28px] p-6 border transition-all ${notif.read ? 'border-white/5 opacity-60' : 'border-accent/30 shadow-[0_10px_30px_rgba(230,32,87,0.1)]'}`}
               >
                 <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.read ? 'bg-white/5' : 'bg-white/10 border border-white/10'}`}>
                       {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-1">
                          <h3 className="font-black text-white text-sm truncate">{notif.title}</h3>
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(230,32,87,1)]" />}
                       </div>
                       <p className="text-xs text-white/50 leading-relaxed mb-3">{notif.message}</p>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                             <Clock className="w-3 h-3 text-white/20" />
                             <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{notif.time}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/10" />
                       </div>
                    </div>
                 </div>
               </motion.div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DriverNotifications;
