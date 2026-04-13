import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Package, LayoutList, MapPin, CheckCircle, XCircle, Clock, ChevronRight, Star, UtensilsCrossed, ShoppingBag, CarFront, Hotel } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import * as api from '@/services/api';
import type { Ride } from '@/types';

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
  completed:     { label: 'Terminé',     color: 'text-accent2', bgSoft: 'bg-accent2/10', Icon: CheckCircle },
  cancelled:     { label: 'Annulé',      color: 'text-destructive', bgSoft: 'bg-destructive/10', Icon: XCircle },
  'in-progress': { label: 'En cours',    color: 'text-accent', bgSoft: 'bg-accent/10', Icon: Clock },
  accepted:      { label: 'Accepté',     color: 'text-blue-400', bgSoft: 'bg-blue-400/10', Icon: Clock },
  arriving:      { label: 'En approche', color: 'text-blue-400', bgSoft: 'bg-blue-400/10', Icon: Clock },
  available:     { label: 'En attente',  color: 'text-white/50', bgSoft: 'bg-white/5', Icon: Clock },
};

const UserHistory = () => {
  const { t } = useTranslation();
  const { session } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [rides, setRides] = useState<Ride[]>([]);

  // ── Mock data per service type ──────────────────────────────────────────
  const packages = [
    { id: 'pk1', _type: 'package' as const, from: 'Plateau', to: 'Almadies',    date: new Date().toISOString().split('T')[0], amount: 2500, status: 'in-progress', description: 'Docs juridiques', userId: 0 },
    { id: 'pk2', _type: 'package' as const, from: 'Sacré-Cœur', to: 'Mermoz',  date: '2025-04-08',                           amount: 1800, status: 'completed',   description: 'Colis fragile',   userId: 0 },
  ];

  const restaurants = [
    { id: 'rs1', _type: 'restaurants' as const, from: 'Boulangerie Tamkharit', to: 'Domicile', date: '2025-04-11', amount: 4200, status: 'completed',   description: '🍔 Burger + Jus Bissap', userId: 0 },
    { id: 'rs2', _type: 'restaurants' as const, from: 'Pizza Loco Dakar',      to: 'Domicile', date: '2025-04-09', amount: 7500, status: 'cancelled',   description: '🍕 Pizza Royale x2',     userId: 0 },
  ];

  const commerce = [
    { id: 'cm1', _type: 'commerce' as const, from: 'Marché Sandaga', to: 'Domicile', date: '2025-04-10', amount: 12000, status: 'completed', description: '🛍️ Tissu wax 6m + accessoires', userId: 0 },
  ];

  const rentals = [
    { id: 'rt1', _type: 'rental' as const, from: 'Aéroport LSS', to: 'Hôtel King Fahd', date: '2025-04-07', amount: 35000, status: 'completed', description: '🚗 Toyota Corolla · 3 jours', userId: 0 },
  ];

  const hotels = [
    { id: 'ht1', _type: 'hotels' as const, from: 'Réservation', to: 'Radisson Blu Dakar', date: '2025-04-05', amount: 85000, status: 'completed', description: '🏨 Chambre Deluxe · 2 nuits', userId: 0 },
  ];

  useEffect(() => {
    if (session) api.getRidesByUser(session.id).then(setRides);
  }, [session]);

  const allItems = [
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

  return (
    <div className="h-full bg-[#0A0A0B] relative flex flex-col safe-top overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-accent2/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-2 shrink-0">
        <h1 className="text-2xl font-black text-white tracking-tight mb-1">Mes Commandes</h1>
        <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tab Filter */}
      <div className="relative z-10 px-6 py-3 shrink-0">
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mb-2 pr-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border transition-all text-[11px] font-black tracking-wide ${
                  active 
                    ? 'bg-gradient-to-r from-accent to-accent/80 border-accent/50 text-white shadow-[0_0_15px_rgba(230,32,87,0.3)]' 
                    : 'glass shadow-none text-white/50 active:bg-white/5 border-white/5 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
            <LayoutList className="w-12 h-12 text-white" />
            <p className="text-[11px] font-black text-white uppercase tracking-widest">Aucune commande</p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
              {filtered.map((item, idx) => {
                const cfg = statusConfig[(item as any).status] || statusConfig['available'];
                const type = (item as any)._type as TabId;
                const isRide = type === 'rides';
                const Icon = tabIcons[type] || Car;
                const dateObj = new Date(item.date);
                const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

                return (
                  <div
                    key={item.id}
                    className="glass rounded-[28px] border border-white/5 p-4 flex gap-4 items-center active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group hover:bg-white/5"
                    onClick={() => {
                      const it = item as any;
                      if (isRide) {
                        if (['in-progress','accepted','arriving'].includes(it.status)) {
                          navigate('/user/tracking');
                        }
                      } else {
                        navigate('/user/package-tracking', { state: { package: it } });
                      }
                    }}
                  >
                    {/* Subtle status glow behind card */}
                    <div className={`absolute top-[-20px] right-[-20px] w-32 h-32 ${cfg.bgSoft} rounded-full blur-[40px] opacity-20 group-hover:opacity-50 transition-opacity pointer-events-none`} />

                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 ${cfg.bgSoft} border border-white/10 shadow-lg shadow-black/20`}>
                      <Icon className={`w-6 h-6 ${cfg.color} drop-shadow-md`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1">
                           <cfg.Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                           <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                             {cfg.label}
                           </span>
                        </div>
                        <span className="text-[10px] font-bold text-white/40">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-white font-bold truncate">
                        <MapPin className="w-3.5 h-3.5 text-white/30 shrink-0" />
                        <span className="truncate">{item.from}</span>
                        <ChevronRight className="w-3 h-3 text-white/20 shrink-0" />
                        <span className="truncate">{item.to}</span>
                      </div>
                      {'description' in item && item.description && (
                        <p className="text-[10px] text-white/50 mt-1 truncate font-medium">{item.description}</p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0 flex flex-col items-end justify-center z-10">
                      <p className="text-lg font-black text-white tracking-tight">${(item as any).amount}</p>
                      {(item as any).status === 'completed' && isRide && (
                        <div className="flex items-center gap-1 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-[9px] font-black text-yellow-400">5.0</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHistory;
