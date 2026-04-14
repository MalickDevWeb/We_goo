import { servicesCatalog, getServiceByKey, isServiceKey } from '@/lib/servicesCatalog';
import { ArrowLeft, ArrowRight, MapPin, Package, Car, ShoppingBag, Utensils, Hotel, Clock, Shield, Zap, Navigation, Calendar, Users, Truck } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LocationSearchInput from '@/components/LocationSearchInput';
import { useState } from 'react';

const ServiceDetailsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { serviceKey } = useParams();
  const { session } = useAuthStore();
  const [address, setAddress] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const service = useMemo(() => getServiceByKey(serviceKey), [serviceKey]);
  const safeKey = isServiceKey(serviceKey ?? '') ? serviceKey : servicesCatalog[0].key;

  const handleActionClick = (overrideKey?: string | React.MouseEvent, type?: string) => {
    // If the first argument is an event, we ignore it to prevent string mismatch.
    const keyStr = typeof overrideKey === 'string' ? overrideKey : safeKey;
    if (!session) {
      navigate('/login');
      return;
    }
    const urlParams = type ? `?type=${type}` : '';
    switch (keyStr) {
      case 'rides':
        navigate(`/user/booking${urlParams}`);
        break;
      case 'commerce':
        navigate(`/user/commerce${urlParams}`);
        break;
      case 'packages':
        navigate(`/user/package${urlParams}`);
        break;
      case 'restaurants':
        navigate(`/user/restaurants${urlParams}`);
        break;
      case 'rental':
        navigate(`/user/rental${urlParams}`);
        break;
      default:
        // fallback pour les services pas encore construits
        navigate(`/user/dashboard${urlParams}`);
        break;
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-background safe-top safe-bottom px-6 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="tap-target inline-flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
          {t('common.back', { defaultValue: 'Retour' })}
        </button>
        <div className="mt-6 text-foreground font-semibold">
          {t('common.notFound', { defaultValue: 'Service introuvable.' })}
        </div>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="min-h-[100svh] overflow-x-hidden pb-10 bg-background safe-top safe-bottom">
      <div className="px-6 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="tap-target inline-flex items-center gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back', { defaultValue: 'Retour' })}
        </button>
      </div>

      <div className="px-6">
        <div className="relative overflow-hidden rounded-2xl h-[140px] glass">
          <img src={service.imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          {!service.available && (
            <span className="absolute top-3 right-3 text-[10px] font-bold bg-accent2 text-accent2-foreground px-2 py-0.5 rounded-full">
              {t('services.promo')}
            </span>
          )}
          <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-white/90 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <div className="min-w-0">
                <div className="text-white font-extrabold text-2xl leading-none truncate">
                  {t(`services.${safeKey}.title`)}
                </div>
                <div className="text-white/70 text-sm mt-2 line-clamp-2">
                  {t(`services.${safeKey}.desc`)}
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/70 shrink-0" />
          </div>
        </div>
      </div>

      <div className="px-6 pt-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {servicesCatalog.map((item) => {
            const ItemIcon = item.icon;
            const selected = item.key === safeKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(`/services/${item.key}`)}
                className="shrink-0 tap-target"
              >
                <div className="flex flex-col items-center gap-2 w-[76px]">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border transition-colors ${
                      selected ? 'bg-accent/25 border-accent/60 ring-4 ring-accent/10' : 'bg-transparent border-border/40'
                    }`}
                  >
                    <ItemIcon className={`w-6 h-6 ${selected ? 'text-accent' : 'text-muted-foreground'}`} />
                  </div>
                  <div className={`text-xs font-medium text-center ${selected ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {t(`services.${item.key}.title`)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>



      {/* Contenu spécifique selon le service */}
      <div className="px-6 pt-4 space-y-4">
        {safeKey === 'packages' && (
          <div className="space-y-3">
              <LocationSearchInput
                value={address}
                onChange={setAddress}
                onSelect={(val) => {
                  setAddress(val);
                }}
                placeholder="Où livrez-vous ?"
                label="Destination"
              />
            <button
              type="button"
              onClick={() => handleActionClick('packages', 'standard')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-accent to-accent/80 border border-accent/30 flex items-center gap-4 tap-target shadow-lg shadow-accent/20 mb-3"
            >
              <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-base font-bold text-white truncate">Envoyer un colis (Privé)</div>
                <div className="text-xs text-white/70 line-clamp-1">De particulier à particulier</div>
              </div>
              <ArrowRight className="w-5 h-5 text-white shrink-0 ml-auto" />
            </button>
            <button
              type="button"
              onClick={() => handleActionClick('packages', 'collection')}
              className="w-full p-4 rounded-2xl bg-card border border-border/40 flex items-center gap-4 tap-target mb-3"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-base font-bold text-foreground truncate">Organiser une collecte</div>
                <div className="text-xs text-muted-foreground line-clamp-1">Pour marchands et entreprises</div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 ml-auto" />
            </button>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleActionClick('packages', 'standard')} className="p-2 rounded-xl bg-card border border-border/40 flex flex-col items-center gap-1 tap-target">
                <Package className="w-5 h-5 text-accent" />
                <span className="text-xs text-muted-foreground">Petit</span>
              </button>
              <button onClick={() => handleActionClick('packages', 'standard')} className="p-2 rounded-xl bg-card border border-border/40 flex flex-col items-center gap-1 tap-target">
                <Package className="w-5 h-5 text-accent" />
                <span className="text-xs text-muted-foreground">Moyen</span>
              </button>
              <button onClick={() => handleActionClick('packages', 'standard')} className="p-2 rounded-xl bg-card border border-border/40 flex flex-col items-center gap-1 tap-target">
                <Package className="w-5 h-5 text-accent" />
                <span className="text-xs text-muted-foreground">Grand</span>
              </button>
            </div>
          </div>
        )}

        {safeKey === 'rides' && (
          <div className="space-y-3">
              <LocationSearchInput
                value={address}
                onChange={setAddress}
                onSelect={(val) => {
                  setAddress(val);
                }}
                placeholder="Où allez-vous ?"
                label="Destination"
              />
            <button
              type="button"
              onClick={() => handleActionClick('rides', 'private')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-accent to-accent/80 border border-accent/30 flex items-center gap-4 tap-target shadow-lg shadow-accent/20 mb-3"
            >
              <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center shrink-0">
                <Car className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-base font-bold text-white truncate">Taxi Privé</div>
                <div className="text-xs text-white/70 line-clamp-1">Rapide & exclusif</div>
              </div>
              <ArrowRight className="w-5 h-5 text-white shrink-0 ml-auto" />
            </button>
            <button
              type="button"
              onClick={() => handleActionClick('rides', 'shared')}
              className="w-full p-4 rounded-2xl bg-card border border-border/40 flex items-center gap-4 tap-target mb-3"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-base font-bold text-foreground truncate">Taxi Partagé</div>
                <div className="text-xs text-muted-foreground line-clamp-1">Économique & convivial</div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 ml-auto" />
            </button>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleActionClick('rides', 'private')} className="p-2 rounded-xl bg-card border border-border/40 flex flex-col items-center gap-1 tap-target">
                <Car className="w-5 h-5 text-accent" />
                <span className="text-xs text-muted-foreground">Standard</span>
              </button>
              <button onClick={() => handleActionClick('rides', 'private')} className="p-2 rounded-xl bg-card border border-border/40 flex flex-col items-center gap-1 tap-target">
                <Car className="w-5 h-5 text-accent" />
                <span className="text-xs text-muted-foreground">Premium</span>
              </button>
              <button onClick={() => handleActionClick('rides', 'private')} className="p-2 rounded-xl bg-card border border-border/40 flex flex-col items-center gap-1 tap-target">
                <Car className="w-5 h-5 text-accent" />
                <span className="text-xs text-muted-foreground">Van</span>
              </button>
            </div>

          </div>
        )}

        {safeKey === 'rental' && (
          <div className="space-y-3">

            <button
              type="button"
              onClick={() => handleActionClick('rental')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-accent to-accent/80 border border-accent/30 flex items-center gap-4 tap-target shadow-lg shadow-accent/20"
            >
              <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center">
                <Car className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <div className="text-base font-bold text-white">Louer un véhicule</div>
                <div className="text-xs text-white/70">Avec ou sans chauffeur</div>
              </div>
              <ArrowRight className="w-5 h-5 text-white ml-auto" />
            </button>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center justify-center gap-1 p-2 rounded-lg bg-accent/10 text-xs text-accent">
                <Shield className="w-3 h-3" />
                <span>Assurance incluse</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-1 p-2 rounded-lg bg-accent/10 text-xs text-accent">
                <Zap className="w-3 h-3" />
                <span>Livraison rapide</span>
              </div>
            </div>
            <div className="text-sm font-medium text-foreground pt-4">Catégories</div>
            <div className="-mx-6 px-6 overflow-x-auto no-scrollbar">
              <div className="flex gap-2 pb-6">
                {[
                  { name: 'Voiture', icon: '🚗' },
                  { name: 'Moto', icon: '🏍️' },
                  { name: 'Camion', icon: '🚛' },
                  { name: 'Vélo', icon: '🚲' },
                  { name: 'Engin', icon: '🚜' },
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => navigate(`/user/rental?category=${cat.name}`)}
                    className="shrink-0 w-20 p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 tap-target active:scale-95 transition-all"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-tight text-white/40">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {safeKey === 'commerce' && (
          <div className="space-y-3">
            <LocationSearchInput
              value={address}
              onChange={setAddress}
              onSelect={setAddress}
              placeholder="Adresse de livraison"
            />
            <button
              type="button"
              onClick={() => handleActionClick('commerce')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-accent to-accent/80 border border-accent/30 flex items-center gap-4 tap-target shadow-lg shadow-accent/20"
            >
              <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <div className="text-base font-bold text-white">Vos courses en ligne</div>
                <div className="text-xs text-white/70">Livrés chez vous</div>
              </div>
              <ArrowRight className="w-5 h-5 text-white ml-auto" />
            </button>
            <div className="text-sm font-medium text-foreground">Catégories</div>
            <div className="-mx-6 px-6 overflow-x-auto">
              <div className="flex gap-2">
                {[
                  { name: 'Aliment.', icon: '🥬' },
                  { name: 'Vêtements', icon: '👕' },
                  { name: 'Electronique', icon: '📱' },
                  { name: 'Maison', icon: '🏠' },
                  { name: 'Beauté', icon: '💄' },
                  { name: 'Sport', icon: '⚽' },
                  { name: 'Jouets', icon: '🧸' },
                  { name: 'Autre', icon: '📦' },
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => navigate(`/user/commerce?category=${cat.name}`)}
                    className="shrink-0 w-20 p-3 rounded-xl bg-card border border-border/40 flex flex-col items-center gap-1 tap-target"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs font-medium text-foreground">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {safeKey === 'restaurants' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-card border border-border/40 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-accent shrink-0" />
              <input
                type="text"
                placeholder="Adresse de livraison"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => handleActionClick('restaurants')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-accent to-accent/80 border border-accent/30 flex items-center gap-4 tap-target shadow-lg shadow-accent/20"
            >
              <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center">
                <Utensils className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <div className="text-base font-bold text-white">Commander un repas</div>
                <div className="text-xs text-white/70">Des centaines de restaurants</div>
              </div>
              <ArrowRight className="w-5 h-5 text-white ml-auto" />
            </button>
            <div className="text-sm font-medium text-foreground">Catégories</div>
            <div className="-mx-6 px-6 overflow-x-auto">
              <div className="flex gap-2">
                {[
                  { name: 'Burger', icon: '🍔' },
                  { name: 'Pizza', icon: '🍕' },
                  { name: 'Asiatique', icon: '🥡' },
                  { name: 'Indien', icon: '🍛' },
                  { name: 'Kebab', icon: '🥙' },
                  { name: 'Italien', icon: '🍝' },
                  { name: 'Mexicain', icon: '🌮' },
                  { name: 'Autre', icon: '🍽️' },
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => navigate(`/user/restaurants?category=${cat.name}`)}
                    className="shrink-0 w-20 p-3 rounded-xl bg-card border border-border/40 flex flex-col items-center gap-1 tap-target"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs font-medium text-foreground">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {safeKey === 'hotels' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <LocationSearchInput
                value={address}
                onChange={setAddress}
                onSelect={setAddress}
                placeholder="Ville, hôtel..."
                label="Destination"
              />
              <div className="p-3 rounded-xl bg-card border border-border/40">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Dates</span>
                </div>
                <input
                  type="text"
                  placeholder="Arrivée - Départ"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Voyageurs</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground">-</button>
                <span className="text-sm font-medium text-foreground">1</span>
                <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground">+</button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleActionClick('hotels')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-accent to-accent/80 border border-accent/30 flex items-center gap-4 tap-target shadow-lg shadow-accent/20"
            >
              <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center">
                <Hotel className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <div className="text-base font-bold text-white">Voir les hôtels</div>
                <div className="text-xs text-white/70">Meilleurs prix garantis</div>
              </div>
              <ArrowRight className="w-5 h-5 text-white ml-auto" />
            </button>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center justify-center gap-1 p-2 rounded-lg bg-accent/10 text-xs text-accent">
                <Shield className="w-3 h-3" />
                <span>Annulation gratuite</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-1 p-2 rounded-lg bg-accent/10 text-xs text-accent">
                <Zap className="w-3 h-3" />
                <span>Réservation instantanée</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
};

export default ServiceDetailsScreen;

