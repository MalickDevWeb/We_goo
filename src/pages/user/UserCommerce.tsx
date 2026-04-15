import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, ShoppingBag, Filter, Star, 
  MapPin, ShoppingCart, Heart, Bell, Zap, X, ChevronRight,
  Utensils, Shirt, Smartphone, Home, Sparkles, Footprints, Gamepad2, Box,
  CheckCircle2, Shield
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { OrderItem, Order } from '@/types/index';
import LocationSearchInput from '@/components/LocationSearchInput';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  seller: string;
  isPopular?: boolean;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Pack Fruits Exotiques', price: 15000, rating: 4.8, reviews: 124, image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop', category: 'Aliment.', seller: 'Dakar Market' },
  { id: '2', name: 'Sneakers Wego Limited', price: 45000, rating: 4.9, reviews: 89, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', category: 'Vêtements', seller: 'Street Wear SN', isPopular: true },
  { id: '3', name: 'iPhone 15 Pro Max', price: 850000, rating: 5.0, reviews: 245, image: '/images/products/iphone_15_pro.png', category: 'Electronique', seller: 'iStore Dakar' },
  { id: '4', name: 'Fauteuil Design Nordique', price: 120000, rating: 4.7, reviews: 56, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop', category: 'Maison', seller: 'Home Design' },
  { id: '5', name: 'Kit Beauté Organique', price: 12500, rating: 4.6, reviews: 78, image: '/images/products/beauty_kit.png', category: 'Beauté', seller: 'Bio Beauty' },
  { id: '6', name: 'Ballon de Foot Pro', price: 8500, rating: 4.5, reviews: 112, image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop', category: 'Sport', seller: 'Wego Sport' },
  { id: '7', name: 'Casque Gaming Sans Fil', price: 35000, rating: 4.8, reviews: 92, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', category: 'Electronique', seller: 'Tech Store', isPopular: true },
  { id: '8', name: 'T-shirt Coton Bio', price: 7500, rating: 4.4, reviews: 45, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', category: 'Vêtements', seller: 'Eco Wear' },
];

const CATEGORIES = [
  { id: 'all', name: 'Tous', icon: Sparkles },
  { id: 'aliment', name: 'Aliment.', icon: Utensils },
  { id: 'vetements', name: 'Vêtements', icon: Shirt },
  { id: 'electronique', name: 'Electronique', icon: Smartphone },
  { id: 'maison', name: 'Maison', icon: Home },
  { id: 'beaute', name: 'Beauté', icon: Sparkles },
  { id: 'sport', name: 'Sport', icon: Footprints },
  { id: 'jouets', name: 'Jouets', icon: Gamepad2 },
  { id: 'autre', name: 'Autre', icon: Box },
];

const UserCommerce = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, setProfile, session } = useAuthStore();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'all';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory.toLowerCase());
  
  // Cart & Checkout State
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'address' | 'payment' | 'processing' | 'success'>('idle');
  const [deliveryAddress, setDeliveryAddress] = useState('Plateau, Dakar, Sénégal');

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0), [cart]);

  // Sync state if URL changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat.toLowerCase());
  }, [location.search]);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'all' || p.category.toLowerCase().includes(selectedCategory);
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
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
          title: `Achat Mall - ${cart[0].product.name}${cart.length > 1 ? '...' : ''}`,
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
          category: cart[0].product.category
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
        toast.success("Commande effectuée avec succès !");
      } catch (err) {
        console.error("Commerce Payment Error:", err);
        toast.error("Une erreur est survenue lors du paiement.");
        setCheckoutStep('payment');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-foreground flex flex-col safe-top safe-bottom overflow-x-hidden">
      {/* Background Decorative Halos */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent2/10 blur-[100px] rounded-full -z-10" />

      {/* ── Fixed Top Section ── */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl safe-top landscape:bg-[#0A0A0B]/95">
        {/* Header */}
        <header className="px-6 py-4 landscape:py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/services')} 
              className="w-10 h-10 landscape:w-8 landscape:h-8 rounded-2xl glass flex items-center justify-center hover:bg-white/5 active:scale-90 transition-all"
              aria-label="Retour"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5 landscape:w-4 landscape:h-4" />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight landscape:text-lg">Commerce</h1>
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">Wego Mall</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/user/notifications')}
              aria-label="Notifications" 
              title="Notifications"
              className="w-10 h-10 landscape:w-8 landscape:h-8 rounded-2xl glass flex items-center justify-center relative active:scale-90 transition-all"
            >
              <Bell className="w-5 h-5 landscape:w-4 landscape:h-4 text-white/70" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              aria-label="Panier" 
              title="Panier"
              className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center relative shadow-lg shadow-accent/30 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-white text-accent text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </header>

        {/* Search Bar */}
        <div className="px-6 pb-4 landscape:pb-2">
          <div className="relative group">
            <div className="absolute inset-0 bg-accent/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative glass rounded-[24px] flex items-center px-5 py-4 landscape:py-2 border border-white/5 focus-within:border-accent/40 transition-all">
              <Search className="w-5 h-5 portrait:block hidden text-white/30 mr-3 group-focus-within:text-accent transition-colors" />
              <input 
                type="text"
                placeholder="Rechercher un produit, une boutique..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent flex-1 outline-none text-sm font-semibold placeholder:text-white/20"
              />
              {search && (
                <button aria-label="Effacer la recherche" onClick={() => setSearch('')} className="p-1 text-white/30 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="w-[1px] h-6 bg-white/10 mx-3" />
              <button aria-label="Filtrer" className="p-1 text-white/50 hover:text-white">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-6 pt-[180px] pb-32">

        {/* Categories Grid/Scroll */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Catégories</h2>
            <button className="text-[10px] font-black text-accent flex items-center gap-1 uppercase tracking-widest">
              Voir tout <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 -mx-6 px-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name.toLowerCase() || (cat.id === 'all' && selectedCategory === 'all');
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === 'all' ? 'all' : cat.name.toLowerCase())}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center border transition-all duration-300 ${
                    isSelected 
                      ? 'bg-accent border-accent shadow-[0_8px_20px_-5px_rgba(230,32,87,0.5)] rotate-[2deg] scale-105' 
                      : 'bg-[#151516] border-white/5 group-hover:border-white/20'
                  }`}>
                    <Icon className={`w-6 h-6 transition-all ${isSelected ? 'text-white scale-110' : 'text-white/40 group-hover:text-white/70'}`} />
                  </div>
                  <span className={`text-[11px] font-black tracking-tight transition-colors ${isSelected ? 'text-white' : 'text-white/30'}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Popular Section */}
        {selectedCategory === 'all' && !search && (
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Coups de cœur 🔥</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
              {MOCK_PRODUCTS.filter(p => p.isPopular).map(p => (
                <motion.div 
                  key={`hero-${p.id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative shrink-0 w-[240px] h-[160px] rounded-[32px] overflow-hidden group border border-white/5"
                >
                  <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-black text-white truncate mb-1">{p.name}</p>
                    <p className="text-[10px] font-black text-accent bg-accent/20 px-2 py-0.5 rounded-full inline-block">Populaire</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/40">
            {selectedCategory === 'all' ? 'Explorer' : `Articles ${selectedCategory}`}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p, idx) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass rounded-[28px] overflow-hidden border border-white/5 group active:scale-[0.98] transition-all"
                >
                  <div className="relative h-[160px] overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 right-3">
                      <button aria-label="Favoris" title="Favoris" className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-bold text-white/60">{p.rating}</span>
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">{p.name}</h3>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-black text-white">{p.price.toLocaleString()} CFA</span>
                      <button 
                        onClick={(e) => handleAddToCart(e, p)}
                        aria-label="Ajouter au panier"
                        title="Ajouter au panier"
                        className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white active:scale-90 transition-all"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center opacity-40">Aucun produit trouvé</div>
          )}
        </div>
      </div>

      {/* ── Cart Drawer & Checkout Flow ── */}
      <AnimatePresence>
        {(isCartOpen || checkoutStep !== 'idle') && (
          <div className="fixed inset-0 z-[200] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (checkoutStep === 'idle') setIsCartOpen(false); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full bg-[#0F0F11] border-t border-white/10 rounded-t-[40px] px-6 pt-10 pb-12 max-h-[90vh] overflow-y-auto"
            >
              {checkoutStep === 'idle' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-white">Mon Panier</h2>
                    <button onClick={() => setIsCartOpen(false)} aria-label="Fermer" title="Fermer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/5">
                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-2xl object-cover" />
                        <div className="flex-1 flex flex-col justify-between">
                          <p className="text-sm font-bold text-white leading-tight">{item.product.name}</p>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQuantity(item.product.id, -1)} aria-label="Réduire" title="Réduire" className="w-6 h-6 rounded-lg bg-white/5 text-white">-</button>
                            <span className="text-xs font-black text-white">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, 1)} aria-label="Augmenter" title="Augmenter" className="w-6 h-6 rounded-lg bg-white/5 text-white">+</button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-accent">{item.product.price.toLocaleString()} CFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-white/40">Total</span>
                    <span className="text-2xl font-black text-white">{cartTotal.toLocaleString()} CFA</span>
                  </div>
                  <button onClick={() => setCheckoutStep('address')} disabled={cart.length === 0} className="w-full py-5 rounded-3xl bg-accent text-white font-black uppercase tracking-widest text-xs disabled:opacity-40">Valider la commande</button>
                </div>
              ) : checkoutStep === 'address' ? (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setCheckoutStep('idle')} aria-label="Retour" title="Retour" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5"/></button>
                    <h2 className="text-2xl font-black text-white">Livraison</h2>
                  </div>
                  <div className="space-y-6">
                    <LocationSearchInput
                      label="Adresse de réception"
                      value={deliveryAddress}
                      onChange={setDeliveryAddress}
                      onSelect={(displayName) => setDeliveryAddress(displayName)}
                      placeholder="Où livrer ?"
                      showCurrentLocation={true}
                    />
                  </div>
                  <button onClick={() => setCheckoutStep('payment')} className="w-full py-5 rounded-3xl bg-white text-black font-black uppercase tracking-widest text-xs">Suivant</button>
                </div>
              ) : checkoutStep === 'payment' || checkoutStep === 'processing' ? (
                <div className="space-y-10 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setCheckoutStep('address')} aria-label="Retour" title="Retour" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5"/></button>
                    <h2 className="text-2xl font-black text-white">Paiement</h2>
                  </div>
                  <div className="glass rounded-[32px] p-6 border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">Wego Wallet Balance</p>
                    <p className="text-3xl font-black text-white">{(profile?.walletBalance || 0).toLocaleString()} CFA</p>
                  </div>
                  <button onClick={handleCheckout} disabled={checkoutStep === 'processing'} className="w-full py-5 rounded-3xl bg-accent text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-accent/20">
                    {checkoutStep === 'processing' ? 'Traitement...' : `Payer ${cartTotal.toLocaleString()} CFA`}
                  </button>
                </div>
              ) : (
                <div className="py-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 rounded-full bg-emerald-500 fill-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-white">Succès !</h2>
                  <p className="text-sm text-white/40 px-10">Votre commande est enregistrée.</p>
                  <button onClick={() => navigate('/user/history')} className="w-full py-5 rounded-3xl bg-white text-black font-black uppercase text-xs">Voir l'historique</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserCommerce;
