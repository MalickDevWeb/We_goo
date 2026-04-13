import type { LucideIcon } from 'lucide-react';
import { Car, Package, CarFront, ShoppingBag, UtensilsCrossed, Hotel } from 'lucide-react';

export type ServiceKey = 'rides' | 'packages' | 'rental' | 'commerce' | 'restaurants' | 'hotels';

export type ServiceItem = {
  key: ServiceKey;
  icon: LucideIcon;
  available: boolean;
  imageSrc: string;
  flag?: string;
};

export const servicesCatalog: ServiceItem[] = [
  { key: 'rides', icon: Car, available: true, imageSrc: '/images/photos/location_voiture.png' },
  { key: 'packages', icon: Package, available: true, imageSrc: '/images/photos/colis.png' },
  { key: 'rental', icon: CarFront, available: true, flag: 'version2_vehicle_rental', imageSrc: '/images/photos/location_voiture_avec_cle.png' },
  { key: 'commerce', icon: ShoppingBag, available: true, flag: 'version2_commerce', imageSrc: '/images/photos/achats_robe.png' },
  {
    key: 'restaurants',
    icon: UtensilsCrossed,
    available: true,
    flag: 'version2_restaurants',
    imageSrc: '/images/photos/achat_restaurant.png',
  },
  { key: 'hotels', icon: Hotel, available: false, flag: 'version2_hotels', imageSrc: '/images/photos/location_immobilier.png' },
];

export function isServiceKey(value: string): value is ServiceKey {
  return servicesCatalog.some((s) => s.key === value);
}

export function getServiceByKey(key: string | undefined) {
  if (!key) return undefined;
  return servicesCatalog.find((s) => s.key === key);
}

