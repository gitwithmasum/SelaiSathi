import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore.js';
import { colors } from '../src/theme/colors.js';
import { typography } from '../src/theme/typography.js';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, currentRole, user } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    if (!currentRole) {
      router.replace('/(auth)/select-role');
      return;
    }

    if (currentRole === 'TAILOR') {
      if (!user?.tailorProfile) {
        router.replace('/(auth)/profile-setup');
      } else {
        router.replace('/(tailor)/dashboard');
      }
    } else {
      router.replace('/(customer)/orders');
    }
  }, [isAuthenticated, isLoading, currentRole, user]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoIcon}>🧵</Text>
      </View>
      <Text style={styles.title}>সেলাই সাথী</Text>
      <Text style={styles.subtitle}>মাপ থেকে ডেলিভারি, সব এক অ্যাপে</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 44,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: 6,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  spinner: {
    marginTop: 20,
  },
});
