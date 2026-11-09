import { create } from 'zustand';
import api from '../services/api.js';
import { storage } from '../services/storage.js';

export type UserRole = 'TAILOR' | 'CUSTOMER' | 'WORKER';

export interface User {
  id: string;
  phone: string;
  name: string | null;
  avatarUrl: string | null;
  roles: UserRole[];
  currentRole: UserRole;
  tailorProfile?: any;
  customerProfile?: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentRole: UserRole | null;

  // Actions
  loadUser: () => Promise<void>;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ isNewUser: boolean }>;
  selectRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  currentRole: null,

  loadUser: async () => {
    try {
      const token = await storage.getAccessToken();
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const res = await api.get('/users/profile');
      if (res.data?.success) {
        const userData = res.data.data;
        set({
          user: userData,
          isAuthenticated: true,
          currentRole: userData.currentRole,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  sendOtp: async (phone: string) => {
    const res = await api.post('/auth/send-otp', { phone });
    return {
      success: res.data.success,
      message: res.data.data?.message || 'OTP পাঠানো হয়েছে',
    };
  },

  verifyOtp: async (phone: string, otp: string) => {
    const res = await api.post('/auth/verify-otp', { phone, otp });
    const { user, tokens, isNewUser } = res.data.data;

    await storage.setAccessToken(tokens.accessToken);
    await storage.setRefreshToken(tokens.refreshToken);
    await storage.setUserData(user);

    set({
      user,
      isAuthenticated: true,
      currentRole: user.currentRole,
    });

    return { isNewUser };
  },

  selectRole: async (role: UserRole) => {
    const res = await api.post('/auth/select-role', { role });
    const { user, tokens } = res.data.data;

    await storage.setAccessToken(tokens.accessToken);
    await storage.setRefreshToken(tokens.refreshToken);
    await storage.setUserData(user);

    set({
      user,
      currentRole: role,
    });
  },

  logout: async () => {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      await storage.clearAuth();
      set({ user: null, isAuthenticated: false, currentRole: null });
    }
  },
}));
