import { useState, useEffect, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Car, ShoppingBag, Utensils, ArrowLeft,
  MapPin, Clock, Phone, CheckCircle2, Truck, Star,
  Bell, Shield, Copy, QrCode, ChevronRight, RefreshCw,
  X, User, Zap, Eye, Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────
type IncomingType = 'package' | 'food' | 'ride' | 'commerce';
type IncomingStatus = 'pending' | 'accepted' | 'in-progress' | 'arriving' | 'delivered' | 'cancelled';

interface IncomingItem {
  id: string;
  type: IncomingType;
  status: IncomingStatus;
  title: string;
  description: string;
  senderName: string;
  senderPhone: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
  driverVehicle?: string;
  pickupAddress?: string;
  deliveryAddress: string;
  weight?: string;
  amount?: number;
  eta?: number; // minutes
  otp?: string;
  pickupPin?: string;
  createdAt: string;
  photo?: string;
  items?: { name: string; qty: number }[];
}

// ─── Mock real-time data ───────────────────────────────────────────────────────
const MOCK_INCOMING: IncomingItem[] = [
  {
    id: 'WG-REC-4821',
    type: 'package',
    status: 'arriving',
    title: 'Colis Express',
    description: 'Sneakers + Vêtements',
    senderName: 'Fatou Diallo',
    senderPhone: '+221 77 234 12 34',
    driverName: 'Mamadou Sow',
    driverPhone: '+221 76 987 65 43',
    driverRating: 4.9,
    driverVehicle: 'Moto Jakarta • DK-4482-B',
    pickupAddress: 'Plateau, Place de l\'Indépendance',
    deliveryAddress: 'Almadies, Route des Almadies',
    weight: '2.5',
    eta: 4,
    otp: '7351',
    pickupPin: '4821',
    createdAt: '2026-04-15T15:45:00Z',
    photo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop&q=90',
  },
  {
    id: 'WG-FOOD-2213',
    type: 'food',
    status: 'in-progress',
    title: 'Commande Restaurant',
    description: 'La Terrasse Dakaroise',
    senderName: 'La Terrasse Dakaroise',
    senderPhone: '+221 33 821 00 11',
    driverName: 'Ibrahima Fall',
    driverPhone: '+221 77 654 32 10',
    driverRating: 4.7,
    driverVehicle: 'Vélo • DK-9921-V',
    deliveryAddress: 'Almadies, Apt 12B',
    amount: 12500,
    eta: 12,
    otp: '3398',
    createdAt: '2026-04-15T15:55:00Z',
    photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop&q=90',
    items: [
      { name: 'Thiéboudienne Spécial', qty: 1 },
      { name: 'Jus de Bissap', qty: 2 },
      { name: 'Pain Maison', qty: 3 },
    ],
  },
  {
    id: 'WG-PKG-5530',
    type: 'package',
    status: 'accepted',
    title: 'Livraison B2B',
    description: 'Documents & Matériels',
    senderName: 'TechHub Dakar',
    senderPhone: '+221 33 860 22 33',
    driverName: 'Oumar Ndiaye',
    driverPhone: '+221 76 111 22 33',
    driverRating: 4.8,
    driverVehicle: 'Moto Bajaj • DK-1182-A',
    pickupAddress: 'Point E, Dakar',
    deliveryAddress: 'Almadies, Route des Almadies',
    weight: '0.8',
    eta: 22,
    otp: '5512',
    pickupPin: '3310',
    createdAt: '2026-04-15T16:00:00Z',
    photo: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&h=200&fit=crop&q=90',
  },
  {
    id: 'WG-COM-8821',
    type: 'commerce',
    status: 'in-progress',
    title: 'Achat Commerce',
    description: 'Électroniques & Accessoires',
    senderName: 'WegoBoutique',
    senderPhone: '+221 33 000 11 22',
    driverName: 'Cheikh Ba',
    driverPhone: '+221 77 543 21 00',
    driverRating: 4.6,
    driverVehicle: 'Camionnette • DK-7711-C',
    deliveryAddress: 'Almadies, Route des Almadies',
    amount: 45000,
    eta: 35,
    otp: '1987',
    createdAt: '2026-04-15T14:30:00Z',
    photo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&q=90',
    items: [
      { name: 'Écouteurs Bluetooth Pro', qty: 1 },
      { name: 'Câble USB-C 2m', qty: 2 },
    ],
  },
  {
    id: 'WG-PKG-2201',
    type: 'package',
    status: 'delivered',
    title: 'Colis Famille',
    description: 'Courses alimentaires',
    senderName: 'Awa Diop',
    senderPhone: '+221 77 100 20 30',
    deliveryAddress: 'Almadies, Route des Almadies',
    weight: '4.0',
    otp: '9941',
    createdAt: '2026-04-15T10:00:00Z',
    photo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop&q=90',
  },
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<IncomingStatus, { label: string; color: string; bg: string; border: string; pulse: boolean }> = {
  pending:     { label: 'En attente',    color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/30',  pulse: false },
  accepted:    { label: 'Confirmé',      color: 'text-accent',      bg: 'bg-accent/10',      border: 'border-accent/30',      pulse: true  },
  'in-progress': { label: 'En route',   color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/30',  pulse: true  },
  arriving:    { label: '🔴 Arrive !',   color: 'text-accent2',     bg: 'bg-accent2/15',     border: 'border-accent2/40',     pulse: true  },
  delivered:   { label: 'Livré ✓',      color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', pulse: false },
  cancelled:   { label: 'Annulé',       color: 'text-white/30',    bg: 'bg-white/5',        border: 'border-white/10',       pulse: false },
};

const TYPE_CONFIG: Record<IncomingType, { icon: React.ElementType; label: string; accent: string }> = {
  package:  { icon: Package,    label: 'Colis',       accent: 'text-accent' },
  food:     { icon: Utensils,   label: 'Repas',       accent: 'text-orange-400' },
  ride:     { icon: Car,        label: 'Course',      accent: 'text-accent2' },
  commerce: { icon: ShoppingBag, label: 'Commerce',   accent: 'text-purple-400' },
};

// ─── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all',       label: 'Tout',      icon: Bell },
  { key: 'package',  label: 'Colis',     icon: Package },
  { key: 'food',     label: 'Repas',     icon: Utensils },
  { key: 'commerce', label: 'Commerce',  icon: ShoppingBag },
] as const;

// ─── OTP Modal ────────────────────────────────────────────────────────────────
const OTPModal = ({ item, onClose }: { item: IncomingItem; onClose: () => void }) => {
  const copyOTP = () => {
    navigator.clipboard?.writeText(item.otp || '');
    toast.success('Code OTP copié !');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-background border border-white/10 overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] rounded-[36px]"
      >
        {/* Header */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 flex items-center justify-center border border-accent/30">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Validation sécurisée</p>
              <p className="text-sm font-black text-white">Code de réception</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
          {/* Instruction */}
          <p className="text-xs text-white/50 text-center leading-relaxed px-2">
            Présentez ce code ou QR au livreur pour confirmer la réception de <b className="text-white">{item.title}</b>
          </p>

          {/* QR Code */}
          <div className="relative group">
            <div className="absolute -inset-3 bg-accent/20 rounded-[32px] blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="w-44 h-44 bg-white rounded-[24px] flex items-center justify-center p-3 shadow-[0_20px_60px_rgba(230,32,87,0.25)] relative">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=e62057&bgcolor=ffffff&data=WEGO-RECV-${item.id}-${item.otp}`}
                alt="QR Code réception"
                className="w-full h-full rounded-xl"
              />
              <div className="absolute inset-x-0 -bottom-2.5 flex justify-center">
                <div className="bg-accent px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-wider shadow-lg border border-white/20">
                  Scan Livreur
                </div>
              </div>
            </div>
          </div>

          {/* OTP */}
          <div>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black text-center mb-3">ou saisissez manuellement</p>
            <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-full border border-white/10">
              <p className="text-[40px] font-black text-accent tracking-[0.3em] font-mono">{item.otp}</p>
              <button
                onClick={copyOTP}
                aria-label="Copier le code OTP"
                className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-4 rounded-[20px] bg-white/5 border border-white/10 text-white/60 font-black text-sm">
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Item Card ────────────────────────────────────────────────────────────────
const IncomingCard = forwardRef<HTMLDivElement, {
  item: IncomingItem;
  onShowOTP: (item: IncomingItem) => void;
  isExpanded: boolean;
  onToggle: () => void;
}>(({
  item,
  onShowOTP,
  isExpanded,
  onToggle,
}, ref) => {
  const statusCfg = STATUS_CONFIG[item.status];
  const typeCfg = TYPE_CONFIG[item.type];
  const TypeIcon = typeCfg.icon;
  const isActive = ['accepted', 'in-progress', 'arriving'].includes(item.status);
  const isArriving = item.status === 'arriving';
  const navigate = useNavigate();

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-strong rounded-[28px] border overflow-hidden transition-all duration-300 group hover:scale-[1.01] hover:border-white/20 hover:shadow-2xl hover:shadow-black/40 ${
        isArriving
          ? 'border-accent2/40 shadow-[0_0_40px_rgba(30,192,255,0.15)]'
          : item.status === 'delivered'
          ? 'border-emerald-500/20'
          : 'border-white/10'
      }`}
      style={{ background: isArriving ? 'rgba(30,192,255,0.03)' : undefined }}
    >
      {/* ARRIVING BANNER */}
      {isArriving && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent2/15 border-b border-accent2/20">
          <div className="w-2 h-2 bg-accent2 rounded-full animate-ping" />
          <span className="text-[9px] font-black text-accent2 uppercase tracking-widest">Votre livreur est arrivé ! Ouvrez la porte</span>
        </div>
      )}

      {/* CARD HEADER */}
      <button onClick={onToggle} className="w-full p-4 flex items-start gap-4 text-left active:bg-white/5 transition-colors">
        {/* Icon / Photo */}
        <div className="relative shrink-0">
          {item.photo ? (
            <div className="w-14 h-14 rounded-[18px] overflow-hidden border border-white/10">
              <img src={item.photo} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center border ${statusCfg.bg} ${statusCfg.border}`}>
              <TypeIcon className={`w-6 h-6 ${typeCfg.accent}`} />
            </div>
          )}
          {isActive && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background bg-accent flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{typeCfg.label} • {item.id}</p>
              <p className="text-sm font-black text-white truncate">{item.title}</p>
              <p className="text-[11px] text-white/50 truncate">{item.description}</p>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <div className={`px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-wider flex items-center gap-1.5 ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                {statusCfg.pulse && <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'arriving' ? 'bg-accent2' : 'bg-accent'} animate-pulse`} />}
                {statusCfg.label}
              </div>
              {item.eta && item.status !== 'delivered' && (
                <div className="flex items-center gap-1 text-white/40">
                  <Clock className="w-3 h-3" />
                  <span className="text-[9px] font-black">{item.eta} min</span>
                </div>
              )}
            </div>
          </div>

          {/* Sender + Address */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-white/30">
              <User className="w-3 h-3" />
              <span className="text-[9px] font-medium truncate max-w-[100px]">{item.senderName}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1 text-white/30">
              <MapPin className="w-3 h-3" />
              <span className="text-[9px] font-medium truncate max-w-[100px]">{item.deliveryAddress}</span>
            </div>
          </div>
        </div>
      </button>

      {/* EXPANDED CONTENT */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 space-y-3 border-t border-white/5 pt-4">
              {/* Driver info */}
              {item.driverName && (
                <div className="flex items-center justify-between bg-white/5 rounded-2xl p-3 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/30 to-accent2/20 flex items-center justify-center font-black text-white/60 text-sm border border-white/10">
                      {item.driverName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Livreur</p>
                      <p className="text-[11px] font-black text-white">{item.driverName}</p>
                      {item.driverVehicle && <p className="text-[9px] text-white/40">{item.driverVehicle}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.driverRating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-black text-white/60">{item.driverRating}</span>
                      </div>
                    )}
                    <a
                      href={`tel:${item.driverPhone}`}
                      onClick={e => e.stopPropagation()}
                      className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all"
                      title="Appeler le livreur"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {/* Items list (food / commerce) */}
              {item.items && item.items.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 space-y-2">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Articles</p>
                  {item.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[11px] text-white/70 font-medium">{it.name}</span>
                      <span className="text-[10px] font-black text-white/40">×{it.qty}</span>
                    </div>
                  ))}
                  {item.amount && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Total</span>
                      <span className="text-sm font-black text-accent">{item.amount.toLocaleString()} FCFA</span>
                    </div>
                  )}
                </div>
              )}

              {/* Package weight / amount */}
              {item.weight && (
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-2">
                    <Package className="w-4 h-4 text-white/30" />
                    <div>
                      <p className="text-[8px] text-white/30 uppercase tracking-widest">Poids</p>
                      <p className="text-xs font-black text-white">{item.weight} kg</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-white/30" />
                    <div>
                      <p className="text-[8px] text-white/30 uppercase tracking-widest">De</p>
                      <p className="text-[10px] font-black text-white truncate">{item.senderName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className={`grid gap-2 ${(item.status === 'arriving' || item.status === 'in-progress') && item.otp ? 'grid-cols-2' : 'grid-cols-1'} relative z-[100] mt-4`}>
                {/* OTP button - show when arriving or in-progress */}
                {(item.status === 'arriving' || item.status === 'in-progress') && item.otp && (
                  <button
                    onClick={() => onShowOTP(item)}
                    className={`py-3.5 rounded-[18px] flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] ${
                      item.status === 'arriving'
                        ? 'bg-accent text-white shadow-lg shadow-accent/30'
                        : 'bg-accent/10 border border-accent/30 text-accent'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    Code OTP
                  </button>
                )}

                {/* Delivered state */}
                {item.status === 'delivered' ? (
                  <div className="py-3.5 rounded-[18px] flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4" />
                    Livraison confirmée
                  </div>
                ) : (
                  <button
                    aria-label="Suivre sur la carte"
                    className="relative z-[200] pointer-events-auto py-3.5 rounded-[18px] flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white flex-1 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-white/10 active:scale-[0.98] cursor-pointer shadow-lg"
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation(); 
                      console.log('Navigating item:', item);
                      toast.loading('Ouverture de la carte...');
                      setTimeout(() => {
                        navigate('/user/package-tracking', { state: { package: item, isReceiver: true } });
                      }, 100);
                    }}
                  >
                    <Navigation className="w-4 h-4" />
                    Suivre sur la carte
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

IncomingCard.displayName = 'IncomingCard';

// ─── Main Component ───────────────────────────────────────────────────────────
const ReceiverInbox = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [filter, setFilter] = useState<'all' | IncomingType>('all');
  const [items, setItems] = useState<IncomingItem[]>(MOCK_INCOMING);
  const [expandedId, setExpandedId] = useState<string | null>('WG-REC-4821'); // open arriving by default
  const [otpItem, setOtpItem] = useState<IncomingItem | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // simulated live update: ETA countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev =>
        prev.map(item =>
          item.eta && item.eta > 1 && item.status !== 'delivered'
            ? { ...item, eta: item.eta - 1 }
            : item
        )
      );
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  // Simulated status progression for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(prev =>
        prev.map(item =>
          item.id === 'WG-PKG-5530' && item.status === 'accepted'
            ? { ...item, status: 'in-progress', eta: 18 }
            : item
        )
      );
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulated API refresh
    await new Promise(r => setTimeout(r, 1200));
    setLastRefresh(new Date());
    setIsRefreshing(false);
    toast.success('Mis à jour !');
  }, []);

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  const activeCount = items.filter(i => ['accepted', 'in-progress', 'arriving'].includes(i.status)).length;
  const arrivingCount = items.filter(i => i.status === 'arriving').length;

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-[100svh] bg-background flex flex-col relative overflow-hidden safe-top">
      {/* ── Header ── */}
      <header className="relative z-10 px-6 pt-6 pb-2 shrink-0">
        {/* Back + title */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            aria-label="Retour"
            className="w-10 h-10 rounded-xl glass-strong border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform font-black shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-0.5">Mes Réceptions</h1>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Temps Réel</p>
          </div>

          <button
            onClick={refresh}
            aria-label="Actualiser"
            title="Actualiser"
            className="w-10 h-10 rounded-xl glass-strong border border-white/10 flex items-center justify-center text-white/50 active:scale-90 transition-transform font-black shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
          </button>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mb-4">
          <div className={`flex-1 rounded-2xl px-3 py-2.5 border flex items-center gap-2.5 ${
            arrivingCount > 0 ? 'bg-accent2/10 border-accent2/30' : 'bg-white/5 border-white/5'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${arrivingCount > 0 ? 'bg-accent2/20' : 'bg-white/5'}`}>
              <Bell className={`w-4 h-4 ${arrivingCount > 0 ? 'text-accent2' : 'text-white/30'}`} />
            </div>
            <div>
              <p className={`text-lg font-black leading-none ${arrivingCount > 0 ? 'text-accent2' : 'text-white/60'}`}>{arrivingCount}</p>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Arrivent</p>
            </div>
          </div>

          <div className="flex-1 rounded-2xl px-3 py-2.5 bg-white/5 border border-white/5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Truck className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-lg font-black text-white/80 leading-none">{activeCount}</p>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">En cours</p>
            </div>
          </div>

          <div className="flex-1 rounded-2xl px-3 py-2.5 bg-white/5 border border-white/5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-black text-white/80 leading-none">
                {items.filter(i => i.status === 'delivered').length}
              </p>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Livrés</p>
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Temps réel</span>
          </div>
          <span className="text-[9px] text-white/20 font-medium">Mis à jour {formatTime(lastRefresh)}</span>
        </div>
      </header>

      {/* ── Filter tabs ── */}
      <div className="relative z-10 px-6 py-3 shrink-0">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 items-center -mb-2">
          {FILTERS.map(f => {
            const Icon = f.icon;
            const isActive = filter === f.key;
            const count = f.key === 'all' ? items.length : items.filter(i => i.type === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={`relative flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-[20px] border transition-all text-xs font-black tracking-wide overflow-hidden group ${
                  isActive
                    ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                    : 'glass shadow-none text-white/50 active:bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 z-10 relative ${isActive ? 'text-white' : 'group-hover:text-white/80'}`} />
                <span className={`z-10 relative ${isActive ? 'text-white' : ''}`}>{f.label}</span>
                {count > 0 && (
                  <span className={`z-10 relative font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── List ── */}
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pb-24 space-y-4 pt-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-4 opacity-40 mt-10"
            >
              <div className="w-20 h-20 rounded-full glass border border-white/10 flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-white uppercase tracking-widest">Aucune réception</p>
                <p className="text-xs text-white/40 mt-1">Vous n'avez pas de livraisons en cours</p>
              </div>
            </motion.div>
          ) : (
            filtered
              // Sort: arriving first, then in-progress, accepted, pending, delivered, cancelled
              .sort((a, b) => {
                const order: Record<IncomingStatus, number> = {
                  arriving: 0, 'in-progress': 1, accepted: 2, pending: 3, delivered: 4, cancelled: 5,
                };
                return order[a.status] - order[b.status];
              })
              .map(item => (
                <IncomingCard
                  key={item.id}
                  item={item}
                  onShowOTP={setOtpItem}
                  isExpanded={expandedId === item.id}
                  onToggle={() => setExpandedId(prev => prev === item.id ? null : item.id)}
                />
              ))
          )}
        </AnimatePresence>
      </div>

      {/* ── OTP Modal ── */}
      <AnimatePresence>
        {otpItem && <OTPModal item={otpItem} onClose={() => setOtpItem(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default ReceiverInbox;
