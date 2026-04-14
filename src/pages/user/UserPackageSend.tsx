import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, Send, MapPin, Loader2, Navigation, X, Truck, Clock, Sparkles, User, Phone, FileText, Weight, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import LocationSearchInput from '@/components/LocationSearchInput';

const UserPackageSend = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const packageType = searchParams.get('type') || 'standard';
  const isCollection = packageType === 'collection';

  const [step, setStep] = useState<'form' | 'matchmaking'>('form');
  const [matchState, setMatchState] = useState<'searching' | 'found'>('searching');
  const [searchLog, setSearchLog] = useState<string>(isCollection ? 'Analyse des routes logistiques Wego...' : 'Recherche de coursiers...');

  const [form, setForm] = useState({
    senderName: '',
    senderPhone: '',
    receiverName: '',
    receiverPhone: '',
    pickupAddress: '',
    deliveryAddress: '',
    description: '',
    weight: '0.5',
    category: 'standard',
  });
  const [loading, setLoading] = useState(false);

  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSend = async () => {
    console.log("handleSend triggered", { isCollection, pickup: form.pickupAddress, delivery: form.deliveryAddress });
    if (isCollection) {
      if (!form.pickupAddress || !form.deliveryAddress) {
        toast.error("Veuillez remplir les adresses de collecte et destination");
        return;
      }
      setStep('matchmaking');
      setMatchState('searching');
      setSearchLog("Analyse des flux logistiques B2B en temps réel...");
      
      setTimeout(() => setSearchLog("Flux détecté : 3 fourgons Wego sur l'axe VDN/Plateau..."), 1500);
      setTimeout(() => setSearchLog("Calcul d'optimisation : Sélection du trajet le plus éco-responsable..."), 3000);
      setTimeout(() => setMatchState('found'), 5000);
    } else {
      if (!form.senderName || !form.senderPhone || !form.receiverName || !form.receiverPhone || !form.pickupAddress || !form.deliveryAddress) {
        toast.error("Veuillez remplir tous les champs obligatoires");
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

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-foreground flex flex-col relative overflow-hidden">
      {/* ── Background Atmosphere ── */}
      <div className="absolute top-0 inset-x-0 h-[60%] bg-gradient-to-b from-accent/20 via-accent/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-accent/20 blur-[120px] rounded-full" />
      <div className="absolute top-[20%] right-[-100px] w-80 h-80 bg-accent2/10 blur-[120px] rounded-full" />

      {/* ── Header ── */}
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

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none italic">
            {isCollection ? 'Collecte' : 'Envoi'}
            <span className="block text-accent not-italic">{isCollection ? 'Groupée' : 'Express'}</span>
          </h1>
          <p className="text-sm font-bold text-white/40 max-w-[280px] leading-relaxed pt-2">
            {isCollection 
              ? "Rejoignez un trajet existant pour une livraison économique et écologique." 
              : "Un coursier dédié s'occupe de votre colis instantanément."}
          </p>
        </motion.div>
      </header>

      {/* ── Main Content ── */}
      <div className="flex-1 relative z-20 px-6 overflow-y-auto no-scrollbar pb-32">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-8"
            >
              {/* ── Address Section ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(230,32,87,1)]" />
                   <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Point de contact</h2>
                </div>
                
                <div className="glass-strong rounded-[40px] p-6 border border-white/10 shadow-2xl space-y-4 relative overflow-hidden group">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                  
                  <LocationSearchInput
                    value={form.pickupAddress}
                    onChange={val => update('pickupAddress', val)}
                    onSelect={(name, coords) => {
                      update('pickupAddress', name);
                      if (coords) setPickupCoords(coords);
                    }}
                    placeholder={isCollection ? "Lieu de ramassage flexible" : "Où récupérer le colis ?"}
                    label={isCollection ? "Ramassage (B2B Hub)" : "Enlèvement"}
                    showCurrentLocation={true}
                  />
                  
                  <div className="flex justify-center py-1">
                    <div className="h-10 w-px bg-gradient-to-b from-accent/40 via-accent/10 to-transparent" />
                  </div>

                  <LocationSearchInput
                    value={form.deliveryAddress}
                    onChange={val => update('deliveryAddress', val)}
                    onSelect={(name, coords) => {
                      update('deliveryAddress', name);
                      if (coords) setDestinationCoords(coords);
                    }}
                    placeholder="Destination finale"
                    label="Livraison"
                  />
                </div>
              </div>

              {!isCollection && (
                <div className="space-y-4">
                   <div className="flex items-center gap-3 px-2">
                     <div className="w-2 h-2 rounded-full bg-accent2 shadow-[0_0_10px_rgba(30,192,255,1)]" />
                     <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Informations Clients</h2>
                  </div>
                  
                  <div className="glass rounded-[32px] p-2 border border-white/5 space-y-1">
                    <div className="grid grid-cols-1 gap-1">
                       <div className="bg-white/5 rounded-t-[28px] p-4 flex items-center gap-4 group focus-within:bg-white/10 transition-colors">
                          <User className="w-5 h-5 text-accent2 group-focus-within:scale-110 transition-transform" />
                          <div className="flex-1">
                             <p className="text-[8px] font-black text-accent2 uppercase mb-1">Expéditeur</p>
                             <input 
                               type="text" value={form.senderName} onChange={e => update('senderName', e.target.value)}
                               placeholder="Nom complet" className="bg-transparent border-none p-0 w-full text-white font-bold text-sm focus:ring-0 placeholder:text-white/20"
                             />
                          </div>
                       </div>
                       <div className="bg-white/5 rounded-b-[28px] p-4 flex items-center gap-4 group focus-within:bg-white/10 transition-colors">
                          <User className="w-5 h-5 text-accent group-focus-within:scale-110 transition-transform" />
                          <div className="flex-1">
                             <p className="text-[8px] font-black text-accent uppercase mb-1">Destinataire</p>
                             <input 
                               type="text" value={form.receiverName} onChange={e => update('receiverName', e.target.value)}
                               placeholder="Nom du destinataire" className="bg-transparent border-none p-0 w-full text-white font-bold text-sm focus:ring-0 placeholder:text-white/20"
                             />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Package Details ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                   <Package className="w-4 h-4 text-accent/60" />
                   <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Détails de l'item</h2>
                </div>

                <div className="glass rounded-[36px] p-6 border border-white/5 shadow-xl space-y-6">
                  <div className="relative">
                    <textarea
                      value={form.description}
                      onChange={e => update('description', e.target.value)}
                      placeholder="Contenu (ex: Plis, Colis, Vrac...)"
                      rows={2}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white font-medium text-sm focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                     <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 group">
                        <div className="flex items-center justify-between mb-2">
                          <Weight className="w-4 h-4 text-accent/40" />
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Poids (kg)</span>
                        </div>
                        <input 
                          type="number" value={form.weight} onChange={e => update('weight', e.target.value)}
                          title="Poids du colis"
                          aria-label="Poids du colis"
                          className="bg-transparent border-none p-0 w-full text-center text-xl font-black text-white focus:ring-0"
                        />
                     </div>
                     <div className="flex-[1.5] bg-black/40 border border-white/5 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Sparkles className="w-4 h-4 text-accent2/40" />
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Catégorie</span>
                        </div>
                        <select 
                          value={form.category} onChange={e => update('category', e.target.value)}
                          title="Catégorie du colis"
                          aria-label="Catégorie du colis"
                          className="bg-transparent border-none p-0 w-full text-white font-black text-sm focus:ring-0 lowercase tracking-tight"
                        >
                          <option value="standard">Standard</option>
                          <option value="fragile">Fragile 💎</option>
                          <option value="urgent">Urgent ⚡</option>
                        </select>
                     </div>
                  </div>
                </div>
              </div>

              {/* ── Bottom Action ── */}
              <div className="pt-4">
                <button
                  onClick={(e) => {
                    console.log("Button clicked");
                    handleSend();
                  }}
                  disabled={loading}
                  className="w-full h-20 rounded-[30px] gradient-accent relative overflow-hidden group shadow-[0_20px_50px_rgba(230,32,87,0.5)] active:scale-[0.98] transition-all"
                >
                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 blur-2xl opacity-30" />
                   <div className="relative z-10 flex items-center justify-center gap-4">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                             {isCollection ? <Truck className="w-5 h-5 text-white" /> : <Send className="w-5 h-5 text-white -rotate-12" />}
                          </div>
                          <span className="text-white font-black text-sm uppercase tracking-[0.2em]">
                             {isCollection ? 'Trouver le trajet optimal' : 'Expédier mon colis'}
                          </span>
                        </>
                      )}
                   </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'matchmaking' && (
            <motion.div 
              key="match"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex flex-col items-center"
            >
              <div className="w-full glass-strong rounded-[48px] p-10 border border-white/10 relative overflow-hidden shadow-2xl flex flex-col items-center min-h-[460px] justify-center text-center">
                 {/* Atmosphere for match */}
                 <div className="absolute inset-0 bg-accent/5 animate-pulse" />
                 <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

                 <AnimatePresence mode="wait">
                   {matchState === 'searching' ? (
                     <motion.div 
                       key="searching"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="flex flex-col items-center gap-10"
                     >
                       <div className="relative">
                          {/* Radar Animation */}
                          <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-ping" />
                          <div className="w-32 h-32 rounded-full border-2 border-accent/30 flex items-center justify-center relative">
                             <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin" />
                             <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                                <Truck className="w-10 h-10 text-accent animate-pulse" />
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h3 className="text-2xl font-black text-white italic tracking-tight">Analyse Wego-Logs...</h3>
                          <div className="bg-black/40 px-6 py-3 rounded-full border border-white/5 backdrop-blur-xl">
                             <p className="text-[10px] font-black text-accent uppercase tracking-widest min-h-[1.5em] flex items-center justify-center">
                               <motion.span key={searchLog} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                 {searchLog}
                               </motion.span>
                             </p>
                          </div>
                       </div>
                     </motion.div>
                   ) : (
                     <motion.div 
                       key="found"
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="w-full space-y-8"
                     >
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                           <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-3xl font-black text-white italic tracking-tighter">Trajet Idéal Trouvé !</h3>
                          <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Économie solidaire activée</p>
                        </div>

                        {/* Truck Card */}
                        <div className="glass rounded-[32px] border border-accent/20 p-6 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
                           <div className="flex items-center gap-5">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg shadow-accent/40">
                                 <Truck className="w-8 h-8 text-white" />
                              </div>
                              <div className="flex-1 text-left">
                                 <p className="text-lg font-black text-white leading-none mb-1">Passage imminent</p>
                                 <p className="text-[10px] font-black text-accent uppercase tracking-widest">Chauffeur: Mamadou Sidibé</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-2xl font-black text-accent leading-none mb-1">3.500 <span className="text-[10px]">CFA</span></p>
                                 <p className="text-[8px] font-bold text-white/30 uppercase bg-white/5 px-1.5 py-1 rounded">Détour: 2 min</p>
                              </div>
                           </div>

                           <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                              <div className="bg-black/40 rounded-2xl p-4 text-center">
                                 <p className="text-[8px] font-black text-white/30 uppercase mb-1">Empreinte CO2</p>
                                 <p className="text-sm font-black text-emerald-500">-40% Réduction</p>
                              </div>
                              <div className="bg-black/40 rounded-2xl p-4 text-center">
                                 <p className="text-[8px] font-black text-white/30 uppercase mb-1">Confirmation</p>
                                 <p className="text-sm font-black text-white">Scan Immédiat</p>
                              </div>
                           </div>
                        </div>

                        <button
                          onClick={confirmCollection}
                          className="w-full py-6 rounded-[24px] gradient-accent text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-accent/30 active:scale-[0.98] transition-all"
                        >
                           Valider ma Collecte
                        </button>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 px-8 py-6 bg-accent/5 border border-accent/20 rounded-[28px] max-w-sm"
              >
                 <div className="flex gap-4">
                    <Sparkles className="w-6 h-6 text-accent shrink-0" />
                    <p className="text-[11px] font-bold text-white/60 leading-relaxed text-left">
                       <strong className="text-accent uppercase tracking-widest block mb-1">Le saviez-vous ?</strong>
                       La collecte groupée utilise l'espace vide des fourgons B2B déjà en circulation, réduisant drastiquement le coût par item !
                    </p>
                 </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserPackageSend;
