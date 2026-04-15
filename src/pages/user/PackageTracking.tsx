import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, CheckCircle2, Clock, Truck, MapPin,
  Phone, Star, ChevronDown, ChevronUp, ChevronRight, MessageCircle,
  Shield, Copy, X, ShoppingBag, Zap, User
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
  const [showArrivalSim, setShowArrivalSim] = useState(false);

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
    // After 3 seconds of movement, show arrival simulation option
    setTimeout(() => setShowArrivalSim(true), 3000);
  };

  const simulateArrival = () => {
    setPkg(prev => ({ ...prev, status: 'arriving' }));
    setShowArrivalSim(false);
    setShowOTP(true);
    setProgress(0.95);
    toast.info('Livreur arrivé à destination !');
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
      <div className="absolute top-4 right-4 z-[1000] safe-top flex flex-col items-end gap-2">
        <div className="glass-strong rounded-2xl px-4 py-2 border border-white/10 shadow-lg">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">N° suivi</p>
          <p className="text-xs font-black text-white tracking-wider">WG-{String(pkg?.id || 'PK1').slice(0,8).toUpperCase()}</p>
        </div>
        {(pkg?.status === 'in-progress' || pkg?.status === 'arriving') && (
          <div className="flex items-center gap-1.5 bg-accent/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-accent/30 shadow-lg shadow-accent/10">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
            <span className="text-[8px] font-black text-accent uppercase tracking-widest">Live Tracking</span>
          </div>
        )}
      </div>

      {/* ── Bottom Sheet ── */}
      <motion.div
        initial={{ y: 200 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="flex-1 bg-[#0A0A0B] border-t border-white/10 rounded-t-[32px] relative z-[1000] flex flex-col overflow-hidden"
      >
        {/* Handle */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 space-y-4 pt-1">

          {/* ── Triple-Actor Status Link ── */}
          <div className="glass-strong rounded-[24px] p-4 border border-white/5 relative overflow-hidden bg-white/[0.02]">
             <div className="flex items-center justify-between relative z-10 px-2">
                <div className="flex flex-col items-center gap-2">
                   <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 shadow-lg shadow-accent/10">
                      <User className="w-5 h-5 text-accent" />
                   </div>
                   <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{pkg?.senderName?.split(' ')[0] || 'Vous'}</span>
                </div>

                <div className="flex-1 px-2 flex items-center gap-1 group">
                   <div className={`h-1 flex-1 rounded-full transition-all duration-1000 ${pkg?.status !== 'accepted' ? 'bg-accent shadow-[0_0_10px_rgba(230,32,87,0.5)]' : 'bg-white/10'}`} />
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-1000 ${progress > 0 ? 'bg-accent/20 border-accent/30 animate-pulse' : 'bg-white/5 border-white/5'}`}>
                      <Truck className={`w-3 h-3 ${progress > 0 ? 'text-accent' : 'text-white/20'}`} />
                   </div>
                   <div className={`h-1 flex-1 rounded-full transition-all duration-1000 ${pkg?.status === 'delivered' ? 'bg-accent2 shadow-[0_0_10px_rgba(30,192,255,0.5)]' : 'bg-white/10'}`} />
                </div>

                <div className="flex flex-col items-center gap-2">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-1000 ${pkg?.status === 'delivered' ? 'bg-accent2/20 border-accent2/30 shadow-lg shadow-accent2/20' : 'bg-white/5 border-white/10'}`}>
                      <User className={`w-5 h-5 ${pkg?.status === 'delivered' ? 'text-accent2' : 'text-white/20'}`} />
                   </div>
                   <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{pkg?.receiverName?.split(' ')[0] || 'Dest.'}</span>
                </div>
             </div>
             
             <div className="mt-4 flex justify-center">
                <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                   <Shield className="w-3 h-3 text-accent2" />
                   <span className="text-[8px] font-black text-white/60 uppercase tracking-tighter">Validation Triple : Actif</span>
                </div>
             </div>
          </div>

          {/* ── Security Center (Consolidated Validations) ── */}
          <div className="glass-strong rounded-[28px] border border-white/10 overflow-hidden bg-white/[0.02]">
             <div className="p-4 border-b border-white/5 bg-accent/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Shield className="w-4 h-4 text-accent" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Centre de Sécurité</span>
                </div>
                <div className="flex gap-1">
                   <div className={`w-1.5 h-1.5 rounded-full transition-colors ${pkg?.status === 'accepted' ? 'bg-accent animate-pulse' : 'bg-emerald-500'}`} />
                   <div className={`w-1.5 h-1.5 rounded-full transition-colors ${pkg?.status === 'arriving' ? 'bg-accent2 animate-pulse' : (pkg?.status === 'delivered' ? 'bg-emerald-500' : 'bg-white/10')}`} />
                </div>
             </div>
             
             <div className="p-4 space-y-4">
                {/* Pickup Phase */}
                <div className={`p-4 rounded-2xl border transition-all ${pkg?.status === 'accepted' ? 'bg-accent/10 border-accent/40 shadow-lg shadow-accent/10' : 'bg-white/5 border-white/5 opacity-50'}`}>
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
                            <Package className="w-3.5 h-3.5 text-accent" />
                         </div>
                         <span className="text-[10px] font-black text-white uppercase tracking-tighter">Étape 1 : Collecte</span>
                      </div>
                      {pkg?.status !== 'accepted' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                   </div>
                   {pkg?.status === 'accepted' && (
                      <div className="flex items-center gap-3">
                         <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/5">
                            <p className="text-[8px] text-white/40 uppercase mb-1">PIN de Collecte</p>
                            <p className="text-xl font-black text-accent tracking-[0.2em] font-mono">{PICKUP_PIN}</p>
                         </div>
                         <button onClick={simulatePickup} className="px-4 py-3 rounded-xl bg-accent text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-accent/20 active:scale-95 transition-all">Simuler Scan</button>
                      </div>
                   )}
                </div>

                {/* Delivery Phase */}
                <div className={`p-4 rounded-2xl border transition-all ${pkg?.status === 'arriving' || pkg?.status === 'in-progress' ? 'bg-accent2/10 border-accent2/40' : (pkg?.status === 'delivered' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5 opacity-40')}`}>
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-lg bg-accent2/20 flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5 text-accent2" />
                         </div>
                         <span className="text-[10px] font-black text-white uppercase tracking-tighter">Étape 2 : Livraison</span>
                      </div>
                      {pkg?.status === 'delivered' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                   </div>
                   {(pkg?.status === 'arriving' || pkg?.status === 'in-progress') && (
                      <div className="flex items-center gap-3">
                         <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/5">
                            <p className="text-[8px] text-white/40 uppercase mb-1">OTP de Réception</p>
                            <p className="text-xl font-black text-accent2 tracking-[0.2em] font-mono">{OTP_CODE}</p>
                         </div>
                         {pkg?.status === 'arriving' && (
                            <button onClick={simulateDelivery} className="px-4 py-3 rounded-xl bg-accent2 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-accent2/20 active:scale-95 transition-all">Simuler Scan</button>
                         )}
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* ── Actors Row (Driver & Receiver) ── */}
          <div className="grid grid-cols-2 gap-3">
             {/* Driver Card */}
             <div className="glass rounded-[24px] p-4 border border-white/5 flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-full -mr-8 -mt-8 blur-xl" />
                <div className="flex items-center gap-3 relative z-10">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/30 to-accent2/20 flex items-center justify-center border border-white/10 shrink-0 font-black text-white/40">
                      {DRIVER.name.charAt(0)}
                   </div>
                   <div className="min-w-0">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Livreur</p>
                      <p className="text-[11px] font-black text-white truncate">{DRIVER.name}</p>
                   </div>
                </div>
                <div className="flex items-center justify-between pt-1 relative z-10">
                   <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-[10px] font-black text-white/60">{DRIVER.rating}</span>
                   </div>
                   <a 
                     href={`tel:${DRIVER.phone}`} 
                     title="Appeler le livreur"
                     aria-label="Appeler le livreur"
                     className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-accent transition-colors"
                   >
                     <Phone className="w-4 h-4" />
                   </a>
                </div>
             </div>

             {/* Receiver Card */}
             <div className="glass rounded-[24px] p-4 border border-white/5 flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-accent2/5 rounded-full -mr-8 -mt-8 blur-xl" />
                <div className="flex items-center gap-3 relative z-10">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 font-black text-white/40">
                      {pkg.receiverName?.charAt(0) || 'D'}
                   </div>
                   <div className="min-w-0">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Destinataire</p>
                      <p className="text-[11px] font-black text-white truncate">{pkg.receiverName || 'En attente...'}</p>
                   </div>
                </div>
                <div className="flex items-center justify-between pt-1 relative z-10">
                   <span className="text-[10px] font-bold text-white/40 italic">{pkg.receiverPhone || '---'}</span>
                   <button 
                     title="Contacter le destinataire"
                     aria-label="Contacter le destinataire"
                     className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-accent2 transition-colors"
                   >
                     <MessageCircle className="w-4 h-4" />
                   </button>
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
                        Le destinataire peut présenter ce QR Code au livreur. S'il n'a pas l'application, il peut donner le code reçu par <b>SMS ou Email</b>.
                      </p>
                      
                      <div className="group relative">
                        <div className="absolute -inset-2 bg-accent/20 rounded-[30px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-40 h-40 bg-white rounded-[28px] flex items-center justify-center p-4 shadow-[0_20px_50px_rgba(230,32,87,0.3)] relative transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                           <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=e62057&bgcolor=ffffff&data=WEGO-VALIDATE-${pkg?.id || 'PK1'}`} alt="QR Code validation" className="w-full h-full rounded-xl" />
                           <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                             <div className="bg-accent px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-tighter shadow-lg shadow-accent/40 border border-white/20 flex items-center gap-1">
                               <Shield className="w-2.5 h-2.5" /> Scan Livreur
                             </div>
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
