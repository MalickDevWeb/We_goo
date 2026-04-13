import { create } from 'zustand';
import type { AuthSession, UserType, User, Driver } from '@/types';

interface AuthState {
  session: AuthSession | null;
  profile: User | Driver | null;
  isLoading: boolean;
  setSession: (session: AuthSession | null) => void;
  setProfile: (profile: User | Driver | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

const initialSession: AuthSession | null = (() => {
  try {
    const stored = localStorage.getItem('wego-session');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
})();

const initialProfile: User | Driver | null = (() => {
  try {
    const stored = localStorage.getItem('wego-profile');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create<AuthState>((set) => ({
  session: initialSession,
  profile: initialProfile,
  isLoading: false,
  setSession: (session) => {
    try {
      if (session) {
        localStorage.setItem('wego-session', JSON.stringify(session));
      } else {
        localStorage.removeItem('wego-session');
      }
    } catch {
      // Ignore storage errors (private mode / blocked storage)
    }
    set({ session });
  },
  setProfile: (profile) => {
    try {
      if (profile) {
        localStorage.setItem('wego-profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('wego-profile');
      }
    } catch {}
    set({ profile });
  },
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    try {
      localStorage.removeItem('wego-session');
      localStorage.removeItem('wego-profile');
    } catch {
      // Ignore storage errors (private mode / blocked storage)
    }
    set({ session: null, profile: null });
  },
}));
