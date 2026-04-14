import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, CheckCircle2, Clock, Truck, MapPin,
  Phone, Star, ChevronDown, ChevronUp, ChevronRight, MessageCircle,
  Shield, Copy, X, ShoppingBag, Zap
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import WegoMap, { createPhotoIcon, pickupIcon, destinationIcon } from '@/components/WegoMap';
import type { MapMarker } from '@/components/WegoMap';
import { getRealRoute } from '@/services/mapService';

// ─── Real Dakar coordinates ──────────────────────────────────────────────────
// Plateau → Almadies (real Dakar streets)
const DEFAULT_ORIGIN: [number, number]      = [14.6928, -17.4467]; // Plateau, Dakar
const DEFAULT_DESTINATION: [number, number] = [14.7452, -17.5149]; // Almadies

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getDistance = (p1: [number, number], p2: [number, number]) => {
  const R = 6371;
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLon = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(p1[0]*Math.PI/180) * Math.cos(p2[0]*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// ─── Mock Delivery Driver ───────────────────────────────────────────────────
const DRIVER = {
  name: 'Mamadou Diallo',
  photo: null as string | null,
  rating: 4.9,
  totalDeliveries: 847,
  phone: '+221 77 456 78 90',
  vehicle: 'Moto Jakarta • DK-7731-B',
  verified: true,
};

const PackageTracking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const pkgInitial = location.state?.package || {
    id: `WG-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
    description: 'Colis de test (Mode Démo)',
    status: 'accepted',
    pickupAddress: 'Plateau, Place de l\'Indépendance',
    deliveryAddress: 'Almadies, Route des Almadies',
    weight: '1.5',
    pickupPin: '4321'
  };
  const [pkg, setPkg] = useState(pkgInitial);

  // Map & movement state
  const [route, setRoute]         = useState<[number, number][]>([]);
  const [progress, setProgress]   = useState(0);
  const [totalDist, setTotalDist] = useState(0);
  const [realDur, setRealDur]     = useState(18); // minutes
  const [origin, setOrigin]       = useState<[number, number]>(DEFAULT_ORIGIN);
  const [dest, setDest]           = useState<[number, number]>(DEFAULT_DESTINATION);

  // UI state
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [showPreview, setShowPreview]   = useState(false);
  const [showOTP, setShowOTP]             = useState(false);
  const [showPickup, setShowPickup]       = useState(true); // Default to showing pickup if status is accepted
  const [showCancelModal, setShowCancelModal] = useState(false);
  const OTP_CODE = '4729';
  const PICKUP_PIN = pkg?.pickupPin || '8821';

  // ── Load real OSRM route ──────────────────────────────────────────────────
  useEffect(() => {
    const from = pkg?.pickupCoords  || DEFAULT_ORIGIN;
    const to   = pkg?.destCoords    || DEFAULT_DESTINATION;
    setOrigin(from);
    setDest(to);

    getRealRoute(from, to).then(info => {
      if (info.coordinates.length > 1) {
        setRoute(info.coordinates);
        setTotalDist(info.distance);
        setRealDur(Math.max(info.duration, 5));
      }
    });
  }, [pkg]);

  // ── Animate parcel along route ────────────────────────────────────────────
  const speedKmh = useMemo(() => {
    if (!totalDist || !realDur) return 25;
    return totalDist / (realDur / 60);
  }, [totalDist, realDur]);

  useEffect(() => {
    if (route.length < 2 || totalDist === 0) return;
    // Only animate if in-progress
    if (pkg?.status && !['in-progress', 'arriving'].includes(pkg.status)) return;

    const TICK_MS = 60; // Silky smooth 60ms tracking (~16fps)
    const distPerTick = (speedKmh / 3600) * (TICK_MS / 1000); // km per tick
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + distPerTick / totalDist;
        return Math.min(next, 1);
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [route, totalDist, speedKmh, pkg?.status]);

  // ── Current parcel position ───────────────────────────────────────────────
  const currentIdx = Math.min(
    Math.floor(progress * (route.length - 1)),
    route.length - 2
  );
  const parcelPos: [number, number] = route.length > 0
    ? route[Math.min(currentIdx, route.length - 1)]
    : origin;

  // Mock stunning package photo
  const MOCK_PHOTO = "https://images.unsplash.com/photo-1607006411005-bf3a94841b59?w=150&h=150&fit=crop";
  const parcelIcon = pkg?.photo ? createPhotoIcon(pkg.photo) : createPhotoIcon(MOCK_PHOTO);

  const markers: MapMarker[] = [
    { key: 'origin',      position: origin,   icon: pickupIcon      },
    { key: 'destination', position: dest,      icon: destinationIcon },
    { key: 'parcel',      position: parcelPos, icon: parcelIcon, onClick: () => setShowPreview(true) },
  ];

  // ── ETA ───────────────────────────────────────────────────────────────────
  const remainingDist = (1 - progress) * totalDist;
  const etaMin = speedKmh > 0 ? Math.round((remainingDist / speedKmh) * 60) : realDur;

  // ── Timeline steps ────────────────────────────────────────────────────────
  const steps = useMemo(() => [
    { icon: Package,     label: pkg?.status === 'accepted' ? 'Collecte en attente' : 'Colis récupéré',  sub: pkg?.status === 'accepted' ? 'Coursier en route' : '10:15 · Plateau',   done: pkg?.status !== 'accepted',           active: pkg?.status === 'accepted' },
    { icon: Truck,       label: 'En transit',       sub: 'Route des Almadies', done: progress > 0.5, active: pkg?.status === 'in-progress' && progress <= 0.5 },
    { icon: MapPin,      label: 'Arrivé',           sub: 'Almadies',           done: progress >= 1,  active: pkg?.status === 'arriving' },
  ], [progress, pkg?.status]);

  const handleCopyOTP = () => {
    navigator.clipboard?.writeText(OTP_CODE);
    toast.success('Code copié !');
  };

  const simulateDelivery = () => {
    setPkg(prev => ({ ...prev, status: 'delivered' }));
    setProgress(1);
    toast.success('Colis marqué comme livré ! (Simulation)');
  };

  const simulatePickup = () => {
    setPkg(prev => ({ ...prev, status: 'in-progress' }));
    setShowPickup(false);
    toast.success('Colis collecté avec succès !');
  };

  const handleCancelPackage = async () => {
    setPkg(prev => ({ ...prev, status: 'cancelled' }));
    toast.info("Envoi annulé");
    navigate('/user/dashboard');
  };

  return (
    <div className="h-screen bg-background flex flex-col relative overflow-hidden">
      {/* ── Map ── */}
      <div className={`transition-all duration-500 ${sheetExpanded ? 'h-[30%]' : 'h-[52%]'}`}>
        <WegoMap
          markers={markers}
          routePoints={route}
          routeColor="#94c679"
          center={parcelPos}
          zoom={14}
        />
      </div>

      {/* ── Back button ── */}
      <div className="absolute top-4 left-4 z-[1000] safe-top">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center tap-target shadow-xl border border-white/10"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* ── Tracking badge ── */}
      <div className="absolute top-4 right-4 z-[1000] safe-top">
        <div className="glass-strong rounded-2xl px-4 py-2 border border-white/10 shadow-lg">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">N° suivi</p>
          <p className="text-xs font-black text-white tracking-wider">WG-{String(pkg?.id || 'PK1').slice(0,8).toUpperCase()}</p>
        </div>
      </div>

      {/* ── Bottom Sheet ── */}
      <motion.div
        initial={{ y: 200 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="flex-1 bg-[#0A0A0B] border-t border-white/10 rounded-t-[32px] relative z-[1000] flex flex-col overflow-hidden"
      >
        {/* Handle */}
        <button
          className="w-full flex flex-col items-center pt-3 pb-1 shrink-0 active:opacity-60"
          onClick={() => setSheetExpanded(!sheetExpanded)}
        >
          <div className="w-10 h-1 rounded-full bg-white/20 mb-1" />
          {sheetExpanded
            ? <ChevronDown className="w-4 h-4 text-white/30" />
            : <ChevronUp   className="w-4 h-4 text-white/30" />
          }
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 space-y-3 pt-1">

          {/* ── Pickup validation for sender (MOVED TO TOP FOR VISIBILITY) ── */}
          {pkg?.status === 'accepted' && (
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className={`glass rounded-[24px] border-2 ${showPickup ? 'border-accent shadow-[0_0_30px_rgba(230,32,87,0.2)] bg-accent/5' : 'border-accent/20 bg-accent/5'} overflow-hidden transition-all duration-500 mb-4`}
            >
              <button
                onClick={() => setShowPickup(!showPickup)}
                className="w-full p-5 flex items-center justify-between active:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center relative shadow-lg shadow-accent/20">
                    <Package className="w-6 h-6 text-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                       <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] animate-pulse">Action Requise</p>
                    <p className="text-base font-black text-white">Confirmer le Ramassage</p>
                  </div>
                </div>
                {showPickup ? <ChevronDown className="w-5 h-5 text-white/30" /> : <ChevronRight className="w-5 h-5 text-white/30" />}
              </button>
              
              <AnimatePresence>
                {showPickup && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-8 flex flex-col items-center"
                  >
                    <div className="w-full h-px bg-white/10 mb-6" />
                    
                    <div className="relative group mb-8">
                      <div className="absolute -inset-6 bg-accent/30 rounded-full blur-[40px] opacity-50 group-hover:opacity-100 transition-opacity" />
                      <div className="w-48 h-48 bg-white rounded-[32px] flex items-center justify-center p-4 shadow-2xl relative transition-transform hover:scale-105">
                         <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=000000&bgcolor=ffffff&data=PICKUP-${pkg?.id}`} alt="QR Code Collecte" className="w-full h-full" />
                         <div className="absolute -bottom-3 inset-x-4 h-8 bg-accent rounded-xl flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-accent/40 border border-white/20">
                           QR Code de Collecte
                         </div>
                      </div>
                    </div>

                    <div className="w-full bg-black/20 rounded-[24px] p-4 border border-white/5 flex flex-col items-center mb-6">
                      <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] font-black mb-3 italic">OU DONNER LE CODE PIN</p>
                      <div className="flex items-center gap-4">
                        <p className="text-[40px] font-black text-accent tracking-[0.3em] font-mono">{PICKUP_PIN}</p>
                        <button 
                          onClick={handleCopyOTP} 
                          className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all border border-accent/20"
                          title="Copier le code PIN"
                          aria-label="Copier le code PIN"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={simulatePickup}
                      className="w-full py-4 rounded-2xl gradient-accent text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-accent/30 active:scale-[0.98] transition-all relative overflow-hidden group"
                    >
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 group-hover:h-full transition-all duration-300 opacity-20" />
                      <span className="relative z-10">Simuler Scan Livreur (Collecte)</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── ETA card ── */}
          <div className="glass rounded-[20px] p-4 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-accent2/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent2" />
              </div>
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Arrivée estimée</p>
                {pkg?.status === 'delivered' || progress >= 1
                  ? <p className="text-xl font-black text-accent2 flex items-center gap-2">Colis Livré <CheckCircle2 className="w-5 h-5" /></p>
                  : <p className="text-2xl font-black text-white tabular-nums">~{etaMin} <span className="text-sm text-white/40">min</span></p>
                }
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Restant</p>
              <p className="text-sm font-black text-white">{pkg?.status === 'delivered' ? '0' : remainingDist.toFixed(1)} km</p>
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div className="glass rounded-[16px] p-3 border border-white/5">
            <div className="flex justify-between text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">
              <span>Départ</span>
              <span>{Math.round(progress * 100)}%</span>
              <span>Arrivée</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent2 rounded-full"
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* ── Driver card ── */}
          <div className="glass rounded-[24px] p-4 border border-white/5">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">Livreur</p>
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-accent/30 to-accent2/20 flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                {DRIVER.photo
                  ? <img src={DRIVER.photo} alt={DRIVER.name} className="w-full h-full object-cover" />
                  : <span className="text-2xl font-black text-white/30">{DRIVER.name.charAt(0)}</span>
                }
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-black text-white truncate">{DRIVER.name}</p>
                  {DRIVER.verified && <Shield className="w-3 h-3 text-accent2 shrink-0" />}
                </div>
                <p className="text-[10px] text-white/40 mb-1 truncate">{DRIVER.vehicle}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-black text-yellow-400">{DRIVER.rating}</span>
                  <span className="text-[9px] text-white/30 ml-1">· {DRIVER.totalDeliveries} livraisons</span>
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={`tel:${DRIVER.phone}`}
                  aria-label={`Appeler ${DRIVER.name}`}
                  className="w-10 h-10 rounded-xl bg-accent2/10 border border-accent2/20 flex items-center justify-center active:scale-90 transition-all"
                >
                  <Phone className="w-4 h-4 text-accent2" />
                </a>
               </div>
            </div>
          </div>

          {/* ── Chat button (below driver card) ── */}
          <button
            aria-label="Contacter le livreur"
            className="w-full py-3.5 rounded-[20px] flex items-center justify-center gap-3 bg-accent/10 border border-accent/20 text-accent font-black text-sm active:scale-[0.98] transition-all"
            onClick={() => navigate('/user/chat')}
          >
            <MessageCircle className="w-5 h-5" />
            Contacter le livreur
          </button>

          {/* ── Package info ── */}
          <div className="glass rounded-[24px] p-4 border border-white/5 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent/20 blur-[40px] rounded-full pointer-events-none" />
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">Informations colis</p>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-14 h-14 rounded-[18px] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_10px_20px_rgba(0,0,0,0.4)] relative">
                <img src={pkg?.photo || MOCK_PHOTO} alt="Package" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <Package className="w-4 h-4 text-white absolute bottom-1.5 right-1.5 opacity-80" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-white mb-1">{pkg?.description || 'Colis B2B Express'}</p>
                <div className="flex gap-2 text-[9px] font-black tracking-widest">
                  <p className="text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">FRAGILE</p>
                  <p className="text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{pkg?.weight || '~0.5'} KG</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5 relative z-10">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[8px] text-white/40 mb-0.5 uppercase tracking-widest flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-accent" />Départ</p>
                <p className="text-[11px] font-black text-white truncate">{pkg?.pickupAddress || 'Plateau, Dakar'}</p>
              </div>
              <div className="w-4 h-px bg-white/10 mx-2" />
              <div className="flex-1 min-w-0 pl-2 text-right">
                <p className="text-[8px] text-white/40 mb-0.5 uppercase tracking-widest flex items-center gap-1 justify-end">Destination<div className="w-1.5 h-1.5 rounded-sm bg-white" /></p>
                <p className="text-[11px] font-black text-white truncate">{pkg?.deliveryAddress || 'Almadies, Route des Mert.'}</p>
              </div>
            </div>
          </div>


          {/* ── OTP code for delivery ── */}
          {(pkg?.status === 'arriving' || pkg?.status === 'delivered') && (
            <div className={`glass rounded-[24px] border ${pkg?.status === 'delivered' ? 'border-accent2/20 bg-accent2/5' : 'border-white/5'} overflow-hidden transition-all duration-500`}>
              {pkg?.status === 'delivered' ? (
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent2/20 flex items-center justify-center mb-4 scale-animation">
                  <CheckCircle2 className="w-8 h-8 text-accent2" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Livraison Confirmée</h3>
                <p className="text-xs text-white/40">Merci d'avoir choisi Wego. Votre colis a été validé par OTP/QR Code.</p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowOTP(!showOTP)}
                  className="w-full p-4 flex items-center justify-between active:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center relative">
                      <Shield className="w-5 h-5 text-accent" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0A0A0B] animate-pulse" />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Validation Indispensable</p>
                      <p className="text-sm font-black text-white">
                        {showOTP ? 'Masquer le code' : 'Afficher OTP / QR Code'}
                      </p>
                    </div>
                  </div>
                  {showOTP
                    ? <ChevronUp className="w-4 h-4 text-white/30" />
                    : <ChevronDown className="w-4 h-4 text-white/30" />
                  }
                </button>
                <AnimatePresence>
                  {showOTP && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-6 flex flex-col items-center"
                    >
                      <div className="w-full h-px bg-white/5 mb-4" />
                      <p className="text-[10px] text-center text-white/60 mb-5 px-4 font-medium leading-relaxed">
                        À l'arrivée du chauffeur, présentez ce code ou faites scanner le QR Code pour valider la réception.
                      </p>
                      
                      <div className="group relative">
                        <div className="absolute -inset-2 bg-accent/20 rounded-[30px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-40 h-40 bg-white rounded-[28px] flex items-center justify-center p-4 shadow-[0_20px_50px_rgba(230,32,87,0.3)] relative transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                           <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=e62057&bgcolor=ffffff&data=WEGO-VALIDATE-${pkg?.id || 'PK1'}`} alt="QR Code validation" className="w-full h-full rounded-xl" />
                           <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                             <div className="bg-accent px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-tighter shadow-lg shadow-accent/40 border border-white/20">Scan Direct</div>
                           </div>
                        </div>
                      </div>

                      <div className="mt-8 mb-2 flex flex-col items-center">
                        <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black mb-3 italic">Validation Manuelle</p>
                        <div className="flex items-center gap-4 bg-white/5 p-2 pr-2 pl-6 rounded-full border border-white/10 group hover:border-accent/40 transition-colors">
                          <p className="text-[32px] font-black text-accent tracking-[0.3em]">{OTP_CODE}</p>
                          <button onClick={e => { e.stopPropagation(); handleCopyOTP(); }} aria-label="Copier le code PIN" className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Simulator button for DEV/DEMO */}
                      <button 
                        onClick={simulateDelivery}
                        className="mt-6 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-accent2 transition-colors border-b border-white/5 pb-1"
                      >
                        Simuler le scan du chauffeur (Démo)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        )}

          {/* ── Timeline ── */}
          <div className="glass rounded-[24px] p-4 border border-white/5">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-4">Étapes de livraison</p>
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border shrink-0 ${
                      step.done   ? 'bg-accent2/20 border-accent2/30' :
                      step.active ? 'bg-accent/20 border-accent/30 animate-pulse' :
                      'bg-white/5 border-white/5'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        step.done ? 'text-accent2' : step.active ? 'text-accent' : 'text-white/20'
                      }`} />
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${step.done ? 'bg-accent2/40' : 'bg-white/10'}`} />
                    )}
                  </div>
                  <div className="pt-1.5 pb-4">
                    <p className={`text-sm font-black ${
                      step.active ? 'text-accent' : step.done ? 'text-white' : 'text-white/30'
                    }`}>{step.label}</p>
                    <p className="text-[9px] font-bold text-white/30 mt-0.5">{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Cancel Button ── */}
          {pkg?.status === 'accepted' && progress < 0.15 && (
            <button 
              onClick={() => setShowCancelModal(true)}
              className="w-full mt-4 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-black text-sm active:scale-95 transition-all shadow-lg hover:bg-destructive/20 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Annuler l'envoi
            </button>
          )}

        </div>
      </motion.div>

      {/* ── Package Details Popup ── */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass rounded-[40px] border border-white/10 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
            >
              {/* Header Image */}
              <div className="relative h-64">
                <img src={pkg?.photo || MOCK_PHOTO} alt="Package Details" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <button 
                  onClick={() => setShowPreview(false)}
                  aria-label="Fermer"
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{pkg?.description || 'Colis Wego'}</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-accent">Contenu détaillé</p>
                  </div>
                </div>
              </div>

              {/* Content Details */}
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-accent2/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-accent2" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Articles</p>
                      <p className="text-sm font-bold text-white leading-relaxed">
                        1x Sneakers Limited Edition<br/>
                        2x Hoodies Wego Blue<br/>
                        1x Certificat d'authenticité
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> État</p>
                      <p className="text-xs font-bold text-accent">Scellé & Sécurisé</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Valeur</p>
                      <p className="text-xs font-bold text-white">85,000 CFA</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowPreview(false)}
                  className="w-full py-4 rounded-[22px] bg-white text-black font-black uppercase tracking-widest text-[11px] hover:scale-[0.98] transition-all"
                >
                  Fermer l'aperçu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Cancellation Modal ── */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-strong rounded-[32px] p-8 max-w-sm w-full border border-white/10 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-white mb-2">Annuler l'envoi ?</h2>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Êtes-vous sûr de vouloir annuler l'envoi de ce colis ?
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleCancelPackage}
                  className="w-full py-4 rounded-2xl bg-destructive text-white font-black text-sm active:scale-[0.98] transition-all"
                >
                  Confirmer
                </button>
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="w-full py-4 rounded-2xl glass border border-white/10 text-white font-black text-sm active:scale-[0.98] transition-all"
                >
                  Continuer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PackageTracking;
