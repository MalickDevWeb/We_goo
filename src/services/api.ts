import type { User, Driver, Ride, Transaction, VehicleType, SavedPlace, Stand, AdminStand, SuperAdmin, PlatformStats, FeatureFlags, Settings } from '@/types';
import {
  mockUsers, mockDrivers, mockRides, mockTransactions, mockVehicleTypes,
  mockSavedPlaces, mockStands, mockAdminStands, mockSuperAdmins,
  mockPlatformStats, mockFeatureFlags, mockSettings
} from './mockData';
import type { Order } from '@/types/index';

// In-memory DB (clone of mock data for mutations)
// Persist in-memory DB to localStorage for a "real" feel
const getStoredDb = () => {
  try {
    const stored = localStorage.getItem('wego-db');
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error('DB Persistence error', e); }
  return null;
};

const initialDb = getStoredDb() || {
  users: structuredClone(mockUsers),
  drivers: structuredClone(mockDrivers),
  rides: structuredClone(mockRides),
  transactions: structuredClone(mockTransactions),
  reports: [] as { userId: number; reason: string; date: string }[],
  orders: [] as Order[],
  vehicleTypes: structuredClone(mockVehicleTypes),
  savedPlaces: structuredClone(mockSavedPlaces),
  stands: structuredClone(mockStands),
  adminStands: structuredClone(mockAdminStands),
  superAdmins: structuredClone(mockSuperAdmins),
  platformStats: structuredClone(mockPlatformStats),
  featureFlags: structuredClone(mockFeatureFlags),
  settings: structuredClone(mockSettings),
};

const db = initialDb;

const persist = () => {
  try {
    localStorage.setItem('wego-db', JSON.stringify(db));
  } catch (e) { /* Storage full or blocked */ }
};

// Intercept mutations to persist
const wrapMutation = <T extends (...args: any[]) => any>(fn: T): T => {
  return (async (...args: any[]) => {
    const result = await fn(...args);
    persist();
    return result;
  }) as any;
};

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

// ─── Users ───
export const getUsers = async (): Promise<User[]> => { await delay(); return db.users; };
export const getUserByPhone = async (phone: string): Promise<User | undefined> => { await delay(); return db.users.find(u => u.phone === phone); };
export const getUserById = async (id: number): Promise<User | undefined> => { await delay(); return db.users.find(u => u.id === id); };
export const createUser = wrapMutation(async (data: Omit<User, 'id' | 'userType' | 'walletBalance' | 'totalRides' | 'totalSpent'>): Promise<User> => {
  await delay();
  const user: User = { ...data, id: Date.now(), userType: 'user', walletBalance: 0, totalRides: 0, totalSpent: 0, createdAt: new Date().toISOString() };
  db.users.push(user);
  return user;
});
export const updateUser = wrapMutation(async (id: number, patch: Partial<User>): Promise<User> => {
  await delay();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('User not found');
  db.users[idx] = { ...db.users[idx], ...patch };
  return db.users[idx];
});

// ─── Drivers ───
export const getDrivers = async (): Promise<Driver[]> => { await delay(); return db.drivers; };
export const getDriverByPhone = async (phone: string): Promise<Driver | undefined> => { await delay(); return db.drivers.find(d => d.phone === phone); };
export const getDriverById = async (id: number): Promise<Driver | undefined> => { await delay(); return db.drivers.find(d => d.id === id); };
export const createDriver = async (data: Omit<Driver, 'id' | 'userType' | 'rating' | 'totalRides' | 'todayRides' | 'todayEarnings' | 'hoursWorked' | 'isOnline' | 'walletBalance'>): Promise<Driver> => {
  await delay();
  const driver: Driver = { ...data, id: Date.now(), userType: 'driver', rating: 5, totalRides: 0, todayRides: 0, todayEarnings: 0, hoursWorked: 0, isOnline: false, walletBalance: 0, createdAt: new Date().toISOString() };
  db.drivers.push(driver);
  return driver;
};
export const updateDriver = async (id: number, patch: Partial<Driver>): Promise<Driver> => {
  await delay();
  const idx = db.drivers.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('Driver not found');
  db.drivers[idx] = { ...db.drivers[idx], ...patch };
  return db.drivers[idx];
};
export const reportUser = async (userId: number, reason: string): Promise<void> => {
  await delay();
  db.reports.push({ userId, reason, date: new Date().toISOString() });
  const user = db.users.find(u => u.id === userId);
  if (user) {
    const userReports = db.reports.filter(r => r.userId === userId);
    if (userReports.length >= 3) {
      user.blocked = true;
    }
  }
};

// ─── Rides ───
export const getRides = async (): Promise<Ride[]> => { await delay(); return db.rides; };
export const getRidesByUser = async (userId: number): Promise<Ride[]> => { await delay(); return db.rides.filter(r => r.userId === userId); };
export const getRidesByDriver = async (driverId: number): Promise<Ride[]> => { await delay(); return db.rides.filter(r => r.driverId === driverId); };
export const getAvailableRides = async (): Promise<Ride[]> => { await delay(); return db.rides.filter(r => r.status === 'available'); };
export const createRide = wrapMutation(async (data: Omit<Ride, 'id'>): Promise<Ride> => {
  await delay();
  const ride: Ride = { ...data, id: Date.now() };
  db.rides.push(ride);
  return ride;
});
export const updateRide = async (id: number, patch: Partial<Ride>): Promise<Ride> => {
  await delay();
  const idx = db.rides.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Ride not found');
  db.rides[idx] = { ...db.rides[idx], ...patch };
  return db.rides[idx];
};

// ─── Transactions ───
export const getTransactions = async (): Promise<Transaction[]> => { await delay(); return db.transactions; };
export const getTransactionsByUser = async (userId: number): Promise<Transaction[]> => { await delay(); return db.transactions.filter(t => t.userId === userId); };
export const createTransaction = wrapMutation(async (data: Omit<Transaction, 'id'>): Promise<Transaction> => {
  await delay();
  const tx: Transaction = { ...data, id: Date.now() };
  db.transactions.push(tx);
  return tx;
});

// ─── Orders ───
export const getOrdersByUser = async (userId: number): Promise<Order[]> => {
  await delay();
  return db.orders.filter(o => o.userId === userId);
};

export const createOrder = wrapMutation(async (data: Omit<Order, 'id'>): Promise<Order> => {
  await delay();
  const order: Order = { ...data, id: Date.now() };
  db.orders.push(order);
  return order;
});

// ─── Vehicle Types ───
export const getVehicleTypes = async (): Promise<VehicleType[]> => { await delay(); return db.vehicleTypes; };

// ─── Saved Places ───
export const getSavedPlaces = async (): Promise<SavedPlace[]> => { await delay(); return db.savedPlaces; };

// ─── Stands ───
export const getStands = async (): Promise<Stand[]> => { await delay(); return db.stands; };

// ─── Admin Auth ───
export const loginAdminStand = async (email: string, password: string): Promise<AdminStand | null> => {
  await delay();
  return db.adminStands.find(a => a.email === email && a.password === password) || null;
};
export const loginSuperAdmin = async (email: string, password: string): Promise<SuperAdmin | null> => {
  await delay();
  return db.superAdmins.find(a => a.email === email && a.password === password) || null;
};

// ─── Platform ───
export const getPlatformStats = async (): Promise<PlatformStats> => { await delay(); return db.platformStats; };
export const getFeatureFlags = async (): Promise<FeatureFlags> => { await delay(); return db.featureFlags; };
export const updateFeatureFlags = async (patch: Partial<FeatureFlags>): Promise<FeatureFlags> => {
  await delay();
  Object.assign(db.featureFlags, patch);
  return db.featureFlags;
};
export const getSettings = async (): Promise<Settings> => { await delay(); return db.settings; };
export const updateSettings = async (patch: Partial<Settings>): Promise<Settings> => {
  await delay();
  Object.assign(db.settings, patch);
  return db.settings;
};
