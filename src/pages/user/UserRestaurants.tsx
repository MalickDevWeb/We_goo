import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Bell, Star, ShoppingCart,
  Heart, Clock, Flame, Plus, Minus, CheckCircle2, 
  Shield, X, Timer, MapPin, Utensils, Users
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { OrderItem } from '@/types/index';
import LocationSearchInput from '@/components/LocationSearchInput';

interface FoodItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;  // matches CATEGORIES id exactly (lowercase)
  restaurant: string;
  prepTime: string;
  isHot?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_FOOD: FoodItem[] = [
  // Burgers
  { id: 'b1', name: 'Burger Wego Supreme',    price: 5500, rating: 4.9, reviews: 456, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop&q=90', category: 'burger',    restaurant: 'Dakar Burgers',    prepTime: '15-20 min', isHot: true },
  { id: 'b2', name: 'Double Smash Burger',    price: 6200, rating: 4.8, reviews: 312, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop&q=90', category: 'burger',    restaurant: 'Burger Palace',    prepTime: '15-25 min', isHot: true },
  { id: 'b3', name: 'Chicken BBQ Burger',     price: 4800, rating: 4.7, reviews: 198, image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop&q=90', category: 'burger',    restaurant: 'Dakar Burgers',    prepTime: '10-20 min' },

  // Pizza
  { id: 'p1', name: 'Pizza Margherita XL',   price: 7500, rating: 4.9, reviews: 521, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop&q=90', category: 'pizza',     restaurant: 'Mama Pizza',       prepTime: '20-30 min', isHot: true },
  { id: 'p2', name: 'Quattro Formaggi',       price: 8200, rating: 4.8, reviews: 287, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop&q=90', category: 'pizza',     restaurant: 'Pizza Roma',       prepTime: '20-30 min' },
  { id: 'p3', name: 'Pizza Pépperoni Spécial',price: 8800, rating: 5.0, reviews: 410, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop&q=90', category: 'pizza',     restaurant: 'Mama Pizza',       prepTime: '25-35 min', isHot: true },
  { id: 'p4', name: 'Calzone Poulet',         price: 7000, rating: 4.6, reviews: 134, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop&q=90', category: 'pizza',     restaurant: 'Pizza Roma',       prepTime: '25-30 min' },

  // Asiatique
  { id: 'a1', name: 'Sushi Party Box',        price: 18000,rating: 5.0, reviews: 124, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=400&fit=crop&q=90', category: 'asiatique', restaurant: 'Wasabi Zen',       prepTime: '25-35 min' },
  { id: 'a2', name: 'Ramen Tonkotsu',         price: 8500, rating: 4.8, reviews: 201, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop&q=90', category: 'asiatique', restaurant: 'Noodle House',     prepTime: '20-30 min', isHot: true },
  { id: 'a3', name: 'Pad Thaï Crevettes',     price: 7200, rating: 4.7, reviews: 163, image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=400&fit=crop&q=90', category: 'asiatique', restaurant: 'Bangkok Street',   prepTime: '15-25 min' },

  // Mexicain
  { id: 'm1', name: 'Tacos 3 Viandes',        price: 3500, rating: 4.7, reviews: 890, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop&q=90', category: 'mexicain',  restaurant: "O'Tacos Dakar",   prepTime: '10-15 min', isHot: true },
  { id: 'm2', name: 'Burrito Beef & Guac',    price: 4200, rating: 4.7, reviews: 167, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&q=90', category: 'mexicain',  restaurant: 'MexiGo',          prepTime: '15-20 min' },
  { id: 'm3', name: 'Nachos Suprêmes',        price: 3800, rating: 4.5, reviews: 245, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=400&fit=crop&q=90', category: 'mexicain',  restaurant: 'MexiGo',          prepTime: '10-15 min' },

  // Kebab
  { id: 'k1', name: 'Kebab Mixte Royal',      price: 4500, rating: 4.8, reviews: 342, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=400&fit=crop&q=90', category: 'kebab',     restaurant: 'Istanbul Grill',  prepTime: '15-20 min', isHot: true },
  { id: 'k2', name: 'Durum Viande Hachée',    price: 3800, rating: 4.6, reviews: 278, image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&h=400&fit=crop&q=90', category: 'kebab',     restaurant: 'Istanbul Grill',  prepTime: '10-15 min' },

  // Indien
  { id: 'i1', name: 'Butter Chicken',         price: 6500, rating: 4.8, reviews: 215, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=400&fit=crop&q=90', category: 'indien',    restaurant: 'Le Taj Mahal',    prepTime: '20-30 min', isHot: true },
  { id: 'i2', name: 'Naan + Tikka Masala',    price: 7800, rating: 4.9, reviews: 189, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop&q=90', category: 'indien',    restaurant: 'Curry Palace',    prepTime: '25-35 min' },

  // Italien (pasta etc.)
  { id: 'it1', name: 'Lasagnes Maison',       price: 5800, rating: 4.6, reviews: 98,  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&q=90', category: 'italien',   restaurant: 'La Trattoria',    prepTime: '25-35 min' },
  { id: 'it2', name: 'Carbonara Tagliatelle', price: 6200, rating: 4.7, reviews: 143, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=400&fit=crop&q=90', category: 'italien',   restaurant: 'La Trattoria',    prepTime: '20-30 min', isHot: true },
];

const CATEGORIES = [
  { id: 'all',      name: 'Tout',      emoji: '🍽️', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop&q=90' },
  { id: 'burger',   name: 'Burger',    emoji: '🍔', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&q=90' },
  { id: 'pizza',    name: 'Pizza',     emoji: '🍕', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&q=90' },
  { id: 'asiatique',name: 'Asiatique', emoji: '🍜', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&h=200&fit=crop&q=90' },
  { id: 'mexicain', name: 'Mexicain',  emoji: '🌮', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&h=200&fit=crop&q=90' },
  { id: 'kebab',    name: 'Kebab',     emoji: '🥙', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&h=200&fit=crop&q=90' },
  { id: 'indien',   name: 'Indien',    emoji: '🍛', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=200&h=200&fit=crop&q=90' },
  { id: 'italien',  name: 'Italien',   emoji: '🍝', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&q=90' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const UserRestaurants = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, setProfile, session } = useAuthStore();

  const searchParams = new URLSearchParams(location.search);
  const initialCategory = (searchParams.get('category') || 'all').toLowerCase();

  const [search, setSearch]                 = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [cart, setCart]                     = useState<{ product: FoodItem; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen]         = useState(false);
  const [checkoutStep, setCheckoutStep]     = useState<'idle' | 'address' | 'payment' | 'processing' | 'success'>('idle');
  const [deliveryAddress, setDeliveryAddress] = useState('Sacré-Cœur 3, Dakar, Sénégal');
  const [favorites, setFavorites]           = useState<string[]>([]);
  const [selectedItem, setSelectedItem]     = useState<FoodItem | null>(null);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  useEffect(() => {
    const cat = (new URLSearchParams(location.search).get('category') || 'all').toLowerCase();
    setSelectedCategory(cat);
  }, [location.search]);

  const filteredProducts = useMemo(() =>
    MOCK_FOOD.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.restaurant.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCat;
    }),
  [search, selectedCategory]);

  const handleAddToCart = (e: React.MouseEvent, p: FoodItem) => {
    e.stopPropagation();
    setCart(prev => {
      const found = prev.find(i => i.product.id === p.id);
      if (found) return prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product: p, quantity: 1 }];
    });
    toast.success(`${p.name} ajouté !`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(i => i.product.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
          .filter(i => i.quantity > 0)
    );
  };

  const toggleFav = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleCheckout = async () => {
    if (!session || !profile) return;
    if (checkoutStep === 'address') { setCheckoutStep('payment'); return; }
    if (checkoutStep === 'payment') {
      if ((profile.walletBalance || 0) < cartTotal) {
        toast.error('Solde insuffisant dans votre portefeuille Wego.');
        return;
      }
      setCheckoutStep('processing');
      await new Promise(r => setTimeout(r, 1800));
      try {
        const newBalance = profile.walletBalance - cartTotal;
        await api.createTransaction({ userId: session.id, type: 'debit', title: `Restau - ${cart[0].product.restaurant}`, amount: cartTotal, date: new Date().toISOString().split('T')[0], balance: newBalance });
        const orderItems: OrderItem[] = cart.map(i => ({ id: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.price, image: i.product.image }));
        await api.createOrder({ userId: session.id, items: orderItems, totalAmount: cartTotal, status: 'preparing', date: new Date().toISOString(), address: deliveryAddress, category: 'Restaurants' });
        if (profile.userType === 'user') {
          const updated = await api.updateUser(session.id, { walletBalance: newBalance, totalSpent: (profile.totalSpent || 0) + cartTotal });
          setProfile(updated);
        }
        setCheckoutStep('success');
        setCart([]);
        toast.success('Commande passée ! Le chef prépare votre repas. 🍽️');
      } catch {
        toast.error('Une erreur est survenue lors du paiement.');
        setCheckoutStep('payment');
      }
    }
  };

  const categoryLabel = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Tous';

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col safe-top safe-bottom overflow-x-hidden">

      {/* ── Fixed Top Section ── */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl safe-top landscape:bg-[#0A0A0B]/95">
        {/* Header */}
        <header className="px-5 py-4 landscape:py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/services')} aria-label="Retour" className="w-10 h-10 landscape:w-8 landscape:h-8 rounded-[14px] glass-strong border border-white/10 flex items-center justify-center active:scale-90 transition-all">
              <ArrowLeft className="w-5 h-5 landscape:w-4 landscape:h-4" />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight landscape:text-lg">Wego Food</h1>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/30">{filteredProducts.length} plat{filteredProducts.length !== 1 ? 's' : ''} • {categoryLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => navigate('/user/notifications')} aria-label="Notifications" className="w-10 h-10 landscape:w-8 landscape:h-8 rounded-[14px] glass-strong border border-white/10 flex items-center justify-center relative active:scale-90 transition-all">
              <Bell className="w-5 h-5 landscape:w-4 landscape:h-4 text-white/60" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
            </button>
            <button
              onClick={() => { if (cartCount > 0) setIsCartOpen(true); }}
              aria-label={`Panier (${cartCount})`}
              className="w-10 h-10 rounded-[14px] bg-accent text-white flex items-center justify-center relative shadow-lg shadow-accent/30 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 bg-white text-accent text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-accent/20">
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="px-5 pb-4 landscape:pb-2">
          <div className="relative glass-strong rounded-[20px] flex items-center px-4 py-3 landscape:py-2 border border-white/5 focus-within:border-accent/40 transition-all">
            <Search className="w-5 h-5 portrait:block hidden text-white/30 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Plat, restaurant, cuisine..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent flex-1 outline-none text-sm font-semibold placeholder:text-white/20 text-white"
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Effacer" className="ml-2 text-white/30 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 pb-32 space-y-6 pt-[180px] landscape:pt-[120px]">

        {/* ── Categories ── */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Catégories</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 -mx-5 px-5">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex flex-col items-center gap-2 shrink-0"
                >
                  <div className={`w-[72px] h-[72px] rounded-[22px] overflow-hidden border-2 transition-all duration-200 relative ${
                    isSelected ? 'border-accent shadow-lg shadow-accent/30 scale-105' : 'border-white/10 opacity-50 hover:opacity-70'
                  }`}>
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-accent/25 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-black tracking-tight ${isSelected ? 'text-white' : 'text-white/30'}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Food Grid ── */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
            {filteredProducts.filter(p => p.isHot).length > 0 ? '🔥 Populaires & Découverte' : 'Nos plats'}
          </p>
          <AnimatePresence mode="popLayout">
            {filteredProducts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 gap-4 opacity-50"
              >
                <div className="w-20 h-20 rounded-full glass border border-white/10 flex items-center justify-center text-3xl">
                  🍽️
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-white uppercase tracking-widest">Aucun plat trouvé</p>
                  <p className="text-xs text-white/40 mt-1">Essayez une autre catégorie ou recherche</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((p, idx) => {
                  const qtyInCart = cart.find(i => i.product.id === p.id)?.quantity || 0;
                  const isFav = favorites.includes(p.id);
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => setSelectedItem(p)}
                      className="glass-strong rounded-[24px] overflow-hidden border border-white/5 group active:scale-[0.98] transition-all hover:border-white/15 hover:shadow-xl hover:shadow-black/40 cursor-pointer"
                    >
                      {/* Image */}
                      <div className="relative h-[150px] overflow-hidden">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {p.isHot && (
                          <div className="absolute top-2.5 left-2.5 bg-accent/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                            <Flame className="w-3 h-3 text-white fill-white" />
                            <span className="text-[8px] font-black text-white uppercase tracking-wider">Populaire</span>
                          </div>
                        )}
                        <button
                          onClick={e => toggleFav(e, p.id)}
                          aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center transition-all ${
                            isFav ? 'bg-accent text-white' : 'bg-black/40 text-white/60'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-[10px] font-bold text-white/60">{p.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Timer className="w-3 h-3 text-white/30" />
                            <span className="text-[9px] font-bold text-white/30">{p.prepTime}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-white line-clamp-1 leading-tight">{p.name}</h3>
                          <p className="text-[9px] font-bold text-accent mt-0.5 truncate">{p.restaurant}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-black text-white">{p.price.toLocaleString()} <span className="text-[9px] text-white/40">CFA</span></span>
                          {qtyInCart === 0 ? (
                            <button
                              onClick={e => { e.stopPropagation(); handleAddToCart(e, p); }}
                              aria-label={`Ajouter ${p.name}`}
                              className="w-8 h-8 rounded-[10px] bg-accent flex items-center justify-center text-white active:scale-90 transition-all shadow-lg shadow-accent/30"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button onClick={e => { e.stopPropagation(); updateQty(p.id, -1); }} aria-label="Réduire" className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center active:scale-90">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black text-accent w-4 text-center">{qtyInCart}</span>
                              <button onClick={e => { e.stopPropagation(); updateQty(p.id, 1); }} aria-label="Augmenter" className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center active:scale-90">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Cart FAB (when items in cart) ── */}
      <AnimatePresence>
        {cartCount > 0 && !isCartOpen && checkoutStep === 'idle' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-5 right-5 z-[500]"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full py-4 rounded-[22px] bg-accent text-white font-black flex items-center justify-between px-5 shadow-2xl shadow-accent/40 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span className="text-sm uppercase tracking-widest">Voir ma commande</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">{cartTotal.toLocaleString()} CFA</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs font-black">{cartCount}</span>
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart Drawer & Checkout ── */}
      <AnimatePresence>
        {(isCartOpen || checkoutStep !== 'idle') && (
          <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (checkoutStep === 'idle') setIsCartOpen(false); }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28 }}
              className="relative w-full bg-[#0F0F12] border-t border-white/10 rounded-t-[40px] px-6 pt-8 pb-12 shadow-2xl max-h-[90svh] overflow-y-auto no-scrollbar"
            >
              {/* Handle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/10 rounded-full" />

              {/* ─ CART REVIEW ─ */}
              {checkoutStep === 'idle' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsCartOpen(false)} aria-label="Fermer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all">
                      <X className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-xl font-black text-white">Ma Commande</h2>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">{cartCount} article{cartCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-white truncate">{item.product.name}</p>
                          <p className="text-[10px] text-accent font-bold mb-2">{item.product.restaurant}</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(item.product.id, -1)} aria-label="Réduire" className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center active:scale-90"><Minus className="w-3 h-3"/></button>
                            <span className="text-sm font-black text-white w-5 text-center">{item.quantity}</span>
                            <button onClick={() => updateQty(item.product.id, 1)} aria-label="Augmenter" className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center active:scale-90"><Plus className="w-3 h-3"/></button>
                          </div>
                        </div>
                        <p className="text-sm font-black text-white shrink-0 self-center">{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between py-4 border-t border-white/5">
                    <span className="text-sm font-bold text-white/40">Total</span>
                    <span className="text-2xl font-black text-white">{cartTotal.toLocaleString()} <span className="text-sm text-white/40">CFA</span></span>
                  </div>
                  <button
                    onClick={() => setCheckoutStep('address')}
                    disabled={cart.length === 0}
                    className="w-full py-4 rounded-[20px] bg-accent text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/20 disabled:opacity-40 active:scale-[0.98] transition-all"
                  >
                    Commander maintenant
                  </button>
                </div>
              )}

              {/* ─ ADDRESS ─ */}
              {checkoutStep === 'address' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCheckoutStep('idle')} aria-label="Retour" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5"/></button>
                    <div>
                      <h2 className="text-xl font-black text-white">Adresse de livraison</h2>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Où souhaitez-vous être livré ?</p>
                    </div>
                  </div>
                  <LocationSearchInput
                    label="Adresse de réception"
                    value={deliveryAddress}
                    onChange={setDeliveryAddress}
                    onSelect={(displayName) => setDeliveryAddress(displayName)}
                    placeholder="Où livrer ?"
                    showCurrentLocation={true}
                  />
                  <button onClick={() => setCheckoutStep('payment')} className="w-full py-4 rounded-[20px] bg-accent text-white font-black uppercase tracking-widest text-xs active:scale-[0.98] transition-all">Suivant →</button>
                </div>
              )}

              {/* ─ PAYMENT ─ */}
              {(checkoutStep === 'payment' || checkoutStep === 'processing') && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCheckoutStep('address')} aria-label="Retour" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5"/></button>
                    <div>
                      <h2 className="text-xl font-black text-white">Paiement</h2>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Wego Wallet</p>
                    </div>
                  </div>
                  {/* Wallet Card — no gradient */}
                  <div className="glass-strong rounded-[28px] p-6 border border-accent/30 bg-accent/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Wego Wallet</p>
                        <p className="text-[10px] text-white/50">Paiement sécurisé</p>
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-white/40 uppercase mb-1.5">Solde disponible</p>
                    <p className="text-3xl font-black text-white">{(profile?.walletBalance || 0).toLocaleString()} <span className="text-lg text-white/40">CFA</span></p>
                    {(profile?.walletBalance || 0) < cartTotal && (
                      <p className="text-xs text-red-400 mt-2 font-bold">⚠️ Solde insuffisant ({(cartTotal - (profile?.walletBalance || 0)).toLocaleString()} CFA manquant)</p>
                    )}
                  </div>
                  <div className="glass rounded-[20px] p-4 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">{deliveryAddress}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-white/50 font-bold">Montant à payer</span>
                    <span className="text-2xl font-black text-white">{cartTotal.toLocaleString()} CFA</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutStep === 'processing' || (profile?.walletBalance || 0) < cartTotal}
                    className="w-full py-4 rounded-[20px] bg-accent text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/30 disabled:opacity-50 active:scale-[0.98] transition-all"
                  >
                    {checkoutStep === 'processing' ? '⏳ Traitement...' : `Payer ${cartTotal.toLocaleString()} CFA`}
                  </button>
                </div>
              )}

              {/* ─ SUCCESS ─ */}
              {checkoutStep === 'success' && (
                <div className="py-10 text-center space-y-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }} className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Bon appétit !</h2>
                    <p className="text-sm text-white/40 mt-2 leading-relaxed px-6">Le restaurant prépare votre commande. Un livreur Wego prendra en charge votre livraison.</p>
                  </div>
                  <div className="glass rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span className="text-xs font-bold text-white">Livraison estimée</span>
                    </div>
                    <span className="text-xs font-black text-accent">30-45 min</span>
                  </div>
                  <button onClick={() => { navigate('/user/history'); setCheckoutStep('idle'); }} className="w-full py-4 rounded-[20px] bg-accent text-white font-black uppercase tracking-widest text-xs active:scale-[0.98] transition-all shadow-lg shadow-accent/30">
                    Suivre ma livraison →
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[3000] flex flex-col pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            {/* Modal Sheet */}
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 max-h-[90svh] overflow-y-auto no-scrollbar bg-[#0f0f12] rounded-t-[40px] border-t border-white/10"
            >
              {/* Image Hero */}
              <div className="relative h-[300px] sm:h-[400px] w-full shrink-0">
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f12] via-transparent to-black/40" />
                
                {/* Top Controls */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <button aria-label="Fermer" onClick={() => setSelectedItem(null)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                  <button 
                    aria-label={favorites.includes(selectedItem.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    onClick={(e) => { e.stopPropagation(); toggleFav(e, selectedItem.id); }}
                    className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 transition-all ${favorites.includes(selectedItem.id) ? 'bg-accent text-white' : 'bg-black/40 text-white/60'}`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(selectedItem.id) ? 'fill-white' : ''}`} />
                  </button>
                </div>

                {/* Hot Badge */}
                {selectedItem.isHot && (
                  <div className="absolute bottom-4 left-6 bg-accent backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl shadow-accent/30">
                    <Flame className="w-4 h-4 text-white fill-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Populaire</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="px-6 py-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h2 className="text-3xl font-black text-white leading-tight">{selectedItem.name}</h2>
                  </div>
                  <div className="flex items-center gap-2 text-accent">
                    <Utensils className="w-4 h-4" />
                    <span className="text-sm font-bold">{selectedItem.restaurant}</span>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass rounded-[20px] p-3 flex flex-col items-center justify-center gap-1 border border-white/5">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-black text-white">{selectedItem.rating}</span>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{selectedItem.reviews} avis</span>
                  </div>
                  <div className="glass rounded-[20px] p-3 flex flex-col items-center justify-center gap-1 border border-white/5">
                    <Timer className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-black text-white">{selectedItem.prepTime}</span>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Préparation</span>
                  </div>
                  <div className="glass rounded-[20px] p-3 flex flex-col items-center justify-center gap-1 border border-white/5">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-black text-white">{selectedItem.category}</span>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Catégorie</span>
                  </div>
                </div>

                {/* Price and Cart Controls */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Prix total</p>
                      <p className="text-3xl font-black text-white">{selectedItem.price.toLocaleString()} <span className="text-lg text-white/40">CFA</span></p>
                    </div>
                    {/* Quantity controls if already in cart */}
                    {(cart.find(i => i.product.id === selectedItem.id)?.quantity || 0) > 0 && (
                      <div className="glass-strong rounded-2xl p-1 flex items-center gap-3">
                        <button onClick={() => updateQty(selectedItem.id, -1)} aria-label="Réduire" className="w-10 h-10 rounded-[14px] bg-white/10 flex items-center justify-center text-white active:scale-95 transition-all">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-black text-accent w-6 text-center">
                          {cart.find(i => i.product.id === selectedItem.id)?.quantity}
                        </span>
                        <button onClick={() => updateQty(selectedItem.id, 1)} aria-label="Augmenter" className="w-10 h-10 rounded-[14px] bg-accent flex items-center justify-center text-white active:scale-95 transition-all">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      if ((cart.find(i => i.product.id === selectedItem.id)?.quantity || 0) === 0) {
                        handleAddToCart(e as any, selectedItem);
                      }
                      setSelectedItem(null);
                      if (!isCartOpen) setIsCartOpen(true);
                    }}
                    className="w-full py-5 rounded-[24px] bg-accent text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-accent/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {(cart.find(i => i.product.id === selectedItem.id)?.quantity || 0) === 0 ? 'Ajouter à ma commande' : 'Voir ma commande'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserRestaurants;
