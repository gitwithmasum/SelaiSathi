import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/ui/Button.js';
import { Input } from '../../src/components/ui/Input.js';
import { colors } from '../../src/theme/colors.js';
import { typography } from '../../src/theme/typography.js';
import { useAuthStore } from '../../src/store/authStore.js';

export default function LoginScreen() {
  const router = useRouter();
  const sendOtp = useAuthStore((state) => state.sendOtp);

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setError('');
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setError('মোবাইল নম্বর লিখুন');
      return;
    }

    // Validate BD mobile phone
    if (!/^(?:\+88|88)?(01[3-9]\d{8})$/.test(cleanPhone)) {
      setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(cleanPhone);
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: cleanPhone },
      });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'ওটিপি পাঠানো যায়নি';
      setError(msg);
      Alert.alert('ত্রুটি', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.headerIcon}>📱</Text>
          </View>
          <Text style={styles.title}>লগইন / সাইন আপ</Text>
          <Text style={styles.subtitle}>
            সেলাই সাথী ব্যবহার করতে আপনার মোবাইল নম্বর দিন
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="মোবাইল নম্বর"
            placeholder="01711000000"
            keyboardType="phone-pad"
            maxLength={11}
            value={phone}
            onChangeText={(val) => {
              setPhone(val);
              if (error) setError('');
            }}
            error={error}
            helper="আমরা এই নম্বরে ৬ সংখ্যার ভেরিফিকেশন কোড (OTP) পাঠাবো"
          />

          <Button
            title="ওটিপি (OTP) পাঠান"
            onPress={handleSendOtp}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.termsText}>
            এগিয়ে যাওয়ার মাধ্যমে আপনি সেলাই সাথীর সেবা শর্তাবলী ও গোপনীয়তা নীতি মেনে নিচ্ছেন।
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 34,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginVertical: 20,
  },
  submitBtn: {
    marginTop: 12,
  },
  footer: {
    marginBottom: 16,
  },
  termsText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
