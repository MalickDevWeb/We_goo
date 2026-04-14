export type UserType = 'user' | 'driver' | 'restaurant' | 'hotel' | 'rental' | 'admin-stand' | 'super-admin';

export interface User {
  id: number;
  userType: 'user';
  name: string;
  phone: string;
  email?: string;
  photo?: string;
  walletBalance: number;
  totalRides: number;
  totalSpent: number;
  blocked?: boolean;
  createdAt?: string;
}

export interface Driver {
  id: number;
  userType: 'driver';
  name: string;
  phone: string;
  email?: string;
  photo?: string;
  rating: number;
  totalRides: number;
  todayRides: number;
  todayEarnings: number;
  hoursWorked: number;
  isOnline: boolean;
  walletBalance: number;
  debt?: number;
  blocked?: boolean;
  licenseNumber?: string;
  idNumber?: string;
  licensePhoto?: string;
  idPhoto?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  createdAt?: string;
}

export interface Restaurant {
  id: number;
  userType: 'restaurant';
  name: string;
  ownerName: string;
  phone: string;
  email?: string;
  photo?: string;
  category: string;
  rating: number;
  totalOrders: number;
  todayOrders: number;
  todayEarnings: number;
  isOnline: boolean;
  walletBalance: number;
  location: string;
  openingHours: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  restaurantId: number;
  available: boolean;
  prepTime: string;
}

export type RideStatus = 'available' | 'accepted' | 'arriving' | 'in-progress' | 'completed' | 'cancelled';

export interface Ride {
  id: number;
  userId: number;
  driverId?: number;
  from: string;
  to: string;
  status: RideStatus;
  amount: number;
  date: string;
  pickupCoords?: [number, number];
  destinationCoords?: [number, number];
  distance?: string;
  vehicleTypeId?: string;
  durationMin?: number;
  etaMin?: number;
}

export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: number;
  userId: number;
  type: TransactionType;
  title: string;
  amount: number;
  date: string;
  balance: number;
}

export interface VehicleType {
  id: string;
  label: string;
  price: number;
  time: string;
  icon: string;
}

export interface SavedPlace {
  id: number;
  name: string;
  address: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeDrivers: number;
  totalStands: number;
  todayRevenue: number;
  totalRides: number;
  activeRides: number;
}

export interface FeatureFlags {
  version2_vehicle_rental: boolean;
  version2_commerce: boolean;
  version2_restaurants: boolean;
  version2_hotels: boolean;
  version2_logistics: boolean;
}

export interface Settings {
  commissionRate?: number;
  supportPhone?: string;
  termsUrl?: string;
  privacyUrl?: string;
  [key: string]: unknown;
}

export interface Stand {
  id: number;
  name: string;
  location: string;
  adminId: number;
  driversCount: number;
  revenue: number;
}

export interface AdminStand {
  id: number;
  name: string;
  email: string;
  password: string;
  standId: number;
}

export interface SuperAdmin {
  id: number;
  name: string;
  email: string;
  password: string;
}

export interface AuthSession {
  userType: UserType;
  id: number;
  phone?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled';

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  date: string;
  address: string;
  category: string;
}
