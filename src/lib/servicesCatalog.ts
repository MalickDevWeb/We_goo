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
  { key: 'rides', icon: Car, available: true, imageSrc: '/images/wego/voiture.jpg' },
  { key: 'packages', icon: Package, available: true, imageSrc: '/images/wego/sacs.jpg' },
  { key: 'rental', icon: CarFront, available: false, flag: 'version2_vehicle_rental', imageSrc: '/images/wego/voiture2.jpg' },
  { key: 'commerce', icon: ShoppingBag, available: false, flag: 'version2_commerce', imageSrc: '/images/wego/portable.jpg' },
  {
    key: 'restaurants',
    icon: UtensilsCrossed,
    available: false,
    flag: 'version2_restaurants',
    imageSrc: "/images/wego/Promotions vibrantes pour l'application Wego.png",
  },
  { key: 'hotels', icon: Hotel, available: false, flag: 'version2_hotels', imageSrc: '/images/wego/AF_BRANDING_WEGO_images-000.jpg' },
];

export function isServiceKey(value: string): value is ServiceKey {
  return servicesCatalog.some((s) => s.key === value);
}

export function getServiceByKey(key: string | undefined) {
  if (!key) return undefined;
  return servicesCatalog.find((s) => s.key === key);
}

