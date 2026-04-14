import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Star, X, Loader2, Users, Car, Clock, Sparkles, ChevronRight, Info, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import * as api from '@/services/api';
import { getRealRoute, reverseGeocode, searchLocations } from '@/services/mapService';
import type { VehicleType, SavedPlace } from '@/types';
import WegoMap, { pickupIcon, destinationIcon, type MapMarker } from '@/components/WegoMap';
import LocationSearchInput from '@/components/LocationSearchInput';

const UserBooking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const bookingType = searchParams.get('type') || 'private';
  const { session } = useAuthStore();
  
  const [pickup, setPickup] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [activeField, setActiveField] = useState<'pickup' | 'destination' | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [durationMin, setDurationMin] = useState<number>(0);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [step, setStep] = useState<'address' | 'vehicle' | 'confirm'>('address');
  const [sharedState, setSharedState] = useState<'searching' | 'found'>('searching');
  const [searchLog, setSearchLog] = useState<string>('Analyse des itinéraires et de votre position...');

  useEffect(() => {
    api.getVehicleTypes().then(setVehicleTypes);
    api.getSavedPlaces().then(setSavedPlaces);
  }, []);

  useEffect(() => {
    if (step === 'vehicle' && bookingType === 'shared') {
      setSharedState('searching');
      setSearchLog('Analyse des itinéraires de départ et arrivée...');
      
      const t1 = setTimeout(() => setSearchLog('2 taxis compatibles trouvés près de vous...'), 1200);
      const t2 = setTimeout(() => setSearchLog('Optimisation : Priorité au taxi le plus rempli (3/4 clients)...'), 2500);
      const t3 = setTimeout(() => setSharedState('found'), 4000);
      
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [step, bookingType]);

  // Fetch real route when both coordinates are set
  useEffect(() => {
    if (pickupCoords && destinationCoords) {
      getRealRoute(pickupCoords, destinationCoords).then(info => {
        setRoutePoints(info.coordinates);
        setDistanceKm(info.distance);
        setDurationMin(info.duration);
      }).catch(console.error);
    } else {
      setRoutePoints([]);
      setDistanceKm(0);
      setDurationMin(0);
    }
  }, [pickupCoords, destinationCoords]);

  const calculatePrice = (basePrice: number) => {
    if (distanceKm === 0) return basePrice;
    return Math.round(basePrice + (distanceKm * 1.2));
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
        setPickup(t('common.loading'));
        try {
          const address = await reverseGeocode(coords[0], coords[1]);
          setPickup(address);
        } catch (err) {
          setPickup("Ma position");
        }
      },
      () => toast.error(t('common.error'))
    );
  };

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (step === 'address') {
      setDestinationCoords([lat, lng]);
      setDestination(t('common.loading'));
      try {
        const address = await reverseGeocode(lat, lng);
        setDestination(address);
      } catch (err) {
        setDestination(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    }
  }, [step, t]);

  const selectedVT = bookingType === 'shared' 
    ? { id: 'shared', label: t('user.booking.sharedTaxi', { defaultValue: 'Taxi Partagé' }), icon: '👥', price: 3, time: '10' }
    : vehicleTypes.find(v => v.id === selectedVehicle);

  const handleConfirm = async () => {
    if (!session || !selectedVT) return;
    const finalPrice = calculatePrice(selectedVT.price);
    await api.createRide({
      userId: session.id,
      from: pickup,
      to: destination,
      pickupCoords: pickupCoords || undefined,
      destinationCoords: destinationCoords || undefined,
      status: 'accepted',
      amount: finalPrice,
      date: new Date().toISOString().split('T')[0],
      vehicleTypeId: selectedVT.id,
      durationMin: durationMin || undefined,
      etaMin: Math.ceil(durationMin) || parseInt(selectedVT.time) || 10,
    });
    toast.success(t('user.booking.bookingConfirmed'));
    navigate('/user/tracking');
  };

  const addressMarkers: MapMarker[] = [];
  if (pickupCoords) addressMarkers.push({ key: 'pickup', position: pickupCoords, icon: pickupIcon });
  if (destinationCoords) addressMarkers.push({ key: 'dest', position: destinationCoords, icon: destinationIcon });

  return (
    <div className="h-[100svh] overflow-hidden bg-background text-foreground flex flex-col">
      {/* ── Header ── */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors"
          title={t('common.back')}
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tight italic">
          Wego<span className="text-accent underline decoration-2 underline-offset-4">Ride</span>
        </h1>
        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-accent" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {step === 'address' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
            
            {/* ── Map Preview ── */}
            <div className="rounded-[32px] overflow-hidden border border-white/5 h-[240px] relative shadow-2xl group">
              <WegoMap
                markers={addressMarkers}
                routePoints={routePoints}
                onMapClick={handleMapClick}
              />
              {!pickupCoords && !destinationCoords && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none group-hover:bg-black/20 transition-all">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-black/40 rounded-full">
                      Touche le trajet de ton choix
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Route Inputs ── */}
            <div className="glass rounded-[32px] p-2 border border-white/5 relative bg-gradient-to-b from-white/5 to-transparent">
              <div className="p-4 space-y-4">
                <LocationSearchInput
                  value={pickup}
                  onChange={setPickup}
                  onSelect={(name, coords) => {
                    setPickup(name);
                    if (coords) setPickupCoords(coords);
                  }}
                  placeholder={t('user.booking.pickupPlaceholder')}
                  label="Point de départ"
                  showCurrentLocation={true}
                />
                <div className="h-px bg-white/5 mx-4" />
                <LocationSearchInput
                  value={destination}
                  onChange={setDestination}
                  onSelect={(name, coords) => {
                    setDestination(name);
                    if (coords) setDestinationCoords(coords);
                  }}
                  placeholder={t('user.booking.destinationPlaceholder')}
                  label="Destination"
                />
              </div>
            </div>

            {/* ── Quick Actions ── */}
            {savedPlaces.length > 0 && (
              <div className="px-2">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 mb-4">{t('user.booking.savedPlaces')}</p>
                <div className="grid grid-cols-2 gap-3">
                  {savedPlaces.slice(0, 2).map(place => (
                    <button
                      key={place.id}
                      onClick={async () => {
                        setDestination(place.address);
                        const results = await searchLocations(place.address); // Fallback to api search if needed or manual
                        if (results && results.length > 0) {
                          setDestinationCoords([results[0].lat, results[0].lon]);
                        }
                      }}
                      className="glass rounded-2xl p-4 flex flex-col gap-2 tap-target border border-white/5 hover:border-accent/40 transition-all text-left"
                    >
                      <Star className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-xs font-black text-foreground truncate">{place.name}</p>
                        <p className="text-[9px] text-white/40 truncate">{place.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep('vehicle')}
              disabled={!pickupCoords || !destinationCoords}
              className="w-full py-5 rounded-[24px] gradient-accent text-white font-black uppercase tracking-widest text-sm tap-target disabled:opacity-40 shadow-[0_20px_40px_-10px_rgba(230,32,87,0.4)] transition-all active:scale-[0.98] mt-4"
            >
              Voir les options de trajet
            </button>
          </motion.div>
        )}

        {step === 'vehicle' && bookingType !== 'shared' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-black text-foreground uppercase tracking-tight">{t('user.booking.chooseVehicle')}</h2>
              <button 
                onClick={() => setStep('address')} 
                className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-3 py-1.5 rounded-full"
              >
                Modifier trajet
              </button>
            </div>

            <div className="space-y-4">
              {vehicleTypes.map(vt => {
                const speedFactor = vt.label === 'Moto' ? 0.8 : 1.0;
                const estimatedTime = durationMin > 0 ? Math.ceil(durationMin * speedFactor) : parseInt(vt.time);
                const isSelected = selectedVehicle === vt.id;
                
                return (
                  <button
                    key={vt.id}
                    onClick={() => setSelectedVehicle(vt.id)}
                    className={`w-full glass rounded-[28px] p-5 flex items-center justify-between tap-target transition-all border ${isSelected ? 'border-accent shadow-[0_15px_30px_-5px_rgba(230,32,87,0.2)]' : 'border-white/5'}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-accent/20' : 'bg-white/5'}`}>
                        <span className="text-4xl">{vt.icon}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-black text-foreground text-lg tracking-tight mb-1">{vt.label}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            {estimatedTime} min
                          </div>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <p className="text-[10px] text-accent font-black uppercase tracking-widest italic">Fast</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-2xl tracking-tighter transition-colors ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                        {calculatePrice(vt.price)} <span className="text-xs">CFA</span>
                      </p>
                      <div className="flex items-center gap-1 justify-end opacity-40">
                         <span className="text-[8px] font-black uppercase tracking-tighter">Secure Pay</span>
                         <ShieldCheck className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-6">
              <button
                onClick={() => setStep('confirm')}
                disabled={!selectedVehicle}
                className="w-full py-5 rounded-[24px] gradient-accent text-white font-black uppercase tracking-widest text-sm tap-target disabled:opacity-40 shadow-[0_20px_40px_-10px_rgba(230,32,87,0.4)] transition-all active:scale-[0.98]"
              >
                Confirmer l'option
              </button>
            </div>
          </motion.div>
        )}

        {step === 'vehicle' && bookingType === 'shared' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-4">
             {/* Shared taxi logic kept consistent but with Wego style */}
             <div className="flex items-center justify-between mb-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{sharedState === 'searching' ? 'Analyse du réseau...' : 'Taxi partagé trouvé'}</p>
               <button onClick={() => setStep('address')} className="text-[10px] font-black uppercase tracking-widest text-accent">Détour</button>
             </div>
             
             <AnimatePresence mode="wait">
               {sharedState === 'searching' ? (
                 <motion.div
                   key="searching"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="glass rounded-[40px] p-10 flex flex-col items-center justify-center border border-white/5 h-[360px] relative overflow-hidden shadow-2xl"
                 >
                   <div className="absolute inset-0 bg-accent/5 animate-pulse" />
                   <div className="relative mb-10">
                     <div className="w-32 h-32 rounded-full border border-accent/20 flex items-center justify-center relative">
                       <div className="absolute inset-0 rounded-full border border-accent/40 animate-ping opacity-50" />
                       <div className="w-20 h-20 rounded-full border border-accent/40 flex items-center justify-center bg-accent/5">
                         <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                           <Users className="w-6 h-6 text-accent animate-pulse" />
                         </div>
                       </div>
                     </div>
                   </div>
                   <h3 className="font-black text-foreground mb-4 text-center text-xl tracking-tight italic">Optimisation en cours...</h3>
                   <div className="bg-black/20 px-6 py-2 rounded-full border border-white/5">
                      <p className="text-[10px] text-accent font-black text-center uppercase tracking-widest">
                        <motion.span key={searchLog} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                          {searchLog}
                        </motion.span>
                      </p>
                   </div>
                 </motion.div>
               ) : (
                 <motion.div
                   key="found"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="glass rounded-[40px] border border-accent/30 relative overflow-hidden shadow-2xl shadow-accent/20"
                 >
                   <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-[80px] -mr-16 -mt-16" />
                   <div className="p-8 relative z-10">
                     <div className="flex justify-between items-start mb-8">
                       <div className="flex gap-4">
                         <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shrink-0 shadow-lg shadow-accent/40">
                           <Car className="w-8 h-8 text-white" />
                         </div>
                         <div>
                           <p className="font-black text-foreground mb-1 text-xl tracking-tighter italic leading-tight">Toyota Partagée</p>
                           <div className="flex items-center gap-1.5 text-[11px] font-black text-accent bg-accent/10 px-3 py-1 rounded-full inline-flex">
                             <Star className="w-3 h-3 fill-accent" />
                             <span>4.9 • Chauffeur Ali</span>
                           </div>
                         </div>
                       </div>
                       <div className="text-right shrink-0">
                         <p className="font-black text-3xl text-accent leading-none mb-1">{Math.round(calculatePrice(2))} <span className="text-xs">CFA</span></p>
                         <p className="text-[10px] text-white/40 font-black bg-white/5 px-2 py-1 rounded-md border border-white/10 uppercase tracking-tighter">ÉCONOMIE 40%</p>
                       </div>
                     </div>
                     
                     <div className="bg-black/30 rounded-[32px] p-6 mb-8 border border-white/5 backdrop-blur-md">
                       <div className="flex items-center justify-between mb-4">
                         <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Disponibilité</span>
                         <span className="text-[10px] font-black text-accent px-3 py-1 bg-accent/10 rounded-full border border-accent/20">1 PLACE RESTANTE</span>
                       </div>
                       <div className="flex gap-2.5 mb-8">
                          <div className="flex-1 h-3 rounded-full bg-accent shadow-[0_0_15px_rgba(230,32,87,0.5)]" />
                          <div className="flex-1 h-3 rounded-full bg-accent shadow-[0_0_15px_rgba(230,32,87,0.5)]" />
                          <div className="flex-1 h-3 rounded-full bg-accent shadow-[0_0_15px_rgba(230,32,87,0.5)] relative">
                             <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-widest text-accent bg-accent/10 px-2 py-1 rounded border border-accent/20 uppercase whitespace-nowrap">Occupé</div>
                          </div>
                          <div className="flex-1 h-3 rounded-full bg-white/10 border border-white/5" />
                       </div>
                       <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                         <div className="flex flex-col items-center text-center">
                            <div className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center mb-2 border border-white/5 group-hover:border-accent/40">
                             <MapPin className="w-4 h-4 text-accent" />
                            </div>
                           <span className="text-[8px] text-white/30 font-black uppercase tracking-tighter mb-1">Détour</span>
                           <span className="text-[11px] font-black text-foreground tracking-tight">&lt; 50m</span>
                         </div>
                         <div className="flex flex-col items-center text-center">
                            <div className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center mb-2 border border-white/5">
                             <Navigation className="w-4 h-4 text-accent" />
                            </div>
                           <span className="text-[8px] text-white/30 font-black uppercase tracking-tighter mb-1">Route</span>
                           <span className="text-[11px] font-black text-accent tracking-tight">100% IDEM</span>
                         </div>
                         <div className="flex flex-col items-center text-center">
                            <div className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center mb-2 border border-white/5">
                             <Clock className="w-4 h-4 text-accent" />
                            </div>
                           <span className="text-[8px] text-white/30 font-black uppercase tracking-tighter mb-1">Passage</span>
                           <span className="text-[11px] font-black text-foreground tracking-tight">3 min</span>
                         </div>
                       </div>
                     </div>
                     
                     <button
                        onClick={() => {
                          setSelectedVehicle('shared');
                          setStep('confirm');
                        }}
                        className="w-full py-5 rounded-[24px] relative overflow-hidden group shadow-2xl shadow-accent/40 transition-transform active:scale-[0.98]"
                     >
                       <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 group-hover:scale-105 transition-transform" />
                       <span className="relative z-10 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                          <Users className="w-5 h-5 translate-y-[-1px]" />
                          Réserver ma place
                       </span>
                     </button>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
 
             {sharedState === 'found' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 bg-accent/5 border border-accent/20 rounded-[24px] p-5 flex gap-4 text-[11px] text-white/60 leading-relaxed font-bold shadow-inner">
                 <Sparkles className="w-6 h-6 text-accent shrink-0 animate-pulse" />
                 <p>
                   <strong className="text-accent uppercase tracking-widest text-[10px] block mb-1">Intelligence Logistique :</strong> Le système a favorisé un trajet existant ayant 3 places occupées pour optimiser les émissions et le coût !
                 </p>
               </motion.div>
             )}
          </motion.div>
        )}

        {step === 'confirm' && selectedVT && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 space-y-6">
            <div className="rounded-[40px] overflow-hidden border border-white/5 h-[200px] shadow-2xl relative">
              <WegoMap
                markers={addressMarkers}
                routePoints={routePoints}
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
            
            <div className="glass rounded-[40px] p-8 border border-white/5 relative overflow-hidden shadow-2xl">
              <div className="absolute -right-20 -top-20 w-48 h-48 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
              
              <h3 className="font-black text-foreground text-xl mb-8 tracking-tighter italic flex items-center gap-2">
                 <Info className="w-5 h-5 text-accent" />
                 Résumé de la course
              </h3>
              
              <div className="space-y-6">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-3 h-3 bg-accent2 rounded-full border-2 border-background z-10" />
                  <div className="absolute left-[5px] top-4 w-px h-10 bg-white/10" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{t('user.booking.pickup')}</p>
                  <p className="text-sm font-bold text-foreground line-clamp-1">{pickup}</p>
                </div>
                
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-3 h-3 bg-accent rounded-full border-2 border-background z-10 shadow-[0_0_10px_rgba(230,32,87,0.5)]" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{t('user.booking.destination')}</p>
                  <p className="text-sm font-bold text-foreground line-clamp-1">{destination}</p>
                </div>

                <div className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/5 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                       <span className="text-2xl">{selectedVT.icon}</span>
                    </div>
                    <p className="text-sm font-black text-white">{selectedVT.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Type</p>
                    <p className="text-xs font-bold text-accent">Premium</p>
                  </div>
                </div>
                
                <div className="pt-8 mt-4 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-2 py-0.5 bg-accent/10 border border-accent/20 rounded text-[9px] font-black text-accent uppercase">{distanceKm.toFixed(1)} km</span>
                       {bookingType === 'shared' && <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[9px] font-black text-green-500 uppercase tracking-tighter italic">Eco Score A+</span>}
                    </div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">{t('user.booking.total')}</p>
                    <p className="font-extrabold text-4xl text-gradient tracking-tighter">{calculatePrice(selectedVT.price)} <span className="text-xs">CFA</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-accent font-black uppercase tracking-widest mb-1 italic">{t('user.booking.eta')}</p>
                    <p className="text-lg text-foreground font-black tracking-tight flex items-center justify-end gap-1">
                      {Math.ceil(durationMin * (selectedVT.label === 'Moto' ? 0.8 : 1.0))} <span className="text-xs text-white/40">MIN</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-8">
              <button
                onClick={handleConfirm}
                className="w-full py-6 rounded-[28px] gradient-accent text-white font-black text-lg uppercase tracking-widest tap-target shadow-[0_20px_50px_-10px_rgba(230,32,87,0.5)] active:scale-[0.98] transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-110 transition-transform origin-center blur-2xl" />
                <span className="relative z-10">{t('user.booking.confirmBooking')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Navigation Bottom Padding ── */}
      <div className="h-20" />
    </div>
  );
};

export default UserBooking;
