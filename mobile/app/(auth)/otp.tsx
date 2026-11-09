import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../src/components/ui/Button.js';
import { Input } from '../../src/components/ui/Input.js';
import { colors } from '../../src/theme/colors.js';
import { typography } from '../../src/theme/typography.js';
import { useAuthStore } from '../../src/store/authStore.js';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = params.phone || '';

  const { verifyOtp, sendOtp } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('৬ সংখ্যার সঠিক ওটিপি দিন');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { isNewUser } = await verifyOtp(phone, otp);
      if (isNewUser) {
        router.replace('/(auth)/select-role');
      } else {
        const currentRole = useAuthStore.getState().currentRole;
        if (currentRole === 'TAILOR') {
          router.replace('/(tailor)/dashboard');
        } else {
          router.replace('/(customer)/orders');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'ভুল ওটিপি!';
      setError(msg);
      Alert.alert('ত্রুটি', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await sendOtp(phone);
      setCountdown(60);
      Alert.alert('সফল', 'নতুন ওটিপি কোড পাঠানো হয়েছে');
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'পুনরায় পাঠানো যায়নি');
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
            <Text style={styles.headerIcon}>🔐</Text>
          </View>
          <Text style={styles.title}>কোড যাচাই করুন</Text>
          <Text style={styles.subtitle}>
            {phone} নম্বরে পাঠানো ৬ সংখ্যার কোডটি নিচে দিন
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="● ● ● ● ● ●"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(val) => {
              setOtp(val);
              if (error) setError('');
            }}
            error={error}
            style={styles.otpInput}
          />

          <Button
            title="যাচাই করুন ও এগিয়ে যান"
            onPress={handleVerify}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.resendContainer}>
            {countdown > 0 ? (
              <Text style={styles.countdownText}>
                পুনরায় ওটিপি পাঠাতে অপেক্ষা করুন: {countdown} সেকেন্ড
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendBtnText}>পুনরায় ওটিপি পাঠান</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.changePhoneText}>নম্বর পরিবর্তন করুন</Text>
          </TouchableOpacity>
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
  otpInput: {
    textAlign: 'center',
    letterSpacing: 10,
    fontSize: 24,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 12,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  countdownText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  resendBtnText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  changePhoneText: {
    ...typography.body,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
