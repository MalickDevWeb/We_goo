import type { User, Driver, Ride, Transaction, VehicleType, SavedPlace, Stand, AdminStand, SuperAdmin, PlatformStats, FeatureFlags, Settings, Merchant, Broadcast } from '@/types';

export const mockUsers: User[] = [
  { id: 1, userType: 'user', name: 'María López', phone: '+5491155001234', walletBalance: 2500, totalRides: 12, totalSpent: 3400, createdAt: '2025-01-15' },
  { id: 2, userType: 'user', name: 'Carlos Ruiz', phone: '+5491155005678', walletBalance: 800, totalRides: 5, totalSpent: 1200, createdAt: '2025-02-20' },
  { id: 3, userType: 'user', name: 'Ana García', phone: '+5491155009999', walletBalance: 0, totalRides: 0, totalSpent: 0, blocked: true, createdAt: '2025-03-01' },
  { id: 4, userType: 'user', name: 'Pedro Dual', phone: '+5491155004444', walletBalance: 1500, totalRides: 3, totalSpent: 750, createdAt: '2025-04-01' },
];

export const mockDrivers: Driver[] = [
  { id: 1, userType: 'driver', name: 'Roberto Sánchez', phone: '+5491155001234', rating: 4.8, totalRides: 230, todayRides: 5, todayEarnings: 1200, hoursWorked: 6, isOnline: true, walletBalance: 3500, debt: 200, licenseNumber: 'LIC-001', vehicleBrand: 'Toyota', vehicleModel: 'Corolla', vehiclePlate: 'ABC-123', createdAt: '2024-06-01' },
  { id: 2, userType: 'driver', name: 'Luis Martínez', phone: '+5491155008888', rating: 4.5, totalRides: 150, todayRides: 3, todayEarnings: 800, hoursWorked: 4, isOnline: false, walletBalance: 1200, licenseNumber: 'LIC-002', vehicleBrand: 'Honda', vehicleModel: 'Civic', vehiclePlate: 'DEF-456', createdAt: '2024-08-15' },
  { id: 3, userType: 'driver', name: 'Jorge Méndez', phone: '+5491155007777', rating: 4.9, totalRides: 310, todayRides: 8, todayEarnings: 2100, hoursWorked: 9, isOnline: true, walletBalance: 5000, debt: 0, licenseNumber: 'LIC-003', createdAt: '2024-03-10' },
];

export const mockRides: Ride[] = [
  { id: 1, userId: 1, driverId: 1, from: 'Av. Corrientes 1234', to: 'Palermo Soho', status: 'completed', amount: 450, date: '2025-04-10', distance: '5.2 km', vehicleTypeId: 'standard', etaMin: 12 },
  { id: 2, userId: 1, driverId: 2, from: 'Retiro', to: 'Recoleta', status: 'completed', amount: 320, date: '2025-04-09', distance: '3.1 km', vehicleTypeId: 'standard', etaMin: 8 },
  { id: 3, userId: 2, driverId: 1, from: 'Microcentro', to: 'Puerto Madero', status: 'completed', amount: 280, date: '2025-04-08', distance: '2.5 km', vehicleTypeId: 'eco', etaMin: 7 },
  { id: 4, userId: 1, from: 'San Telmo', to: 'La Boca', status: 'available', amount: 200, date: '2025-04-11', distance: '1.8 km', vehicleTypeId: 'eco', etaMin: 5 },
  { id: 5, userId: 4, driverId: 3, from: 'Belgrano', to: 'Núñez', status: 'in-progress', amount: 380, date: '2025-04-11', distance: '3.8 km', vehicleTypeId: 'premium', etaMin: 10 },
];

export const mockTransactions: Transaction[] = [
  { id: 1, userId: 1, type: 'credit', title: 'Recarga wallet', amount: 1000, date: '2025-04-10', balance: 2500 },
  { id: 2, userId: 1, type: 'debit', title: 'Viaje Corrientes → Palermo', amount: 450, date: '2025-04-10', balance: 1500 },
  { id: 3, userId: 1, type: 'credit', title: 'Recarga wallet', amount: 2000, date: '2025-04-08', balance: 1950 },
  { id: 4, userId: 2, type: 'credit', title: 'Recarga wallet', amount: 1000, date: '2025-04-07', balance: 800 },
  { id: 5, userId: 2, type: 'debit', title: 'Viaje Microcentro → Puerto Madero', amount: 280, date: '2025-04-08', balance: 720 },
];

export const mockVehicleTypes: VehicleType[] = [
  { id: 'eco', label: 'Eco', price: 200, time: '10-15 min', icon: '🚗' },
  { id: 'standard', label: 'Estándar', price: 350, time: '8-12 min', icon: '🚙' },
  { id: 'premium', label: 'Premium', price: 550, time: '5-10 min', icon: '🚘' },
  { id: 'van', label: 'Van', price: 700, time: '12-18 min', icon: '🚐' },
];

export const mockSavedPlaces: SavedPlace[] = [
  { id: 1, name: 'Casa', address: 'Av. Santa Fe 2100, CABA' },
  { id: 2, name: 'Oficina', address: 'Av. Leandro N. Alem 855, CABA' },
  { id: 3, name: 'Gimnasio', address: 'Av. Cabildo 1900, CABA' },
];

export const mockStands: Stand[] = [
  { id: 1, name: 'Stand Centro', location: 'Microcentro, CABA', adminId: 1, driversCount: 15, revenue: 45000 },
  { id: 2, name: 'Stand Norte', location: 'Belgrano, CABA', adminId: 2, driversCount: 10, revenue: 32000 },
];

export const mockAdminStands: AdminStand[] = [
  { id: 1, name: 'Admin Centro', email: 'admin@stand1.com', password: 'admin123', standId: 1 },
  { id: 2, name: 'Admin Norte', email: 'admin@stand2.com', password: 'admin123', standId: 2 },
];

export const mockSuperAdmins: SuperAdmin[] = [
  { id: 1, name: 'Super Admin', email: 'super@wego.com', password: 'admin123' },
];

export const mockPlatformStats: PlatformStats = {
  totalUsers: 4,
  activeDrivers: 2,
  totalStands: 2,
  todayRevenue: 12500,
  totalRides: 5,
  activeRides: 1,
};

export const mockFeatureFlags: FeatureFlags = {
  version2_vehicle_rental: false,
  version2_commerce: false,
  version2_restaurants: false,
  version2_hotels: false,
  version2_logistics: true,
};

export const mockSettings: Settings = {
  commissionRate: 15,
  supportPhone: '+54 11 5555-0000',
  termsUrl: 'https://wego.app/terms',
  privacyUrl: 'https://wego.app/privacy',
};

export const mockMerchants: Merchant[] = [
  { id: 1, name: 'Le Gourmet Plateau', type: 'Restaurant', status: 'pending', revenue: 0, owner: 'Jean K.', phone: '+225 01010101', joinedAt: '2025-04-10' },
  { id: 2, name: 'Hotel de Ville', type: 'Hotel', status: 'active', revenue: 1200000, owner: 'Sarah M.', phone: '+225 02020202', joinedAt: '2025-03-15' },
  { id: 3, name: 'Wego Express Shop', type: 'Commerce', status: 'active', revenue: 450000, owner: 'System', phone: '+225 03030303', joinedAt: '2025-01-20' },
];

export const mockBroadcasts: Broadcast[] = [
  { id: 1, message: 'Welcome to the Wego platform!', target: 'all', sentAt: '2025-04-01T10:00:00Z', sentBy: 'Super Admin' },
  { id: 2, message: 'New driver incentives available.', target: 'driver', sentAt: '2025-04-05T14:30:00Z', sentBy: 'System' },
];

