import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Calendar, Users, Star, 
  MapPin, Heart, Bell, X, ChevronRight,
  Wifi, Coffee, Car, Dumbbell, Shield, CheckCircle2,
  Phone, User, Building2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';

interface Room {
  id: string;
  name: string;
  pricePerNight: number;
  capacity: number;
  size: number;
  image: string;
  beds: string;
  amenities: string[];
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  stars: number;
  pricePerNight: number;
  image: string;
  isPopular?: boolean;
  amenities: string[];
  description: string;
  rooms: Room[];
}

const MOCK_HOTELS: Hotel[] = [
  {
    id: 'h1',
    name: 'Radisson Blu Dakar, Sea Plaza',
    location: 'Route de la Corniche Ouest, Dakar',
    rating: 4.8,
    reviews: 1245,
    stars: 5,
    pricePerNight: 185000,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
    isPopular: true,
    amenities: ['Wifi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking'],
    description: 'Le Radisson Blu Hotel, Dakar Sea Plaza propose un hébergement luxueux au bord de l\'océan Atlantique. Profitez du spa primé et de la piscine à débordement géante.',
    rooms: [
      { id: 'r1', name: 'Chambre Standard Vue Océan', pricePerNight: 185000, capacity: 2, size: 32, image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop', beds: '1 Lit King Size', amenities: ['Wifi', 'Climatisation', 'TV Écran Plat', 'Mini-bar'] },
      { id: 'r2', name: 'Suite Exécutive', pricePerNight: 450000, capacity: 3, size: 65, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop', beds: '1 Lit King Size, 1 Canapé Lit', amenities: ['Wifi', 'Salon Séparé', 'Accès Lounge', 'Baignoire'] }
    ]
  },
  {
    id: 'h2',
    name: 'Terrou-Bi Resort',
    location: 'Boulevard Martin Luther King, Dakar',
    rating: 4.7,
    reviews: 892,
    stars: 5,
    pricePerNight: 160000,
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&h=400&fit=crop',
    isPopular: true,
    amenities: ['Wifi', 'Pool', 'Casino', 'Restaurant', 'Beach'],
    description: 'Niché face à l\'île de Gorée, le Terrou-Bi est réputé pour sa plage privée, sa marina, et son complexe touristique avec casino et restaurants gastronomiques.',
    rooms: [
      { id: 'r3', name: 'Chambre Classique', pricePerNight: 160000, capacity: 2, size: 28, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop', beds: '1 Lit Double', amenities: ['Wifi', 'Balcon', 'Climatisation'] }
    ]
  },
  {
    id: 'h3',
    name: 'Hôtel King Fahd Palace',
    location: 'Pointe des Almadies, Dakar',
    rating: 4.5,
    reviews: 641,
    stars: 5,
    pricePerNight: 125000,
    image: 'https://images.unsplash.com/photo-1542314831-c6a4d27df08f?w=600&h=400&fit=crop',
    amenities: ['Wifi', 'Golf', 'Pool', 'Gym'],
    description: 'Complexe hôtelier sur 35 hectares longeant l\'océan. Propose le plus grand centre de conférence d\'Afrique de l\'Ouest.',
    rooms: [
      { id: 'r4', name: 'Chambre Supérieure', pricePerNight: 125000, capacity: 2, size: 30, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop', beds: '2 Lits Simples', amenities: ['Wifi', 'Vue Jardin', 'Climatisation'] }
    ]
  },
  {
    id: 'h4',
    name: 'Yaas Hotel Dakar Almadies',
    location: 'Route des Almadies, Dakar',
    rating: 4.3,
    reviews: 310,
    stars: 3,
    pricePerNight: 75000,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c0d12c5a?w=600&h=400&fit=crop',
    amenities: ['Wifi', 'Restaurant', 'Parking'],
    description: 'Design moderne et coloré, le Yaas Hotel est parfait pour des nuits confortables à prix raisonnable au cœur des Almadies.',
    rooms: [
      { id: 'r5', name: 'Chambre Standard', pricePerNight: 75000, capacity: 2, size: 22, image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&h=300&fit=crop', beds: '1 Lit King Size', amenities: ['Wifi', 'Douche Italienne'] }
    ]
  }
];

const UserHotels = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, setProfile, session } = useAuthStore();
  
  const [search, setSearch] = useState('');
  const [guests, setGuests] = useState(1);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  
  // Booking State
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [nights, setNights] = useState(1);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'room' | 'payment' | 'processing' | 'success'>('idle');

  const filteredHotels = useMemo(() => {
    return MOCK_HOTELS.filter(h => {
      return h.name.toLowerCase().includes(search.toLowerCase()) || 
             h.location.toLowerCase().includes(search.toLowerCase());
    });
  }, [search]);

  const handleSelectHotel = (h: Hotel) => {
    setSelectedHotel(h);
    setCheckoutStep('idle');
  };

  const handleSelectRoom = (r: Room) => {
    setSelectedRoom(r);
    setCheckoutStep('room');
  };

  const totalAmount = useMemo(() => {
    if (!selectedRoom) return 0;
    return selectedRoom.pricePerNight * nights;
  }, [selectedRoom, nights]);

  const handleBooking = async () => {
    if (!session || !profile || !selectedHotel || !selectedRoom) return;
    
    if (checkoutStep === 'room') {
      setCheckoutStep('payment');
      return;
    }

    if (checkoutStep === 'payment') {
      if (profile.walletBalance < totalAmount) {
        toast.error("Solde insuffisant dans votre portefeuille Wego.");
        return;
      }

      setCheckoutStep('processing');
      await new Promise(r => setTimeout(r, 2000)); // Simulating API call

      try {
        const newBalance = profile.walletBalance - totalAmount;
        
        await api.createTransaction({
          userId: session.id,
          type: 'debit',
          title: `Réservation Hôtel - ${selectedHotel.name}`,
          amount: totalAmount,
          date: new Date().toISOString().split('T')[0],
          balance: newBalance
        });

        await api.createOrder({
          userId: session.id,
          items: [{
            id: selectedRoom.id,
            name: `${selectedHotel.name} - ${selectedRoom.name}`,
            quantity: nights,
            price: selectedRoom.pricePerNight,
            image: selectedHotel.image
          }],
          totalAmount: totalAmount,
          status: 'completed',
          date: new Date().toISOString(),
          address: selectedHotel.location,
          category: 'Hotels'
        });

        if (profile.userType === 'user') {
          const updatedUser = await api.updateUser(session.id, { 
            walletBalance: newBalance,
            totalSpent: (profile.totalSpent || 0) + totalAmount
          });
          setProfile(updatedUser);
        }

        setCheckoutStep('success');
        toast.success("Réservation confirmée avec succès !");
      } catch (err) {
        console.error("Hotel Booking Error:", err);
        toast.error("Une erreur est survenue lors du paiement.");
        setCheckoutStep('payment');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col safe-top safe-bottom overflow-x-hidden">
      {/* Background Decorative Halos */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[100px] rounded-full -z-10" />

      {/* ── Fixed Top Section ── */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl safe-top">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/services')} 
              aria-label="Retour" 
              className="w-10 h-10 rounded-[14px] glass-strong border border-white/10 flex items-center justify-center active:scale-90 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase">Hôtels</h1>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/30">Wego Premium Stays</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/user/notifications')} 
            aria-label="Notifications" 
            className="w-10 h-10 rounded-[14px] glass-strong border border-white/10 flex items-center justify-center relative active:scale-90 transition-all"
          >
            <Bell className="w-5 h-5 text-white/60" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
          </button>
        </header>

        {/* Search & Filters */}
        <div className="px-6 pb-4 space-y-3">
          <div className="relative glass-strong rounded-[20px] flex items-center px-4 py-3 border border-white/5 focus-within:border-accent/40 transition-all">
            <MapPin className="w-5 h-5 text-white/30 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Où allez-vous ?"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent flex-1 outline-none text-sm font-semibold placeholder:text-white/20 text-white"
            />
            {search && (
              <button aria-label="Effacer" onClick={() => setSearch('')} className="ml-2 text-white/30 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
             <button className="flex-1 glass-strong rounded-[20px] p-3 border border-white/5 flex items-center gap-3 text-left">
                <Calendar className="w-5 h-5 text-accent" />
                <div className="flex-1">
                   <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Dates</p>
                   <p className="text-xs font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">Aujourd'hui - 1 nuit</p>
                </div>
             </button>
             <button 
               onClick={() => setGuests(guests >= 4 ? 1 : guests + 1)}
               className="flex-1 glass-strong rounded-[20px] p-3 border border-white/5 flex items-center gap-3 text-left active:scale-95 transition-transform"
             >
                <Users className="w-5 h-5 text-accent" />
                <div className="flex-1">
                   <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Voyageurs</p>
                   <p className="text-xs font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">{guests} adulte{guests > 1 ? 's' : ''}</p>
                </div>
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-6 pt-[220px] pb-32">
        
        {/* Popular / Results Count */}
        <div className="flex justify-between items-end">
           <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Établissements</h2>
           <span className="text-[10px] font-bold text-accent px-3 py-1 bg-accent/10 rounded-full">{filteredHotels.length} trouvés</span>
        </div>

        {/* Hotel List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredHotels.map((h, idx) => (
              <motion.div
                key={h.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleSelectHotel(h)}
                className="glass-strong rounded-[32px] overflow-hidden border border-white/5 group active:scale-[0.98] transition-all cursor-pointer relative"
              >
                <div className="relative h-[220px]">
                  <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  <button aria-label="Ajouter aux favoris" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors">
                     <Heart className="w-5 h-5 text-white/80" />
                  </button>

                  {h.isPopular && (
                     <div className="absolute top-4 left-4 bg-accent/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                       <span className="text-[10px] font-black text-white uppercase tracking-tighter italic">Top Choix</span>
                     </div>
                  )}

                  <div className="absolute bottom-4 left-5 right-5">
                     <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < h.stars ? 'text-accent fill-accent' : 'text-white/20 fill-white/10'}`} />
                        ))}
                     </div>
                     <h3 className="text-xl font-black text-white leading-tight mb-1">{h.name}</h3>
                     <p className="text-[11px] font-bold text-white/60 mb-3">{h.location}</p>
                     
                     <div className="flex items-end justify-between">
                        <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-md w-fit">
                           <span className="text-[10px] font-black text-white bg-accent px-1.5 rounded">{h.rating}</span>
                           <span className="text-[10px] text-white/80 font-medium">{h.reviews} avis</span>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black text-white leading-none">{h.pricePerNight.toLocaleString()} <span className="text-sm">CFA</span></p>
                           <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-1">Par nuit • {guests} lit</p>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredHotels.length === 0 && (
             <div className="py-20 text-center opacity-40">
                <Building2 className="w-12 h-12 mx-auto mb-4" />
                <p>Aucun hôtel trouvé</p>
             </div>
          )}
        </div>
      </div>

      {/* ── Hotel Detail Modal ── */}
      <AnimatePresence>
        {selectedHotel && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-[#0A0A0B] overflow-y-auto no-scrollbar flex flex-col"
          >
            <div className="relative h-[45vh] shrink-0">
               <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/20 to-black/40" />
               
               <button 
                 aria-label="Fermer"
                 onClick={() => setSelectedHotel(null)} 
                 className="absolute top-6 left-4 w-12 h-12 rounded-full glass-strong flex items-center justify-center border border-white/10 active:scale-95 transition-transform"
               >
                  <ArrowLeft className="w-6 h-6 text-white" />
               </button>

               <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex gap-1 mb-3">
                     {Array.from({ length: 5 }).map((_, i) => (
                       <Star key={i} className={`w-4 h-4 ${i < selectedHotel.stars ? 'text-accent fill-accent' : 'text-white/20 fill-white/10'}`} />
                     ))}
                  </div>
                  <h1 className="text-3xl font-black text-white leading-tight mb-2 tracking-tighter">{selectedHotel.name}</h1>
                  <div className="flex items-center gap-2 text-white/60 mb-4">
                     <MapPin className="w-4 h-4 shrink-0" />
                     <p className="text-xs font-bold leading-relaxed">{selectedHotel.location}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {selectedHotel.amenities.map(am => (
                        <div key={am} className="px-3 py-1 rounded-full bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/80">
                           {am}
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="px-6 py-6 pb-32">
               <div className="glass rounded-[32px] p-6 border border-white/5 mb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-3">À propos</h3>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">{selectedHotel.description}</p>
               </div>

               <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Chambres Disponibles</h3>
               <div className="space-y-4">
                  {selectedHotel.rooms.map(room => (
                     <div key={room.id} className="glass-strong rounded-[32px] overflow-hidden border border-white/5 flex flex-col md:flex-row shadow-xl">
                        <div className="h-48 md:h-auto md:w-1/3 relative shrink-0">
                           <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                           <div>
                              <h4 className="text-lg font-black text-white mb-2">{room.name}</h4>
                              <div className="flex flex-wrap gap-3 mb-4">
                                 <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-white/40" /><span className="text-[11px] font-bold text-white/60">Jusqu'à {room.capacity} pers.</span></div>
                                 <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-white/40" /><span className="text-[11px] font-bold text-white/60">{room.size} m²</span></div>
                              </div>
                              <p className="text-xs text-accent font-bold mb-4 bg-accent/10 px-3 py-1.5 rounded-lg inline-block w-fit">{room.beds}</p>
                           </div>
                           <div className="flex items-end justify-between mt-4 border-t border-white/5 pt-4">
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Par nuit</p>
                                 <p className="text-xl font-black text-white">{room.pricePerNight.toLocaleString()} CFA</p>
                              </div>
                              <button 
                                onClick={() => handleSelectRoom(room)}
                                className="px-6 py-3 rounded-2xl bg-accent text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20 active:scale-95 transition-transform"
                              >
                                 Réserver
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Checkout Drawer ── */}
      <AnimatePresence>
        {checkoutStep !== 'idle' && selectedRoom && selectedHotel && (
          <div className="fixed inset-0 z-[300] flex flex-col justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCheckoutStep('idle')} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="relative w-full bg-[#0F0F11] border-t border-white/10 rounded-t-[40px] px-6 pt-10 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
              
              {checkoutStep === 'room' ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <button onClick={() => setCheckoutStep('idle')} aria-label="Fermer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-95"><X className="w-5 h-5"/></button>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Aperçu Réduction</h2>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-[24px] bg-white/5 border border-white/5">
                     <img src={selectedRoom.image} alt={selectedRoom.name} className="w-20 h-20 rounded-xl object-cover" />
                     <div>
                        <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{selectedHotel.name}</p>
                        <p className="text-sm font-bold text-white line-clamp-1">{selectedRoom.name}</p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-6 rounded-[24px] bg-white/5 border border-white/5">
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase mb-1">Durée du séjour</p>
                      <p className="text-2xl font-black text-white">{nights} Nuit{nights > 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setNights(Math.max(1, nights - 1))} className="w-12 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center text-xl font-black active:scale-95">-</button>
                      <button onClick={() => setNights(nights + 1)} className="w-12 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center text-xl font-black active:scale-95">+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white/40">Total ({nights} nuits)</span>
                    <span className="text-3xl font-black text-white">{totalAmount.toLocaleString()} CFA</span>
                  </div>
                  
                  <button onClick={() => setCheckoutStep('payment')} className="w-full py-5 rounded-[24px] bg-accent text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-accent/20 active:scale-95 transition-transform">
                     Procéder au paiement
                  </button>
                </div>
              ) : checkoutStep === 'payment' || checkoutStep === 'processing' ? (
                <div className="space-y-10 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <button aria-label="Retour" onClick={() => setCheckoutStep('room')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-95"><ArrowLeft className="w-5 h-5"/></button>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Paiement</h2>
                  </div>
                  
                  <div className="glass rounded-[32px] p-8 border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent shadow-xl">
                    <p className="text-[10px] font-black text-white/40 uppercase mb-2 tracking-widest">Wego Wallet Balance</p>
                    <p className="text-4xl font-black text-white">{(profile?.walletBalance || 0).toLocaleString()} <span className="text-xl text-white/40">CFA</span></p>
                  </div>

                  <button onClick={handleBooking} disabled={checkoutStep === 'processing'} className="w-full py-5 rounded-[24px] bg-accent text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-accent/40 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center justify-center gap-3">
                       {checkoutStep === 'processing' ? 'Traitement...' : `Régler ${totalAmount.toLocaleString()} CFA`}
                    </div>
                  </button>
                </div>
              ) : (
                <div className="py-10 text-center space-y-8 animate-in zoom-in-95">
                  <div className="w-24 h-24 rounded-[32px] bg-emerald-500/20 mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/20 border border-emerald-500/30">
                     <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black text-white leading-tight tracking-tighter mb-2">Réservation Confirmée</h2>
                     <p className="text-sm text-white/50 px-8 leading-relaxed">Vos nuits au <strong>{selectedHotel.name}</strong> sont validées. Pensez à votre passeport ou CNI lors du check-in.</p>
                  </div>
                  <button onClick={() => { setCheckoutStep('idle'); setSelectedHotel(null); navigate('/user/history'); }} className="w-full py-5 rounded-[24px] bg-white text-black font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform">
                     Voir ma réservation
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserHotels;
