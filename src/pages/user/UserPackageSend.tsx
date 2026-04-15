import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, Send, MapPin, Loader2, Navigation, X, Truck, Clock, Sparkles, User, Phone, FileText, Weight, CheckCircle2, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import LocationSearchInput from '@/components/LocationSearchInput';
import { useAuthStore } from '@/store/authStore';

const UserPackageSend = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const packageType = searchParams.get('type') || 'standard';
  const isCollection = packageType === 'collection';
  const isExpress = packageType === 'express';

  const [step, setStep] = useState<'form' | 'matchmaking'>('form');
  const [matchState, setMatchState] = useState<'searching' | 'found'>('searching');
  const [searchLog, setSearchLog] = useState<string>(isCollection ? 'Analyse des routes logistiques Wego...' : 'Recherche de coursiers...');

  const { profile } = useAuthStore();
  const [form, setForm] = useState({
    senderName: profile?.name || '',
    senderPhone: profile?.phone || '',
    receiverName: '',
    receiverPhone: '',
    pickupAddress: '',
    deliveryAddress: '',
    description: '',
    weight: '0.5',
    category: packageType,
  });

  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        senderName: profile.name,
        senderPhone: profile.phone
      }));
    }
  }, [profile]);
  const [loading, setLoading] = useState(false);

  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);

  const pickupRef = useRef<HTMLDivElement>(null);
  const deliveryRef = useRef<HTMLDivElement>(null);
  const receiverNameRef = useRef<HTMLInputElement>(null);
  const receiverPhoneRef = useRef<HTMLInputElement>(null);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSend = async () => {
    // Validation with auto-scroll
    if (!form.pickupAddress) {
      pickupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error("L'adresse d'enlèvement est obligatoire");
      return;
    }
    if (!form.deliveryAddress) {
      deliveryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error("L'adresse de livraison est obligatoire");
      return;
    }

    if (isCollection) {
      setStep('matchmaking');
      setMatchState('searching');
      setSearchLog("Analyse des flux logistiques B2B en temps réel...");
      
      setTimeout(() => setSearchLog("Flux détecté : 3 fourgons Wego sur l'axe VDN/Plateau..."), 1500);
      setTimeout(() => setSearchLog("Calcul d'optimisation : Sélection du trajet le plus éco-responsable..."), 3000);
      setTimeout(() => setMatchState('found'), 5000);
    } else {
      if (!form.receiverName) {
        receiverNameRef.current?.focus();
        receiverNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast.error("Le nom du destinataire est obligatoire");
        return;
      }
      if (!form.receiverPhone) {
        receiverPhoneRef.current?.focus();
        receiverPhoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast.error("Le téléphone du destinataire est obligatoire");
        return;
      }

      setLoading(true);
      await new Promise(r => setTimeout(r, 1200));
      const trackingNumber = `WG-${Date.now().toString().slice(-8)}`;
      const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();
      setLoading(false);
      toast.success(t('user.package.success', { trackingNumber }));
      navigate('/user/package-tracking', {
        state: { 
          package: { 
            id: trackingNumber, 
            ...form, 
            status: 'accepted', 
            _type: 'package', 
            date: new Date().toISOString(),
            pickupCoords,
            destCoords: destinationCoords,
            pickupPin
          } 
        }
      });
    }
  };

  const confirmCollection = () => {
    const trackingNumber = `WG-COL-${Date.now().toString().slice(-6)}`;
    toast.success(`Collecte groupée confirmée : ${trackingNumber}`);
    navigate('/user/package-tracking', { 
       state: { package: { id: trackingNumber, ...form, status: 'accepted', _type: 'package', date: new Date().toISOString() } } 
    });
  };

  const getTitle = () => {
    if (isCollection) return t('user.package.titleCollection');
    if (isExpress) return t('user.package.titleExpress');
    return t('user.package.titleStandard');
  };

  const getDescription = () => {
    if (isCollection) return t('user.package.descCollection');
    if (isExpress) return t('user.package.descExpress');
    return t('user.package.descStandard');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-foreground flex flex-col relative overflow-x-hidden">
      <div className="absolute top-0 inset-x-0 h-[60%] bg-gradient-to-b from-accent/20 via-accent/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-accent/20 blur-[120px] rounded-full" />
      <div className="absolute top-[20%] right-[-100px] w-80 h-80 bg-accent2/10 blur-[120px] rounded-full" />

      <header className="px-6 pt-12 pb-6 relative z-30">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 rounded-2xl glass-strong flex items-center justify-center active:scale-90 transition-all border border-white/10 shadow-xl"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-1 bg-accent/10 px-3 py-1 rounded-full border border-accent/20 border-glow">
                <Sparkles className="w-3 h-3 text-accent animate-pulse" />
                <span className="text-[10px] font-black text-accent uppercase tracking-widest italic">Wego Select</span>
             </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none italic uppercase">
            {getTitle()}
          </h1>
          <p className="text-sm font-bold text-white/40 max-w-[280px] leading-relaxed pt-2">
            {getDescription()}
          </p>
        </motion.div>
      </header>

      <div className="flex-1 relative z-20 px-6 overflow-y-auto no-scrollbar pb-32">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(230,32,87,1)]" />
                   <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">{t('user.package.pickupAddress')}</h2>
                </div>
                
                <div className="glass-strong rounded-[28px] p-3 border border-white/10 shadow-2xl relative group overflow-visible z-50">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                  
                  <div ref={pickupRef}>
                    <LocationSearchInput
                      value={form.pickupAddress}
                      onChange={val => update('pickupAddress', val)}
                      onSelect={(name, coords) => {
                        update('pickupAddress', name);
                        if (coords) setPickupCoords(coords);
                      }}
                      placeholder={t('user.package.pickupAddress')}
                      showCurrentLocation={true}
                      className="mb-1"
                    />
                  </div>
                  
                  <div className="flex justify-center -my-2 opacity-30">
                    <div className="h-4 w-px bg-accent/40" />
                  </div>

                  <div ref={deliveryRef}>
                    <LocationSearchInput
                      value={form.deliveryAddress}
                      onChange={val => update('deliveryAddress', val)}
                      onSelect={(name, coords) => {
                        update('deliveryAddress', name);
                        if (coords) setDestinationCoords(coords);
                      }}
                      placeholder={t('user.package.deliveryAddress')}
                      suggestionsPosition="bottom"
                    />
                  </div>
                </div>
              </div>

              {!isCollection && (
                <div className="space-y-4">
                   <div className="flex items-center gap-3 px-2">
                     <div className="w-2 h-2 rounded-full bg-accent2 shadow-[0_0_10px_rgba(30,192,255,1)]" />
                     <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Clients</h2>
                  </div>
                  
                  <div className="glass rounded-[32px] p-2 border border-white/5 space-y-1 mt-2">
                    <div className="grid grid-cols-1 gap-1">
                       {/* Sender Info (Auto-populated/Hidden as requested by user or shown as read-only) */}
                       <div className="bg-emerald-500/5 rounded-t-[28px] p-4 flex items-center gap-4 border border-emerald-500/20">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <div className="flex-1">
                             <p className="text-[8px] font-black text-emerald-500 uppercase mb-1">Expéditeur (Vous)</p>
                             <p className="text-sm font-black text-white">{form.senderName || 'Chargement...'}</p>
                             <p className="text-[10px] font-bold text-white/40">{form.senderPhone}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                             <Shield className="w-4 h-4 text-emerald-500" />
                          </div>
                       </div>

                       <div className="bg-white/5 p-4 flex items-center gap-4 border-t border-white/10 mt-1">
                          <User className="w-5 h-5 text-accent" />
                          <div className="flex-1">
                             <p className="text-[8px] font-black text-accent uppercase mb-1">{t('user.package.receiverName')}</p>
                             <input ref={receiverNameRef} type="text" value={form.receiverName} onChange={e => update('receiverName', e.target.value)} placeholder="Nom Destinataire" className="bg-transparent border-none p-0 w-full text-white font-bold text-sm focus:ring-0 placeholder:text-white/20" />
                          </div>
                       </div>
                       <div className="bg-white/5 rounded-b-[28px] p-4 flex items-center gap-4 border-t border-white/5">
                          <Phone className="w-5 h-5 text-accent" />
                          <div className="flex-1">
                             <p className="text-[8px] font-black text-accent uppercase mb-1">{t('user.package.receiverPhone')}</p>
                             <input ref={receiverPhoneRef} type="tel" value={form.receiverPhone} onChange={e => update('receiverPhone', e.target.value)} placeholder="+221 ..." className="bg-transparent border-none p-0 w-full text-white font-bold text-sm focus:ring-0 placeholder:text-white/20" />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                   <Package className="w-4 h-4 text-accent/60" />
                   <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">{t('user.package.description')}</h2>
                </div>

                <div className="glass rounded-[28px] p-4 border border-white/5 shadow-xl space-y-4">
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Description du colis" title="Description du colis" aria-label="Description du colis" rows={2} className="w-full bg-black/40 border border-white/5 rounded-2xl p-3 text-white font-medium text-sm focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all resize-none" />
                  <div className="flex gap-2">
                     <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{t('user.package.weight')}</span>
                        </div>
                        <input type="number" value={form.weight} onChange={e => update('weight', e.target.value)} title="Poids du colis" aria-label="Poids du colis" className="bg-transparent border-none p-0 w-full text-center text-lg font-black text-white focus:ring-0" />
                     </div>
                     <div className="flex-[1.5] bg-black/40 border border-white/5 rounded-2xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{t('user.package.category')}</span>
                        </div>
                        <select value={form.category} onChange={e => update('category', e.target.value)} title="Catégorie du colis" aria-label="Catégorie du colis" className="bg-transparent border-none p-0 w-full text-white font-black text-sm focus:ring-0 lowercase">
                          <option value="standard">Standard</option>
                          <option value="express">Express ⚡</option>
                          <option value="fragile">Fragile 💎</option>
                        </select>
                     </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button onClick={handleSend} disabled={loading} className="w-full h-20 rounded-[30px] gradient-accent relative overflow-hidden group shadow-2xl active:scale-[0.98] transition-all">
                   <div className="relative z-10 flex items-center justify-center gap-4">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : (
                        <>
                           <span className="text-white font-black text-sm uppercase tracking-[0.2em]">
                              {isCollection ? t('user.package.findRoute') : t('user.package.send')}
                           </span>
                        </>
                      )}
                   </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'matchmaking' && (
            <motion.div key="match" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-8 flex flex-col items-center">
              <div className="w-full glass-strong rounded-[48px] p-10 border border-white/10 relative overflow-hidden shadow-2xl flex flex-col items-center min-h-[460px] justify-center text-center">
                 <AnimatePresence mode="wait">
                   {matchState === 'searching' ? (
                     <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-10">
                       <div className="w-32 h-32 rounded-full border-2 border-accent/30 flex items-center justify-center relative">
                          <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin" />
                          <Truck className="w-10 h-10 text-accent animate-pulse" />
                       </div>
                       <h3 className="text-2xl font-black text-white italic tracking-tight">{searchLog}</h3>
                     </motion.div>
                   ) : (
                     <motion.div key="found" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-8">
                        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
                        <h3 className="text-3xl font-black text-white italic tracking-tighter">Trajet Idéal Trouvé !</h3>
                        <button onClick={confirmCollection} className="w-full py-6 rounded-[24px] gradient-accent text-white font-black text-sm uppercase tracking-widest">Valider ma Collecte</button>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserPackageSend;
