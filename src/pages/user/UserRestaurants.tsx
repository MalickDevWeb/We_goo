import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, ShoppingBag, Filter, Star, 
  MapPin, ShoppingCart, Heart, Bell, Zap, X, ChevronRight,
  Utensils, CheckCircle2, Shield, Clock, Timer, Flame, Plus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { OrderItem, Order } from '@/types/index';

interface FoodItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  restaurant: string;
  prepTime: string;
  isHot?: boolean;
}

const MOCK_FOOD: FoodItem[] = [
  { id: 'f1', name: 'Kebab Mixte Royal', price: 4500, rating: 4.8, reviews: 342, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=400&fit=crop', category: 'Kebab', restaurant: 'Istanbul Grill', prepTime: '15-20 min', isHot: true },
  { id: 'f2', name: 'Pizza Margherita XL', price: 7500, rating: 4.9, reviews: 521, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop', category: 'Italien', restaurant: 'Mama Pizza', prepTime: '20-30 min' },
  { id: 'f3', name: 'Tacos 3 Viandes', price: 3500, rating: 4.7, reviews: 890, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop', category: 'Mexicain', restaurant: 'O\'Tacos Dakar', prepTime: '10-15 min', isHot: true },
  { id: 'f4', name: 'Sushi Party Box', price: 18000, rating: 5.0, reviews: 124, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=400&fit=crop', category: 'Asiatique', restaurant: 'Wasabi Zen', prepTime: '25-35 min' },
  { id: 'f5', name: 'Butter Chicken', price: 6500, rating: 4.8, reviews: 215, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=400&fit=crop', category: 'Indien', restaurant: 'Le Taj Mahal', prepTime: '20-30 min', isHot: true },
  { id: 'f6', name: 'Burger Wego Supreme', price: 5500, rating: 4.9, reviews: 456, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop', category: 'Burger', restaurant: 'Dakar Burgers', prepTime: '15-20 min', isHot: true },
  { id: 'f7', name: 'Lasagnes Maison', price: 5800, rating: 4.6, reviews: 98, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', category: 'Italien', restaurant: 'La Trattoria', prepTime: '25-35 min' },
  { id: 'f8', name: 'Burrito Beef & Guac', price: 4200, rating: 4.7, reviews: 167, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop', category: 'Mexicain', restaurant: 'MexiGo', prepTime: '15-20 min' },
];

const CATEGORIES = [
  { id: 'all', name: 'Tous', image: '/images/products/all_food_banner.png' },
  { id: 'burger', name: 'Burger', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop' },
  { id: 'pizza', name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop' },
  { id: 'asiatique', name: 'Asiatique', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=400&fit=crop' },
  { id: 'indien', name: 'Indien', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop' },
  { id: 'kebab', name: 'Kebab', image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&h=400&fit=crop' },
  { id: 'italien', name: 'Italien', image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&h=400&fit=crop' },
  { id: 'mexicain', name: 'Mexicain', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop' },
];

const UserRestaurants = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, setProfile, session } = useAuthStore();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'all';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory.toLowerCase());
  
  // Cart & Checkout State
  const [cart, setCart] = useState<{product: FoodItem, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'address' | 'payment' | 'processing' | 'success'>('idle');
  const [deliveryAddress, setDeliveryAddress] = useState('Sacré-Cœur 3, Dakar, Sénégal');

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0), [cart]);

  // Sync state if URL changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat.toLowerCase());
  }, [location.search]);

  const filteredProducts = useMemo(() => {
    return MOCK_FOOD.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.restaurant.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  const handleAddToCart = (e: React.MouseEvent, p: FoodItem) => {
    e.stopPropagation();
    setCart(prev => {
      const existing = prev.find(item => item.product.id === p.id);
      if (existing) {
        return prev.map(item => item.product.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product: p, quantity: 1 }];
    });
    toast.success(`${p.name} ajouté au panier`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleCheckout = async () => {
    if (!session || !profile) return;
    
    if (checkoutStep === 'address') {
      setCheckoutStep('payment');
      return;
    }

    if (checkoutStep === 'payment') {
      if (profile.walletBalance < cartTotal) {
        toast.error("Solde insuffisant dans votre portefeuille Wego.");
        return;
      }

      setCheckoutStep('processing');
      await new Promise(r => setTimeout(r, 2000)); // Simulate processing

      try {
        const newBalance = profile.walletBalance - cartTotal;
        
        // 1. Create Transaction
        await api.createTransaction({
          userId: session.id,
          type: 'debit',
          title: `Restau - ${cart[0].product.restaurant}`,
          amount: cartTotal,
          date: new Date().toISOString().split('T')[0],
          balance: newBalance
        });

        // 2. Create Order
        const orderItems: OrderItem[] = cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.image
        }));

        await api.createOrder({
          userId: session.id,
          items: orderItems,
          totalAmount: cartTotal,
          status: 'preparing',
          date: new Date().toISOString(),
          address: deliveryAddress,
          category: 'Restaurants'
        });

        // 3. Update User Balance
        if (profile.userType === 'user') {
          const updatedUser = await api.updateUser(session.id, { 
            walletBalance: newBalance,
            totalSpent: (profile.totalSpent || 0) + cartTotal
          });
          setProfile(updatedUser);
        }

        setCheckoutStep('success');
        setCart([]);
        toast.success("Commande passée ! Le chef prépare votre repas.");
      } catch (err) {
        console.error("Restaurant Payment Error:", err);
        toast.error("Une erreur est survenue lors du paiement.");
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
          <button onClick={() => navigate('/services')} aria-label="Retour" className="w-10 h-10 rounded-2xl glass flex items-center justify-center active:scale-90 transition-all"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Restau</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">Wego Food</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/user/notifications')} aria-label="Notifications" className="w-10 h-10 rounded-2xl glass flex items-center justify-center relative active:scale-90 transition-all">
            <Bell className="w-5 h-5 text-white/70" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
          </button>
          <button onClick={() => setIsCartOpen(true)} className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center relative shadow-lg shadow-accent/30 active:scale-95 transition-all">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-white text-accent text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </motion.span>
            )}
          </button>
        </div>
      </header>

      <div className="px-6 space-y-6 flex-1 pb-32">
        {/* Search Bar */}
        <div className="relative glass rounded-[24px] flex items-center px-5 py-4 border border-white/5 focus-within:border-accent/40 transition-all">
          <Search className="w-5 h-5 text-white/30 mr-3" />
          <input type="text" placeholder="Restau, Burger, Sushi..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent flex-1 outline-none text-sm font-semibold placeholder:text-white/20" />
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Catégories</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 -mx-6 px-6">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name.toLowerCase() || (cat.id === 'all' && selectedCategory === 'all');
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === 'all' ? 'all' : cat.name.toLowerCase())}
                  className="flex flex-col items-center gap-2 shrink-0"
                >
                  <div className={`w-20 h-20 rounded-[28px] overflow-hidden border transition-all duration-300 relative ${
                    isSelected ? 'border-accent shadow-lg shadow-accent/20 scale-105' : 'border-white/5 opacity-60'
                  }`}>
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    {isSelected && <div className="absolute inset-0 bg-accent/20 flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-lg"><CheckCircle2 className="w-3 h-3 text-white" /></div></div>}
                  </div>
                  <span className={`text-[11px] font-black tracking-tight ${isSelected ? 'text-white' : 'text-white/30'}`}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Découvrir</h2>
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p, idx) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="glass rounded-[28px] overflow-hidden border border-white/5 group active:scale-[0.98] transition-all">
                  <div className="relative h-[160px] overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {p.isHot && (
                      <div className="absolute top-3 left-3 bg-red-500/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                        <Flame className="w-3 h-3 text-white fill-white" />
                        <span className="text-[9px] font-black text-white uppercase">Chaud</span>
                      </div>
                    )}
                    <button aria-label="Ajouter aux favoris" title="Ajouter aux favoris" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60"><Heart className="w-4 h-4" /></button>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /><span className="text-[10px] font-bold text-white/60">{p.rating}</span></div>
                      <div className="flex items-center gap-1"><Timer className="w-3 h-3 text-white/40" /><span className="text-[9px] font-bold text-white/40">{p.prepTime}</span></div>
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">{p.name}</h3>
                    <p className="text-[9px] font-black text-accent uppercase tracking-widest">{p.restaurant}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-black text-white">{p.price.toLocaleString()} CFA</span>
                      <button onClick={(e) => handleAddToCart(e, p)} aria-label="Ajouter au panier" title="Ajouter au panier" className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white active:scale-90 transition-all"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Cart Drawer & Checkout */}
      <AnimatePresence>
        {(isCartOpen || checkoutStep !== 'idle') && (
          <div className="fixed inset-0 z-[200] flex flex-col justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { if (checkoutStep === 'idle') setIsCartOpen(false); }} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="relative w-full bg-[#0F0F11] border-t border-white/10 rounded-t-[40px] px-6 pt-10 pb-12 shadow-2xl">
              {checkoutStep === 'idle' ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setIsCartOpen(false)} aria-label="Retour" title="Retour" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-95 transition-all"><ArrowLeft className="w-5 h-5"/></button>
                    <h2 className="text-2xl font-black text-white">Ma Commande</h2>
                  </div>
                  <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2 no-scrollbar">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/5">
                        <img src={item.product.image} alt={item.product.name} title={item.product.name} className="w-16 h-16 rounded-2xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{item.product.name}</p>
                          <p className="text-[10px] text-accent font-bold mb-2">{item.product.restaurant}</p>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQuantity(item.product.id, -1)} aria-label="Réduire" title="Réduire" className="w-6 h-6 rounded-lg bg-white/5 text-white">-</button>
                            <span className="text-xs font-black text-white">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, 1)} aria-label="Augmenter" title="Augmenter" className="w-6 h-6 rounded-lg bg-white/5 text-white">+</button>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-white">{(item.product.price * item.quantity).toLocaleString()} CFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-bold text-white/40">Sous-total</span>
                    <span className="text-2xl font-black text-white">{cartTotal.toLocaleString()} CFA</span>
                  </div>
                  <button onClick={() => setCheckoutStep('address')} disabled={cart.length === 0} className="w-full py-5 rounded-3xl bg-accent text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-accent/20 disabled:opacity-40">Commander maintenant</button>
                </div>
              ) : checkoutStep === 'address' ? (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-4"><button onClick={() => setCheckoutStep('idle')} aria-label="Retour" title="Retour" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5"/></button><h2 className="text-2xl font-black text-white">Livraison</h2></div>
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent">Adresse de réception</p>
                    <input type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} aria-label="Adresse" title="Adresse" placeholder="Adresse" className="w-full bg-transparent text-lg font-bold text-white outline-none border-b border-white/10 pb-2 focus:border-accent" />
                  </div>
                  <button onClick={() => setCheckoutStep('payment')} aria-label="Payer maintenant" className="w-full py-5 rounded-3xl bg-white text-black font-black uppercase tracking-[0.2em] text-xs">Suivant</button>
                </div>
              ) : checkoutStep === 'payment' || checkoutStep === 'processing' ? (
                <div className="space-y-10 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-4"><button onClick={() => setCheckoutStep('address')} aria-label="Retour" title="Retour" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5"/></button><h2 className="text-2xl font-black text-white">Paiement</h2></div>
                  <div className="glass rounded-[32px] p-6 border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">Wego Wallet Balance</p>
                    <p className="text-3xl font-black text-white">{(profile?.walletBalance || 0).toLocaleString()} CFA</p>
                  </div>
                  <button onClick={handleCheckout} disabled={checkoutStep === 'processing'} aria-label="Confirmer le paiement" className="w-full py-5 rounded-3xl bg-accent text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-accent/40">
                    {checkoutStep === 'processing' ? 'Paiement sécurisé...' : `Confirmer le repas (${cartTotal.toLocaleString()} CFA)`}
                  </button>
                </div>
              ) : (
                <div className="py-10 text-center space-y-8 animate-in zoom-in-95">
                  <div className="w-20 h-20 rounded-full bg-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20"><CheckCircle2 className="w-10 h-10 text-white" /></div>
                  <h2 className="text-3xl font-black text-white leading-tight">Bon appétit !</h2>
                  <p className="text-sm text-white/40 px-10">Le restaurant prépare votre repas. Un livreur Wego est en route.</p>
                  <button onClick={() => navigate('/user/history')} className="w-full py-5 rounded-3xl bg-white text-black font-black uppercase text-xs">Suivre la livraison</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserRestaurants;
