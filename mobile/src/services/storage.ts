import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: 'selaisathi_access_token',
  REFRESH_TOKEN: 'selaisathi_refresh_token',
  USER_DATA: 'selaisathi_user_data',
  CURRENT_ROLE: 'selaisathi_current_role',
  OFFLINE_DRAFTS: 'selaisathi_offline_drafts',
};

export const storage = {
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
  },
  async setAccessToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
  },
  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
  },
  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
  },
  async getUserData(): Promise<any | null> {
    const raw = await AsyncStorage.getItem(KEYS.USER_DATA);
    return raw ? JSON.parse(raw) : null;
  },
  async setUserData(user: any): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(user));
  },
  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([
      KEYS.ACCESS_TOKEN,
      KEYS.REFRESH_TOKEN,
      KEYS.USER_DATA,
      KEYS.CURRENT_ROLE,
    ]);
  },
};
