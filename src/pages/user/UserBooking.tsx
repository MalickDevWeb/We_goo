import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Star, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const { session } = useAuthStore();
  
  const [pickup, setPickup] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [activeField, setActiveField] = useState<'pickup' | 'destination' | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [step, setStep] = useState<'address' | 'vehicle' | 'confirm'>('address');

  useEffect(() => {
    api.getVehicleTypes().then(setVehicleTypes);
    api.getSavedPlaces().then(setSavedPlaces);
  }, []);

  // Fetch real route when both coordinates are set
  useEffect(() => {
    if (pickupCoords && destinationCoords) {
      getRealRoute(pickupCoords, destinationCoords).then(setRoutePoints).catch(console.error);
    } else {
      setRoutePoints([]);
    }
  }, [pickupCoords, destinationCoords]);

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

  const selectedVT = vehicleTypes.find(v => v.id === selectedVehicle);

  const handleConfirm = async () => {
    if (!session || !selectedVT) return;
    await api.createRide({
      userId: session.id,
      from: pickup,
      to: destination,
      status: 'accepted',
      amount: selectedVT.price,
      date: new Date().toISOString().split('T')[0],
      vehicleTypeId: selectedVT.id,
      etaMin: parseInt(selectedVT.time) || 10,
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

      {step === 'vehicle' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-foreground">{t('user.booking.chooseVehicle')}</p>
            <button onClick={() => setStep('address')} className="text-xs text-accent font-medium">Cambiar ruta</button>
          </div>
          {vehicleTypes.map(vt => (
            <button
              key={vt.id}
              onClick={() => setSelectedVehicle(vt.id)}
              className={`w-full glass rounded-2xl p-4 flex items-center justify-between tap-target transition-all ${selectedVehicle === vt.id ? 'border-accent ring-2 ring-accent/20' : ''}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl filter drop-shadow-sm">{vt.icon}</span>
                <div className="text-left">
                  <p className="font-bold text-foreground text-base">{vt.label}</p>
                  <p className="text-xs text-muted-foreground">{vt.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-foreground">${vt.price}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Efectivo/Wallet</p>
              </div>
            </button>
          ))}
          <button
            onClick={() => setStep('confirm')}
            disabled={!selectedVehicle}
            className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-bold tap-target disabled:opacity-40 shadow-lg shadow-accent/20 mt-6"
          >
            {t('common.next')}
          </button>
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
                <span className="text-muted-foreground font-medium">{t('user.booking.chooseVehicle')}</span>
                <span className="text-foreground font-bold">{selectedVT.icon} {selectedVT.label}</span>
              </div>
              
              <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{t('user.booking.total')}</p>
                  <p className="font-extrabold text-3xl text-gradient">${selectedVT.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-accent font-bold mb-1">{t('user.booking.eta')}</p>
                  <p className="text-sm text-foreground font-bold">{selectedVT.time}</p>
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
