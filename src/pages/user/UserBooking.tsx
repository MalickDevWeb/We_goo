import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import * as api from '@/services/api';
import type { VehicleType, SavedPlace } from '@/types';
import WegoMap, { pickupIcon, destinationIcon } from '@/components/WegoMap';
import type { MapMarker } from '@/components/WegoMap';

const PICKUP_COORDS: [number, number] = [-34.6037, -58.3816];
const DEST_COORDS: [number, number] = [-34.5875, -58.4108];

const UserBooking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [step, setStep] = useState<'address' | 'vehicle' | 'confirm'>('address');

  useEffect(() => {
    api.getVehicleTypes().then(setVehicleTypes);
    api.getSavedPlaces().then(setSavedPlaces);
  }, []);

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

  // Map markers for address step
  const addressMarkers: MapMarker[] = [];
  if (pickup) addressMarkers.push({ key: 'pickup', position: PICKUP_COORDS, icon: pickupIcon });
  if (destination) addressMarkers.push({ key: 'dest', position: DEST_COORDS, icon: destinationIcon });

  return (
    <div className="safe-top pb-6">
      <h1 className="text-xl font-bold text-foreground pt-6 mb-4 px-6">{t('user.booking.title')}</h1>

      {step === 'address' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Mini map preview */}
          <div className="mx-6 mb-4 rounded-2xl overflow-hidden border border-border">
            <WegoMap
              markers={addressMarkers.length > 0 ? addressMarkers : [{ key: 'center', position: PICKUP_COORDS, icon: pickupIcon }]}
              height="180px"
              routePoints={pickup && destination ? [PICKUP_COORDS, DEST_COORDS] : undefined}
              routeColor="#e62057"
            />
          </div>

          <div className="px-6 space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent2" />
              <input
                value={pickup}
                onChange={e => setPickup(e.target.value)}
                placeholder={t('user.booking.pickupPlaceholder')}
                className="w-full py-4 pl-10 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
              />
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent" />
              <input
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder={t('user.booking.destinationPlaceholder')}
                className="w-full py-4 pl-10 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
              />
            </div>

            <button className="flex items-center gap-2 text-sm text-accent tap-target py-2">
              <Navigation className="w-4 h-4" />{t('user.booking.useMyLocation')}
            </button>

            {savedPlaces.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{t('user.booking.savedPlaces')}</p>
                <div className="space-y-2">
                  {savedPlaces.map(place => (
                    <button
                      key={place.id}
                      onClick={() => setDestination(place.address)}
                      className="w-full glass rounded-xl p-3 flex items-center gap-3 tap-target text-left"
                    >
                      <Star className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{place.name}</p>
                        <p className="text-xs text-muted-foreground">{place.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep('vehicle')}
              disabled={!pickup.trim() || !destination.trim()}
              className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target disabled:opacity-40 mt-4 transition-transform active:scale-[0.98]"
            >
              {t('common.next')}
            </button>
          </div>
        </motion.div>
      )}

      {step === 'vehicle' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 space-y-4">
          <p className="text-sm text-muted-foreground mb-2">{t('user.booking.chooseVehicle')}</p>
          {vehicleTypes.map(vt => (
            <button
              key={vt.id}
              onClick={() => setSelectedVehicle(vt.id)}
              className={`w-full glass rounded-xl p-4 flex items-center justify-between tap-target transition-all ${selectedVehicle === vt.id ? 'border-accent ring-1 ring-accent' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{vt.icon}</span>
                <div className="text-left">
                  <p className="font-medium text-foreground">{vt.label}</p>
                  <p className="text-xs text-muted-foreground">{vt.time}</p>
                </div>
              </div>
              <span className="font-bold text-foreground">${vt.price}</span>
            </button>
          ))}
          <button
            onClick={() => setStep('confirm')}
            disabled={!selectedVehicle}
            className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target disabled:opacity-40 transition-transform active:scale-[0.98]"
          >
            {t('common.next')}
          </button>
        </motion.div>
      )}

      {step === 'confirm' && selectedVT && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 space-y-4">
          {/* Route map */}
          <div className="rounded-2xl overflow-hidden border border-border">
            <WegoMap
              markers={[
                { key: 'pickup', position: PICKUP_COORDS, icon: pickupIcon },
                { key: 'dest', position: DEST_COORDS, icon: destinationIcon },
              ]}
              routePoints={[PICKUP_COORDS, DEST_COORDS]}
              routeColor="#e62057"
              height="160px"
            />
          </div>
          
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">{t('user.booking.priceSummary')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('user.booking.pickup')}</span><span className="text-foreground text-right max-w-[60%]">{pickup}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('user.booking.destination')}</span><span className="text-foreground text-right max-w-[60%]">{destination}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('user.booking.chooseVehicle')}</span><span className="text-foreground">{selectedVT.icon} {selectedVT.label}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('user.booking.eta')}</span><span className="text-foreground">{selectedVT.time}</span></div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">{t('user.booking.total')}</span>
                <span className="font-bold text-xl text-accent">${selectedVT.price}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target transition-transform active:scale-[0.98]"
          >
            {t('user.booking.confirmBooking')}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default UserBooking;
