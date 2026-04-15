import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Package, LayoutList, MapPin, CheckCircle, XCircle, Clock, ChevronRight, Star, UtensilsCrossed, ShoppingBag, CarFront, Hotel, ArrowLeft, X, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import * as api from '@/services/api';
import type { Ride } from '@/types';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

type TabId = 'all' | 'rides' | 'packages' | 'restaurants' | 'commerce' | 'rental' | 'hotels';

const tabs: { id: TabId; label: string; icon: typeof Car }[] = [
  { id: 'all',         label: 'Tout',       icon: LayoutList      },
  { id: 'rides',       label: 'Courses',    icon: Car             },
  { id: 'packages',    label: 'Colis',      icon: Package         },
  { id: 'restaurants', label: 'Restau',     icon: UtensilsCrossed },
  { id: 'commerce',    label: 'Shopping',   icon: ShoppingBag     },
  { id: 'rental',      label: 'Location',   icon: CarFront        },
  { id: 'hotels',      label: 'Hôtels',     icon: Hotel           },
];

const tabIcons: Record<TabId, typeof Car> = {
  all: LayoutList, rides: Car, packages: Package,
  restaurants: UtensilsCrossed, commerce: ShoppingBag, rental: CarFront, hotels: Hotel,
};

const statusConfig: Record<string, { label: string; color: string; bgSoft: string; Icon: typeof CheckCircle }> = {
  completed:     { label: 'Terminé',     color: 'text-green-400', bgSoft: 'bg-green-400/10', Icon: CheckCircle },
  cancelled:     { label: 'Annulé',      color: 'text-red-500', bgSoft: 'bg-red-500/10', Icon: XCircle },
  'in-progress': { label: 'En cours',    color: 'text-accent', bgSoft: 'bg-accent/10', Icon: Clock },
  accepted:      { label: 'Accepté',     color: 'text-accent', bgSoft: 'bg-accent/10', Icon: Clock },
  arriving:      { label: 'En approche', color: 'text-accent', bgSoft: 'bg-accent/10', Icon: Clock },
  available:     { label: 'En attente',  color: 'text-orange-400', bgSoft: 'bg-orange-400/10', Icon: Clock },
};

// Statuses before departure — client can still cancel
const CANCELLABLE_STATUSES = ['available', 'accepted', 'arriving'];

type AnyItem = { id: any; _type: TabId; from: string; to: string; date: string; amount: number; status: string; userId: number; description?: string };

const UserHistory = () => {
  const { t } = useTranslation();
  const { session } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [rides, setRides] = useState<Ride[]>([]);
  const [cancelTarget, setCancelTarget] = useState<AnyItem | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // ── Mock data per service type ──────────────────────────────────────────
  const [packages, setPackages] = useState<AnyItem[]>([
    { id: 'pk1', _type: 'packages', from: 'Plateau', to: 'Almadies',    date: new Date().toISOString().split('T')[0], amount: 2500, status: 'accepted',    description: 'Docs juridiques', userId: 0 },
    { id: 'pk2', _type: 'packages', from: 'Sacré-Cœur', to: 'Mermoz',  date: '2025-04-08',                           amount: 1800, status: 'completed',   description: 'Colis fragile',   userId: 0 },
  ]);

  const restaurants: AnyItem[] = [
    { id: 'rs1', _type: 'restaurants', from: 'Boulangerie Tamkharit', to: 'Domicile', date: '2025-04-11', amount: 4200, status: 'completed',   description: '🍔 Burger + Jus Bissap', userId: 0 },
    { id: 'rs2', _type: 'restaurants', from: 'Pizza Loco Dakar',      to: 'Domicile', date: '2025-04-09', amount: 7500, status: 'cancelled',   description: '🍕 Pizza Royale x2',     userId: 0 },
  ];

  const commerce: AnyItem[] = [
    { id: 'cm1', _type: 'commerce', from: 'Marché Sandaga', to: 'Domicile', date: '2025-04-10', amount: 12000, status: 'completed', description: '🛍️ Tissu wax 6m + accessoires', userId: 0 },
  ];

  const rentals: AnyItem[] = [
    { id: 'rt1', _type: 'rental', from: 'Aéroport LSS', to: 'Hôtel King Fahd', date: '2025-04-07', amount: 35000, status: 'completed', description: '🚗 Toyota Corolla · 3 jours', userId: 0 },
  ];

  const hotels: AnyItem[] = [
    { id: 'ht1', _type: 'hotels', from: 'Réservation', to: 'Radisson Blu Dakar', date: '2025-04-05', amount: 85000, status: 'completed', description: '🏨 Chambre Deluxe · 2 nuits', userId: 0 },
  ];

  useEffect(() => {
    if (session) api.getRidesByUser(session.id).then(setRides);
  }, [session]);

  const allItems: AnyItem[] = [
    ...rides.map(r => ({ ...r, _type: 'rides' as const })),
    ...packages,
    ...restaurants,
    ...commerce,
    ...rentals,
    ...hotels,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = activeTab === 'all'
    ? allItems
    : allItems.filter(i => i._type === activeTab);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      if (cancelTarget._type === 'rides') {
        await api.updateRide(Number(cancelTarget.id), { status: 'cancelled' });
        setRides(prev => prev.map(r => r.id === cancelTarget.id ? { ...r, status: 'cancelled' } : r));
      } else if (cancelTarget._type === 'packages') {
        setPackages(prev => prev.map(p => p.id === cancelTarget.id ? { ...p, status: 'cancelled' } : p));
      }
      toast.success('Commande annulée avec succès.');
    } catch {
      toast.error('Impossible d\'annuler cette commande.');
    } finally {
      setCancelLoading(false);
      setCancelTarget(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, damping: 20 } }
  };

  return (
    <div className="h-[100svh] flex flex-col bg-background relative overflow-hidden safe-top">
      {/* Dynamic Animated Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Header */}
      <header className="relative z-10 px-6 pt-6 pb-2 shrink-0 flex items-center gap-4">
        <button 
          onClick={() => navigate('/user/dashboard')} 
          className="w-10 h-10 rounded-xl glass-strong border border-white/10 flex items-center justify-center active:scale-90 transition-transform font-black text-white shadow-lg"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-0.5">{t('user.history.title', 'Histoire')}</h1>
          <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
            {filtered.length} commande{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </header>

      {/* Tab Filter */}
      <div className="relative z-10 px-6 py-3 shrink-0">
        <div className="flex overflow-x-auto no-scrollbar gap-2.5 pb-2 -mb-2 pr-6 items-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-[20px] border transition-all text-xs font-black tracking-wide overflow-hidden group ${
                  active 
                    ? 'bg-accent border-accent/40 text-white shadow-xl shadow-accent/20' 
                    : 'glass shadow-none text-white/50 active:bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 z-10 relative ${active ? 'text-white' : 'group-hover:text-white/80'}`} />
                <span className={`z-10 relative ${active ? 'text-white' : ''}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pb-24">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-4 opacity-40 mt-10"
            >
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center border border-white/10">
                <LayoutList className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs font-black text-white uppercase tracking-widest">{t('user.history.noRides', 'Aucune commande')}</p>
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4 pt-2"
            >
              {filtered.map((item) => {
                const cfg = statusConfig[item.status] || statusConfig['available'];
                const type = item._type as TabId;
                const isRide = type === 'rides';
                const isPackage = type === 'packages';
                const Icon = tabIcons[type] || Car;
                const dateObj = new Date(item.date);
                const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                const canCancel = (isRide || isPackage) && CANCELLABLE_STATUSES.includes(item.status);

                return (
                  <motion.div
                    variants={itemVariants}
                    key={item.id}
                    className="glass-strong rounded-[28px] border border-white/10 p-5 flex gap-4 items-center transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.01] hover:border-white/20 hover:shadow-2xl hover:shadow-black/40"
                    onClick={() => {
                      if (isRide) {
                        if (['in-progress','accepted','arriving'].includes(item.status)) {
                          navigate('/user/tracking');
                        }
                      } else if (isPackage) {
                        navigate('/user/package-tracking', { state: { package: item } });
                      }
                    }}
                  >
                    {/* Glowing Accent Orb */}
                    <div className={`absolute top-0 right-0 w-32 h-32 ${cfg.bgSoft} rounded-full blur-[40px] opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none translate-x-10 -translate-y-10`} />

                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${cfg.bgSoft} border border-white/10 shadow-lg relative z-10`}>
                      <Icon className={`w-6 h-6 ${cfg.color} drop-shadow-md`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center relative z-10">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                           <cfg.Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                           <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                             {cfg.label}
                           </span>
                        </div>
                        <span className="text-[10px] font-bold text-white/30">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[13px] text-white font-bold truncate">
                        <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="truncate">{item.from}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[13px] text-white font-bold truncate mt-1">
                        <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        <span className="truncate">{item.to}</span>
                      </div>
                      {'description' in item && item.description && (
                        <p className="text-[11px] text-white/50 mt-2 truncate font-medium bg-white/5 inline-block py-1 px-2 rounded-lg">{item.description}</p>
                      )}
                    </div>

                    {/* Right side: Amount + Cancel */}
                    <div className="text-right shrink-0 flex flex-col items-end justify-center gap-2 z-20">
                      <p className="text-lg font-black text-white tracking-tight">{item.amount.toLocaleString('fr-FR')} CFA</p>
                      {item.status === 'completed' && isRide && (
                        <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded-lg border border-yellow-400/20">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] font-black text-yellow-400">5.0</span>
                        </div>
                      )}
                      {canCancel && (
                        <button
                          onClick={e => { e.stopPropagation(); setCancelTarget(item); }}
                          className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-500 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-90"
                          aria-label="Annuler"
                          title="Annuler la commande"
                        >
                          <X className="w-3 h-3" />
                          Annuler
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {cancelTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-end justify-center p-4 bg-black/60 backdrop-blur-xl"
            onClick={() => !cancelLoading && setCancelTarget(null)}
          >
            <motion.div
              initial={{ y: 150, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 150, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-sm glass-strong rounded-[36px] p-8 border border-white/10 shadow-2xl space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Annuler la commande ?</h2>
                  <p className="text-sm text-white/50 mt-2 leading-relaxed">
                    {cancelTarget._type === 'rides'
                      ? 'Cette course sera annulée et le chauffeur sera averti.'
                      : 'Ce colis sera annulé et la livraison sera stoppée.'}
                  </p>
                </div>
              </div>

              <div className="glass rounded-2xl p-4 flex flex-col gap-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-xs font-bold text-white truncate">{cancelTarget.from}</span>
                </div>
                <div className="w-px h-3 bg-white/10 ml-2" />
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white/40 shrink-0" />
                  <span className="text-xs font-bold text-white truncate">{cancelTarget.to}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCancelTarget(null)}
                  disabled={cancelLoading}
                  className="py-4 rounded-2xl glass border border-white/10 text-white font-black text-sm active:scale-95 transition-all focus:outline-none"
                >
                  Retour
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={cancelLoading}
                  className="py-4 rounded-2xl bg-red-500 text-white font-black text-sm active:scale-95 transition-all shadow-xl shadow-red-500/30 disabled:opacity-60 focus:outline-none"
                >
                  {cancelLoading ? 'Annulation...' : 'Confirmer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserHistory;
