import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Star, X, Loader2, Users, Car, Clock, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import * as api from '@/services/api';
import { searchLocations, getRealRoute, reverseGeocode, type LocationSuggestion } from '@/services/mapService';
import type { VehicleType, SavedPlace } from '@/types';
import WegoMap, { pickupIcon, destinationIcon } from '@/components/WegoMap';
import type { MapMarker } from '@/components/WegoMap';

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
    // Basic price calculation: base price + 1.2 per km (example)
    if (distanceKm === 0) return basePrice;
    return Math.round(basePrice + (distanceKm * 1.2));
  };

  const handleSearch = async (query: string, field: 'pickup' | 'destination') => {
    if (field === 'pickup') setPickup(query);
    else setDestination(query);
    
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
    if (activeField === 'pickup') {
      setPickup(s.displayName);
      setPickupCoords([s.lat, s.lon]);
    } else {
      setDestination(s.displayName);
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
        setPickup(t('common.loading'));
        try {
          const address = await reverseGeocode(coords[0], coords[1]);
          setPickup(address);
        } catch (err) {
          setPickup("Ubicación actual");
        }
      },
      () => toast.error("Error al obtener ubicación")
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
    <div className="min-h-full safe-top pb-32">
      <h1 className="text-xl font-bold text-foreground pt-10 mb-4 px-6">{t('user.booking.title')}</h1>

      {step === 'address' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mx-6 mb-4 rounded-2xl overflow-hidden border border-border h-[220px] relative">
            <WegoMap
              markers={addressMarkers.length > 0 ? addressMarkers : (pickupCoords ? [{ key: 'p', position: pickupCoords, icon: pickupIcon }] : [])}
              routePoints={routePoints}
              onMapClick={handleMapClick}
            />
            {!pickupCoords && !destinationCoords && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                <p className="text-white text-xs bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  Toca el mapa para elegir destino
                </p>
              </div>
            )}
          </div>

          <div className="px-6 space-y-3">
            <div className="relative z-50">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent2" />
              <input
                value={pickup}
                onChange={e => handleSearch(e.target.value, 'pickup')}
                onFocus={() => setActiveField('pickup')}
                placeholder={t('user.booking.pickupPlaceholder')}
                className="w-full py-4 pl-10 pr-10 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
              />
              {pickup && (
                <button 
                  onClick={() => {setPickup(''); setPickupCoords(null)}} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
                  aria-label="Clear pickup"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative z-40">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent" />
              <input
                value={destination}
                onChange={e => handleSearch(e.target.value, 'destination')}
                onFocus={() => setActiveField('destination')}
                placeholder={t('user.booking.destinationPlaceholder')}
                className="w-full py-4 pl-10 pr-10 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
              />
              {destination && (
                <button 
                  onClick={() => {setDestination(''); setDestinationCoords(null)}} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
                  aria-label="Clear destination"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {(suggestions.length > 0 || loadingSearch) && activeField && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-6 right-6 mt-1 bg-card border border-border rounded-xl overflow-hidden shadow-2xl overflow-y-auto max-h-[200px] z-[1001]"
                >
                  {loadingSearch ? (
                    <div className="p-4 flex justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-accent" />
                    </div>
                  ) : (
                    suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSuggestion(s)}
                        className="w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 text-left"
                      >
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground line-clamp-2">{s.displayName}</span>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center py-1">
              <button 
                onClick={useCurrentLocation}
                className="flex items-center gap-2 text-xs font-semibold text-accent tap-target py-1 px-2 rounded-lg hover:bg-accent/10"
              >
                <Navigation className="w-3.5 h-3.5" />
                {t('user.booking.useMyLocation')}
              </button>
            </div>

            {savedPlaces.length > 0 && !activeField && (
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-3">{t('user.booking.savedPlaces')}</p>
                <div className="space-y-2">
                  {savedPlaces.map(place => (
                    <button
                      key={place.id}
                      onClick={async () => {
                        setDestination(place.address);
                        // We avoid MOCK and use the address to find coords if possible
                        // For saved places we might need a stored lat/lon, but for now we'll search the address
                        setLoadingSearch(true);
                        const results = await searchLocations(place.address);
                        if (results.length > 0) {
                          setDestinationCoords([results[0].lat, results[0].lon]);
                        }
                        setLoadingSearch(false);
                      }}
                      className="w-full glass rounded-xl p-3 flex items-center gap-3 tap-target text-left"
                    >
                      <Star className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{place.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{place.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep('vehicle')}
              disabled={!pickupCoords || !destinationCoords}
              className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-bold tap-target disabled:opacity-40 mt-4 shadow-lg shadow-accent/20"
            >
              {t('common.next')}
            </button>
          </div>
        </motion.div>
      )}

      {step === 'vehicle' && bookingType !== 'shared' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-foreground">{t('user.booking.chooseVehicle')}</p>
            <button onClick={() => setStep('address')} className="text-xs text-accent font-medium">Cambiar ruta</button>
          </div>
          {vehicleTypes.map(vt => {
            // Speed adjustment factor (Moto is faster in traffic)
            const speedFactor = vt.label === 'Moto' ? 0.9 : 1.0;
            const estimatedTime = durationMin > 0 ? Math.ceil(durationMin * speedFactor) : parseInt(vt.time);
            
            return (
              <button
                key={vt.id}
                onClick={() => setSelectedVehicle(vt.id)}
                className={`w-full glass rounded-2xl p-4 flex items-center justify-between tap-target transition-all ${selectedVehicle === vt.id ? 'border-accent ring-2 ring-accent/20' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl filter drop-shadow-sm">{vt.icon}</span>
                  <div className="text-left">
                    <p className="font-bold text-foreground text-base">{vt.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {estimatedTime} min {durationMin > 0 && <span className="text-[10px] text-accent font-bold opacity-60 ml-1">REAL</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-foreground">${calculatePrice(vt.price)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Efectivo/Wallet</p>
                </div>
              </button>
            );
          })}
          <button
            onClick={() => setStep('confirm')}
            disabled={!selectedVehicle}
            className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-bold tap-target disabled:opacity-40 shadow-lg shadow-accent/20 mt-6"
          >
            {t('common.next')}
          </button>
        </motion.div>
      )}

      {step === 'vehicle' && bookingType === 'shared' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-foreground">{sharedState === 'searching' ? 'Analyse du réseau...' : 'Taxi partagé trouvé'}</p>
            <button onClick={() => setStep('address')} className="text-xs text-accent font-medium">Modifier</button>
          </div>
          
          <AnimatePresence mode="wait">
            {sharedState === 'searching' ? (
              <motion.div
                key="searching"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-3xl p-8 flex flex-col items-center justify-center border border-border/40 h-[320px] relative overflow-hidden shadow-xl"
              >
                <div className="absolute inset-0 bg-accent/5 animate-pulse" />
                <div className="relative mb-8 mt-4">
                  <div className="w-24 h-24 rounded-full border border-accent/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border border-accent/40 animate-ping opacity-50" />
                    <div className="w-16 h-16 rounded-full border border-accent/40 flex items-center justify-center bg-accent/5">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-accent animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-foreground mb-3 text-center text-lg">Recherche de trajets...</h3>
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
                        <Car className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-extrabold text-foreground mb-1 text-base leading-tight">Toyota Prius</p>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md inline-flex">
                          <Star className="w-3 h-3 fill-accent" />
                          <span>4.9 (Chauffeur Ali)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-2xl text-accent leading-none mb-1">${Math.round(calculatePrice(2))}</p>
                      <p className="text-[10px] text-foreground font-bold bg-white/10 px-1.5 py-0.5 rounded">ÉCONOMIE 40%</p>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/40 rounded-2xl p-4 mb-5 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Disponibilité à bord</span>
                      <span className="text-xs font-bold text-accent px-2 py-0.5 bg-accent/10 rounded-full">1 PLACE RESTANTE / 4</span>
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
                        <span className="text-[9px] text-muted-foreground font-bold">RAYON D'APPROCHE</span>
                        <span className="text-[11px] font-extrabold text-foreground">&gt; 50m</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center mb-1.5">
                          <Navigation className="w-3 h-3 text-accent" />
                        </div>
                        <span className="text-[9px] text-muted-foreground font-bold">COMPATIBILITÉ</span>
                        <span className="text-[11px] font-extrabold text-foreground text-accent">Route 100%</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center mb-1.5">
                          <Clock className="w-3 h-3 text-accent" />
                        </div>
                        <span className="text-[9px] text-muted-foreground font-bold">PASSAGE DANS</span>
                        <span className="text-[11px] font-extrabold text-foreground">3 min</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                     onClick={() => {
                       setSelectedVehicle('shared');
                       setStep('confirm');
                     }}
                     className="w-full py-4 rounded-2xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 transition-transform group-hover:scale-[1.02]" />
                    <span className="relative z-10 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-2">
                       <Users className="w-5 h-5" />
                       Réserver cette place
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {sharedState === 'found' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 bg-accent/5 border border-accent/20 rounded-xl p-3 flex gap-3 text-[11px] text-muted-foreground leading-relaxed font-medium">
              <Sparkles className="w-5 h-5 text-accent shrink-0" />
              <p>
                <strong>Exécution de l'algorithme :</strong> Le système a détecté de multiples taxis à plus de 50m. Il a <strong>automatiquement favorisé celui avec 3 clients à bord</strong> pour maximiser le remplissage et optimiser l'écologie !
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {step === 'confirm' && selectedVT && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-6 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-border h-[180px]">
            <WegoMap
              markers={addressMarkers}
              routePoints={routePoints}
            />
          </div>
          
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-bold text-foreground text-lg mb-5 border-b border-white/10 pb-3">{t('user.booking.priceSummary')}</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-accent2" />
                  <span className="text-muted-foreground font-medium">{t('user.booking.pickup')}</span>
                </div>
                <span className="text-foreground text-right font-bold line-clamp-1">{pickup}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground font-medium">{t('user.booking.destination')}</span>
                </div>
                <span className="text-foreground text-right font-bold line-clamp-1">{destination}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">{bookingType === 'shared' ? 'Mode' : t('user.booking.chooseVehicle')}</span>
                <span className="text-foreground font-bold">{selectedVT.icon} {selectedVT.label}</span>
              </div>
              
              <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{t('user.booking.total')} ({distanceKm.toFixed(1)} km)</p>
                  <p className="font-extrabold text-3xl text-gradient">${calculatePrice(selectedVT.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-accent font-bold mb-1">{t('user.booking.eta')}</p>
                  <p className="text-sm text-foreground font-bold">
                    {Math.ceil(durationMin * (selectedVT.label === 'Moto' ? 0.9 : 1.0))} min
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            className="w-full py-5 rounded-2xl gradient-accent text-accent-foreground font-extrabold text-lg tap-target shadow-xl shadow-accent/40 active:scale-[0.98] transition-all"
          >
            {t('user.booking.confirmBooking')}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default UserBooking;
