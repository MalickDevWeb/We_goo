import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, CarFront, Filter, Star, 
  MapPin, ShoppingCart, Heart, Bell, Zap, X, ChevronRight,
  Utensils, CheckCircle2, Shield, Clock, Timer, Flame, Plus,
  Calendar, CreditCard, Fuel, Gauge, User
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { OrderItem, Order } from '@/types/index';

interface Vehicle {
  id: string;
  name: string;
  pricePerDay: number;
  rating: number;
  image: string;
  category: string;
  transmission: 'Auto' | 'Manuel';
  fuel: 'Essence' | 'Diesel' | 'Électrique';
  seats: number;
  isPopular?: boolean;
}

const MOCK_FLEET: Vehicle[] = [
  { id: 'v1', name: 'Volkswagen Polo', pricePerDay: 35000, rating: 4.8, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&h=400&fit=crop', category: 'Voiture', transmission: 'Auto', fuel: 'Essence', seats: 5, isPopular: true },
  { id: 'v2', name: 'Toyota Land Cruiser V8', pricePerDay: 120000, rating: 5.0, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=400&fit=crop', category: 'Voiture', transmission: 'Auto', fuel: 'Diesel', seats: 7, isPopular: true },
  { id: 'v3', name: 'Yamaha TMAX 560', pricePerDay: 25000, rating: 4.9, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=400&fit=crop', category: 'Moto', transmission: 'Auto', fuel: 'Essence', seats: 2 },
  { id: 'v4', name: 'Mercedes Sprinter', pricePerDay: 75000, rating: 4.7, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop', category: 'Camion', transmission: 'Manuel', fuel: 'Diesel', seats: 3 },
  { id: 'v5', name: 'Range Rover Sport', pricePerDay: 150000, rating: 4.9, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&h=400&fit=crop', category: 'Voiture', transmission: 'Auto', fuel: 'Essence', seats: 5, isPopular: true },
  { id: 'v6', name: 'Suzuki Gixxer SF', pricePerDay: 15000, rating: 4.5, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=400&fit=crop', category: 'Moto', transmission: 'Manuel', fuel: 'Essence', seats: 2 },
];

const CATEGORIES = [
  { id: 'all', name: 'Tous', icon: CarFront },
  { id: 'voiture', name: 'Voiture', icon: CarFront },
  { id: 'moto', name: 'Moto', icon: CarFront },
  { id: 'camion', name: 'Camion', icon: CarFront },
  { id: 'engin', name: 'Engin', icon: CarFront },
];

const UserRental = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, setProfile, session } = useAuthStore();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'all';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory.toLowerCase());
  
  // Booking State
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingDays, setBookingDays] = useState(1);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'duration' | 'payment' | 'processing' | 'success'>('idle');

  const totalAmount = useMemo(() => selectedVehicle ? selectedVehicle.pricePerDay * bookingDays : 0, [selectedVehicle, bookingDays]);

  // Sync state if URL changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat.toLowerCase());
  }, [location.search]);

  const filteredVehicles = useMemo(() => {
    return MOCK_FLEET.filter(v => {
      const matchSearch = v.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'all' || v.category.toLowerCase() === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  const handleSelectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    setCheckoutStep('duration');
  };

  const handleBooking = async () => {
    if (!session || !profile || !selectedVehicle) return;
    
    if (checkoutStep === 'duration') {
      setCheckoutStep('payment');
      return;
    }

    if (checkoutStep === 'payment') {
      if (profile.walletBalance < totalAmount) {
        toast.error("Solde insuffisant dans votre portefeuille Wego.");
        return;
      }

      setCheckoutStep('processing');
      await new Promise(r => setTimeout(r, 2000));

      try {
        const newBalance = profile.walletBalance - totalAmount;
        
        await api.createTransaction({
          userId: session.id,
          type: 'debit',
          title: `Location - ${selectedVehicle.name}`,
          amount: totalAmount,
          date: new Date().toISOString().split('T')[0],
          balance: newBalance
        });

        await api.createOrder({
          userId: session.id,
          items: [{
            id: selectedVehicle.id,
            name: selectedVehicle.name,
            quantity: bookingDays,
            price: selectedVehicle.pricePerDay,
            image: selectedVehicle.image
          }],
          totalAmount: totalAmount,
          status: 'completed',
          date: new Date().toISOString(),
          address: 'Location de véhicule',
          category: 'Location'
        });

        if (profile.userType === 'user') {
          const updatedUser = await api.updateUser(session.id, { 
            walletBalance: newBalance,
            totalSpent: (profile.totalSpent || 0) + totalAmount
          });
          setProfile(updatedUser);
        }

        setCheckoutStep('success');
        toast.success("Réservation confirmée !");
      } catch (err) {
        toast.error("Une erreur est survenue.");
        setCheckoutStep('payment');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-foreground flex flex-col safe-top safe-bottom overflow-x-hidden">
      {/* Background Decorative Halos */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[100px] rounded-full -z-10" />

      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#0A0A0B]/80 backdrop-blur-xl z-[100]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} aria-label="Retour" className="w-10 h-10 rounded-2xl glass flex items-center justify-center active:scale-90 transition-all"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Location</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">Wego Fleet</p>
          </div>
        </div>
        <button aria-label="Notifications" className="w-10 h-10 rounded-2xl glass flex items-center justify-center relative active:scale-90 transition-all">
          <Bell className="w-5 h-5 text-white/70" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
        </button>
      </header>

      <div className="px-6 space-y-6 flex-1 pb-10">
        {/* Search */}
        <div className="relative glass rounded-[24px] flex items-center px-5 py-4 border border-white/5 focus-within:border-accent/40 transition-all">
          <Search className="w-5 h-5 text-white/30 mr-3" />
          <input type="text" placeholder="Rechercher un véhicule..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent flex-1 outline-none text-sm font-semibold placeholder:text-white/20" />
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Catégories</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 -mx-6 px-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id || (cat.id === 'all' && selectedCategory === 'all');
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex flex-col items-center gap-2 shrink-0"
                >
                  <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center border transition-all duration-300 ${
                    isSelected ? 'bg-accent border-accent shadow-lg scale-105' : 'bg-[#151516] border-white/5'
                  }`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-white/40'}`} />
                  </div>
                  <span className={`text-[11px] font-black tracking-tight ${isSelected ? 'text-white' : 'text-white/30'}`}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fleet Grid */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Notre Flotte</h2>
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredVehicles.map((v, idx) => (
                <motion.div 
                  key={v.id} 
                  layout 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleSelectVehicle(v)}
                  aria-label={`Réserver ${v.name}`}
                  className="glass rounded-[32px] overflow-hidden border border-white/5 group active:scale-[0.98] transition-all relative"
                >
                  <div className="relative h-[200px]">
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    {v.isPopular && (
                      <div className="absolute top-4 left-4 bg-accent/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter italic">Populaire</span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                      <div>
                        <h3 className="text-xl font-black text-white leading-none mb-1">{v.name}</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1"><User className="w-3 h-3 text-white/40" /><span className="text-[10px] text-white/40 font-bold">{v.seats}</span></div>
                          <div className="flex items-center gap-1"><Gauge className="w-3 h-3 text-white/40" /><span className="text-[10px] text-white/40 font-bold">{v.transmission}</span></div>
                          <div className="flex items-center gap-1"><Fuel className="w-3 h-3 text-white/40" /><span className="text-[10px] text-white/40 font-bold">{v.fuel}</span></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">JOUR</p>
                        <p className="text-xl font-black text-white">{v.pricePerDay.toLocaleString()} CFA</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Booking Drawer */}
      <AnimatePresence>
        {checkoutStep !== 'idle' && (
          <div className="fixed inset-0 z-[200] flex flex-col justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCheckoutStep('idle')} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="relative w-full bg-[#0F0F11] border-t border-white/10 rounded-t-[40px] px-6 pt-10 pb-12 shadow-2xl">
              {checkoutStep === 'duration' ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setCheckoutStep('idle')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-95 transition-all"><ArrowLeft className="w-5 h-5"/></button>
                    <h2 className="text-2xl font-black text-white">Durée de location</h2>
                  </div>
                  
                  <div className="flex items-center justify-between p-6 rounded-[32px] bg-white/5 border border-white/5">
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase mb-1">Nombre de jours</p>
                      <p className="text-2xl font-black text-white">{bookingDays} Jours</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setBookingDays(Math.max(1, bookingDays - 1))} aria-label="Moins de jours" className="w-12 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center text-xl font-black active:scale-95 transition-all">-</button>
                      <button onClick={() => setBookingDays(bookingDays + 1)} aria-label="Plus de jours" className="w-12 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center text-xl font-black active:scale-95 transition-all">+</button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-bold text-white/40">Total</span>
                    <span className="text-2xl font-black text-white">{totalAmount.toLocaleString()} CFA</span>
                  </div>
                  
                  <button onClick={() => setCheckoutStep('payment')} className="w-full py-5 rounded-3xl bg-accent text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-accent/20">Suivant</button>
                </div>
              ) : checkoutStep === 'payment' || checkoutStep === 'processing' ? (
                <div className="space-y-10 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setCheckoutStep('duration')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-95 transition-all"><ArrowLeft className="w-5 h-5"/></button>
                    <h2 className="text-2xl font-black text-white">Paiement</h2>
                  </div>
                  <div className="glass rounded-[32px] p-6 border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">Wego Wallet Balance</p>
                    <p className="text-3xl font-black text-white">{(profile?.walletBalance || 0).toLocaleString()} CFA</p>
                  </div>
                  <button onClick={handleBooking} disabled={checkoutStep === 'processing'} aria-label="Confirmer le paiement" className="w-full py-5 rounded-3xl bg-accent text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-accent/40">
                    {checkoutStep === 'processing' ? 'Traitement...' : `Confirmer la location (${totalAmount.toLocaleString()} CFA)`}
                  </button>
                </div>
              ) : (
                <div className="py-10 text-center space-y-8 animate-in zoom-in-95">
                  <div className="w-20 h-20 rounded-full bg-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20"><CheckCircle2 className="w-10 h-10 text-white" /></div>
                  <h2 className="text-3xl font-black text-white leading-tight">C'est prêt !</h2>
                  <p className="text-sm text-white/40 px-10">Votre {selectedVehicle?.name} est réservé. Un agent Wego vous contactera pour la remise des clés.</p>
                  <button onClick={() => navigate('/user/history')} className="w-full py-5 rounded-3xl bg-white text-black font-black uppercase text-xs">Mon historique</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserRental;
