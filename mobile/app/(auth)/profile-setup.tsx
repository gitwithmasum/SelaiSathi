import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/ui/Button.js';
import { Input } from '../../src/components/ui/Input.js';
import { colors } from '../../src/theme/colors.js';
import { typography } from '../../src/theme/typography.js';
import { useAuthStore } from '../../src/store/authStore.js';
import api from '../../src/services/api.js';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { currentRole, loadUser } = useAuthStore();
  const isTailor = currentRole === 'TAILOR';

  // Tailor fields
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [dailyLimit, setDailyLimit] = useState('15');

  // Customer fields
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};

    if (isTailor) {
      if (!shopName.trim()) errs.shopName = 'দোকানের নাম দিন';
      if (!shopAddress.trim()) errs.shopAddress = 'দোকানের ঠিকানা দিন';
    } else {
      if (!name.trim()) errs.name = 'আপনার নাম লিখুন';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isTailor) {
        await api.post('/users/tailor-profile', {
          shopName: shopName.trim(),
          address: shopAddress.trim(),
          dailyOrderLimit: parseInt(dailyLimit, 10) || 15,
        });
        await loadUser();
        router.replace('/(tailor)/dashboard');
      } else {
        await api.post('/users/customer-profile', {
          name: name.trim(),
        });
        await loadUser();
        router.replace('/(customer)/orders');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'সেটআপ সম্পন্ন করা যায়নি';
      Alert.alert('ত্রুটি', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isTailor ? 'দোকানের তথ্য দিন' : 'আপনার প্রোফাইল সেটআপ'}
          </Text>
          <Text style={styles.subtitle}>
            {isTailor
              ? 'কাস্টমারদের কাছে আপনার দোকানের পরিচয় ও ইউনিক শপ কোড তৈরি করতে তথ্য পূরণ করুন'
              : 'আপনার নাম দিন যাতে টেইলার আপনাকে সহজে চিনতে পারে'}
          </Text>
        </View>

        <View style={styles.form}>
          {isTailor ? (
            <>
              <Input
                label="দোকানের নাম *"
                placeholder="যেমন: নিউ ফ্যাশন টেইলার্স"
                value={shopName}
                onChangeText={setShopName}
                error={errors.shopName}
              />

              <Input
                label="দোকানের ঠিকানা *"
                placeholder="দোকান নং, মার্কেট, এলাকা, জেলা"
                value={shopAddress}
                onChangeText={setShopAddress}
                error={errors.shopAddress}
                multiline
                numberOfLines={3}
              />

              <Input
                label="প্রতিদিন সর্বোচ্চ অর্ডার ডেলিভারি সীমা (পিস)"
                placeholder="15"
                keyboardType="number-pad"
                value={dailyLimit}
                onChangeText={setDailyLimit}
                helper="রমজান বা ঈদের সময় অতিরিক্ত অর্ডার চাপ রোধে এই সংখ্যা সাহায্য করবে"
              />
            </>
          ) : (
            <Input
              label="আপনার সম্পূর্ণ নাম *"
              placeholder="যেমন: তানভীর আহমেদ"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />
          )}

          <Button
            title="সেভ করুন ও শুরু করুন"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 28,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    gap: 4,
  },
  submitBtn: {
    marginTop: 16,
  },
});
