import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, Send, MapPin, Loader2, Navigation, X, Truck, Clock, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { searchLocations, reverseGeocode, type LocationSuggestion } from '@/services/mapService';

const UserPackageSend = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const packageType = searchParams.get('type') || 'standard';

  const [step, setStep] = useState<'form' | 'matchmaking'>('form');
  const [matchState, setMatchState] = useState<'searching' | 'found'>('searching');
  const [searchLog, setSearchLog] = useState<string>('Recherche de coursiers sur votre axe...');

  const [form, setForm] = useState({
    senderName: '',
    receiverName: '',
    receiverPhone: '',
    pickupAddress: '',
    deliveryAddress: '',
    description: '',
    weight: '',
  });
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [activeField, setActiveField] = useState<'pickupAddress' | 'deliveryAddress' | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSearch = async (query: string, field: 'pickupAddress' | 'deliveryAddress') => {
    update(field, query);
    if (query.length > 2) {
      setLoadingSearch(true);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSearch(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (s: LocationSuggestion) => {
    if (activeField === 'pickupAddress') {
      update('pickupAddress', s.displayName);
      setPickupCoords([s.lat, s.lon]);
    } else {
      update('deliveryAddress', s.displayName);
      setDestinationCoords([s.lat, s.lon]);
    }
    setSuggestions([]);
    setActiveField(null);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPickupCoords(coords);
        update('pickupAddress', t('common.loading'));
        try {
          const address = await reverseGeocode(coords[0], coords[1]);
          update('pickupAddress', address);
        } catch (err) {
          update('pickupAddress', "Ubicación actual");
        }
      },
      () => toast.error("Error al obtener ubicación")
    );
  };

  const handleSend = async () => {
    if (packageType === 'collection') {
      if (!form.pickupAddress || !form.deliveryAddress) {
        toast.error("Veuillez renseigner le point de départ et d'arrivée");
        return;
      }
      setStep('matchmaking');
      setMatchState('searching');
      setSearchLog("Analyse des routes de livraisons B2B...");
      
      setTimeout(() => setSearchLog("3 fourgons de livraison détéctés sur ce secteur..."), 1200);
      setTimeout(() => setSearchLog("Optimisation : Sélection du camion pour rentabiliser le dernier espace vide (3/4 colis)..."), 2500);
      setTimeout(() => setMatchState('found'), 4000);
    } else {
      if (!form.senderName || !form.receiverName || !form.receiverPhone || !form.pickupAddress || !form.deliveryAddress) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      const trackingNumber = `WG-${Date.now().toString().slice(-8)}`;
      setLoading(false);
      toast.success(t('user.package.success', { trackingNumber }));
      navigate('/user/package-tracking');
    }
  };

  const confirmCollection = () => {
    const trackingNumber = `WG-COL-${Date.now().toString().slice(-6)}`;
    toast.success(`Collecte groupée confirmée : ${trackingNumber}`);
    navigate('/user/package-tracking', { 
       state: { package: { id: trackingNumber, ...form, status: 'accepted', _type: 'package', date: new Date().toISOString() } } 
    });
  };

  const allFields = [
    { key: 'senderName', label: t('user.package.senderName'), type: 'text' },
    { key: 'receiverName', label: t('user.package.receiverName'), type: 'text' },
    { key: 'receiverPhone', label: t('user.package.receiverPhone'), type: 'tel' },
    { key: 'pickupAddress', label: t('user.package.pickupAddress'), type: 'text' },
    { key: 'deliveryAddress', label: t('user.package.deliveryAddress'), type: 'text' },
    { key: 'description', label: t('user.package.description'), type: 'text' },
    { key: 'weight', label: t('user.package.weight'), type: 'number' },
  ];

  const fields = packageType === 'collection' 
    ? allFields.filter(f => f.key === 'pickupAddress' || f.key === 'deliveryAddress')
    : allFields;

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="flex items-center px-4 pt-4">
        <button onClick={() => navigate(-1)} className="tap-target p-2 rounded-xl hover:bg-muted" aria-label={t('common.back')}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground ml-2">{t('user.package.title')}</h1>
      </div>

      <div className="px-6 pt-6">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 relative z-10 w-full max-w-md mx-auto">
              
              <div className="text-center mb-6 pt-2">
                 <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">
                   {packageType === 'collection' ? 'Collecte Groupée' : 'Envoi Express'}
                 </h2>
                 <p className="text-[11px] text-muted-foreground font-semibold px-4 leading-relaxed">
                   {packageType === 'collection' 
                     ? "Profitez d'un fourgon Wego B2B déjà sur la route avec de l'espace libre." 
                     : "Un coursier dédié récupère et livre votre colis immédiatement."}
                 </p>
              </div>

              {/* Connected Route Input Card */}
              <div className="glass rounded-[28px] p-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] border border-white/5 relative overflow-visible bg-gradient-to-b from-white/5 to-transparent">
                 <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 bg-accent/20 blur-[50px] pointer-events-none -z-10 rounded-full" />

                 <div className="relative flex gap-4 p-4 border-b border-white/5">
                   <div className="flex flex-col items-center justify-start mt-2 relative z-10 w-4">
                     <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center border border-accent/40 shadow-[0_0_15px_rgba(230,32,87,0.4)] shrink-0">
                       <div className="w-[5px] h-[5px] rounded-full bg-accent shadow-[0_0_8px_rgba(230,32,87,1)]" />
                     </div>
                     <div className="w-[1.5px] h-16 bg-gradient-to-b from-accent/60 to-transparent absolute top-5 rounded-full" />
                   </div>
                   <div className="flex-1 relative">
                     <div className="flex justify-between items-center mb-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-accent">Point de Collecte</label>
                       <button onClick={useCurrentLocation} className="flex items-center gap-1 text-[9px] font-bold text-accent px-2 py-0.5 rounded bg-accent/10 hover:bg-accent/20 transition-colors">
                         <Navigation className="w-2.5 h-2.5" /> Position actuelle
                       </button>
                     </div>
                     <input
                       type="text"
                       placeholder="Où récupérer le colis ?"
                       value={form.pickupAddress}
                       onChange={e => handleSearch(e.target.value, 'pickupAddress')}
                       onFocus={() => setActiveField('pickupAddress')}
                       className="w-full bg-transparent text-foreground text-[13px] font-bold placeholder:text-muted-foreground/40 outline-none pb-1"
                     />
                     {form.pickupAddress && (
                       <button onClick={() => { update('pickupAddress', ''); setPickupCoords(null); setSuggestions([]); }} className="absolute right-0 bottom-1 p-1 text-muted-foreground hover:text-foreground transition-colors">
                         <X className="w-3.5 h-3.5" />
                       </button>
                     )}
                     
                     <AnimatePresence>
                       {activeField === 'pickupAddress' && (suggestions.length > 0 || loadingSearch) && (
                         <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute left-0 right-0 top-full mt-3 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[220px] z-[1000] ring-1 ring-black/50">
                           {loadingSearch ? <div className="p-5 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-accent" /></div> : suggestions.map((s, idx) => (
                             <button key={idx} onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }} className="w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 text-left active:bg-white/10">
                               <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                               <span className="text-[11px] font-bold text-foreground leading-snug">{s.displayName}</span>
                             </button>
                           ))}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 </div>

                 <div className="relative flex gap-4 p-4">
                   <div className="flex flex-col items-center justify-start mt-2 relative z-10 w-4">
                     <div className="w-4 h-4 rounded-sm bg-foreground/10 flex items-center justify-center border border-foreground/20 shrink-0">
                       <div className="w-[5px] h-[5px] rounded-sm bg-foreground/70" />
                     </div>
                   </div>
                   <div className="flex-1 relative">
                     <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Destination</label>
                     <input
                       type="text"
                       placeholder="Où l'envoyer ?"
                       value={form.deliveryAddress}
                       onChange={e => handleSearch(e.target.value, 'deliveryAddress')}
                       onFocus={() => setActiveField('deliveryAddress')}
                       className="w-full bg-transparent text-foreground text-[13px] font-bold placeholder:text-muted-foreground/40 outline-none pb-1"
                     />
                     {form.deliveryAddress && (
                       <button onClick={() => { update('deliveryAddress', ''); setDestinationCoords(null); setSuggestions([]); }} className="absolute right-0 bottom-1 p-1 text-muted-foreground hover:text-foreground transition-colors">
                         <X className="w-3.5 h-3.5" />
                       </button>
                     )}
                     
                     <AnimatePresence>
                       {activeField === 'deliveryAddress' && (suggestions.length > 0 || loadingSearch) && (
                         <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute left-0 right-0 top-full mt-3 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[220px] z-[1000] ring-1 ring-black/50">
                           {loadingSearch ? <div className="p-5 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-accent" /></div> : suggestions.map((s, idx) => (
                             <button key={idx} onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }} className="w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 text-left active:bg-white/10">
                               <MapPin className="w-4 h-4 text-foreground/50 shrink-0 mt-0.5" />
                               <span className="text-[11px] font-bold text-foreground leading-snug">{s.displayName}</span>
                             </button>
                           ))}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 </div>
              </div>

              {/* Additional fields for Standard shipment */}
              {packageType !== 'collection' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                  {allFields.filter(f => f.key !== 'pickupAddress' && f.key !== 'deliveryAddress').map((field, i) => (
                    <motion.div key={field.key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="relative">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block px-3">{field.label}</label>
                      <input
                        type={field.type}
                        value={form[field.key as keyof typeof form]}
                        onChange={e => update(field.key, e.target.value)}
                        aria-label={field.label}
                        title={field.label}
                        placeholder={field.label}
                        className="w-full py-4 px-5 rounded-[24px] bg-secondary/50 border border-white/5 text-foreground placeholder:text-muted-foreground/30 outline-none focus:ring-2 focus:ring-accent focus:bg-white/5 transition-all shadow-inner font-semibold text-[13px]"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              
              <button
                onClick={handleSend}
                disabled={loading || (packageType === 'collection' ? (!form.pickupAddress || !form.deliveryAddress) : (!form.senderName || !form.receiverName || !form.pickupAddress || !form.deliveryAddress))}
                className="w-full py-4 rounded-[24px] gradient-accent text-white font-black tap-target disabled:opacity-40 mt-8 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-[0_15px_30px_-10px_rgba(230,32,87,0.5)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : (packageType === 'collection' ? <Truck className="w-5 h-5" /> : <Send className="w-5 h-5" />)}
                {packageType === 'collection' ? 'Rechercher un fourgon disponible' : 'Confirmer l\'envoi'}
              </button>
            </motion.div>
          )}

          {step === 'matchmaking' && (
            <motion.div key="match" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-foreground">{matchState === 'searching' ? 'Analyse logistique...' : 'Collecte en cours'}</p>
                <button onClick={() => setStep('form')} className="text-xs text-accent font-medium">Modifier coordonées</button>
              </div>
              
              <AnimatePresence mode="wait">
                {matchState === 'searching' ? (
                  <motion.div
                    key="searching"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass rounded-[32px] p-8 flex flex-col items-center justify-center border border-border/40 h-[320px] relative overflow-hidden shadow-xl"
                  >
                    <div className="absolute inset-0 bg-accent/5 animate-pulse" />
                    <div className="relative mb-8 mt-4">
                      <div className="w-24 h-24 rounded-full border border-accent/20 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border border-accent/40 animate-ping opacity-50" />
                        <div className="w-16 h-16 rounded-full border border-accent/40 flex items-center justify-center bg-accent/5">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <Package className="w-5 h-5 text-accent animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground mb-3 text-center text-lg">Recherche de camions...</h3>
                    <p className="text-[11px] text-accent font-bold text-center px-4 leading-relaxed h-10 flex items-center justify-center">
                      <motion.span key={searchLog} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                        {searchLog}
                      </motion.span>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="found"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl border border-accent/30 relative overflow-hidden shadow-2xl shadow-accent/20"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="p-5 relative z-10">
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shrink-0 shadow-lg shadow-accent/40">
                            <Truck className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-extrabold text-foreground mb-1 text-base leading-tight">Fourgon Wego Express</p>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md inline-flex">
                              <span>Chauffeur Ali</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-2xl text-accent leading-none mb-1">$15</p>
                          <p className="text-[10px] text-foreground font-bold bg-white/10 px-1.5 py-0.5 rounded">ÉCONOMIE 50%</p>
                        </div>
                      </div>
                      
                      <div className="bg-secondary/40 rounded-2xl p-4 mb-5 border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Espace Libre Restant</span>
                          <span className="text-xs font-bold text-accent px-2 py-0.5 bg-accent/10 rounded-full">1 COLIS / 4</span>
                        </div>
                        <div className="flex gap-2">
                           <div className="flex-1 h-2.5 rounded-full bg-gradient-to-r from-accent to-accent/80 shadow-sm" />
                           <div className="flex-1 h-2.5 rounded-full bg-gradient-to-r from-accent to-accent/80 shadow-sm" />
                           <div className="flex-1 h-2.5 rounded-full bg-gradient-to-r from-accent to-accent/80 shadow-sm relative"><div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-widest text-accent bg-accent/10 px-1 py-0.5 rounded uppercase whitespace-nowrap">Priorité</div></div>
                           <div className="flex-1 h-2.5 rounded-full bg-black/20 dark:bg-white/10" />
                        </div>
                        <div className="flex justify-between mt-5 pt-4 border-t border-white/5 relative">
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center mb-1.5">
                              <MapPin className="w-3 h-3 text-accent" />
                            </div>
                            <span className="text-[9px] text-muted-foreground font-bold">DÉTOUR ESTIMÉ</span>
                            <span className="text-[11px] font-extrabold text-foreground">+50m max</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center mb-1.5">
                              <Navigation className="w-3 h-3 text-accent" />
                            </div>
                            <span className="text-[9px] text-muted-foreground font-bold">LIGNE DIRECTE</span>
                            <span className="text-[11px] font-extrabold text-foreground text-accent">Route 100%</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center mb-1.5">
                              <Clock className="w-3 h-3 text-accent" />
                            </div>
                            <span className="text-[9px] text-muted-foreground font-bold">COLLECTE DANS</span>
                            <span className="text-[11px] font-extrabold text-foreground">15 min</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                         onClick={confirmCollection}
                         className="w-full py-4 rounded-2xl relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 transition-transform group-hover:scale-[1.02]" />
                        <span className="relative z-10 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-2">
                           <Package className="w-5 h-5" />
                           Ajouter au fourgon de collecte
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {matchState === 'found' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 bg-accent/5 border border-accent/20 rounded-xl p-3 flex gap-3 text-[11px] text-muted-foreground leading-relaxed font-medium">
                  <Sparkles className="w-5 h-5 text-accent shrink-0" />
                  <p>
                    <strong>Mutualisation Logistique activée :</strong> Le système a favorisé un livreur effectuant la même route et ayant le coffre déjà à 3/4 rempli. Vous occupez la dernière place disponible pour optimiser l'écologie et l'économie !
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserPackageSend;
