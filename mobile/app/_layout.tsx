import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore.js';
import { colors } from '../src/theme/colors.js';

export default function RootLayout() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/otp" />
        <Stack.Screen name="(auth)/select-role" />
        <Stack.Screen name="(auth)/profile-setup" />
        <Stack.Screen name="(tailor)" />
        <Stack.Screen name="(customer)" />
        <Stack.Screen
          name="track/[token]"
          options={{
            headerShown: true,
            title: 'অর্ডার ট্র্যাকিং (SelaiSathi)',
            headerTintColor: colors.primary,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
