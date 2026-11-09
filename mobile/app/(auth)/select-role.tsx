import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/ui/Button.js';
import { colors } from '../../src/theme/colors.js';
import { typography } from '../../src/theme/typography.js';
import { useAuthStore, UserRole } from '../../src/store/authStore.js';

export default function SelectRoleScreen() {
  const router = useRouter();
  const selectRole = useAuthStore((state) => state.selectRole);

  const [selectedRole, setSelectedRole] = useState<UserRole>('TAILOR');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await selectRole(selectedRole);
      if (selectedRole === 'TAILOR') {
        router.replace('/(auth)/profile-setup');
      } else {
        router.replace('/(customer)/orders');
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'রোল নির্বাচন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>আপনার রোল নির্বাচন করুন</Text>
          <Text style={styles.subtitle}>
            আপনি সেলাই সাথী অ্যাপ কীভাবে ব্যবহার করতে চান?
          </Text>
        </View>

        <View style={styles.options}>
          {/* Tailor Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedRole('TAILOR')}
            style={[
              styles.card,
              selectedRole === 'TAILOR' ? styles.selectedCard : {},
            ]}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.cardEmoji}>✂️</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>আমি টেইলার (দর্জি)</Text>
              <Text style={styles.cardDesc}>
                আমার দোকান আছে। মাপের খাতা, অর্ডার, বিল ও কারিগর হিসাব সহজে পরিচালনা করতে চাই।
              </Text>
            </View>
            <View style={styles.radio}>
              {selectedRole === 'TAILOR' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Customer Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedRole('CUSTOMER')}
            style={[
              styles.card,
              selectedRole === 'CUSTOMER' ? styles.selectedCard : {},
            ]}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.cardEmoji}>👔</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>আমি কাস্টমার</Text>
              <Text style={styles.cardDesc}>
                আমার জামা-কাপড়ের মাপ দেখতে চাই এবং অর্ডারের লাইভ ডেলিভারি স্ট্যাটাস জানতে চাই।
              </Text>
            </View>
            <View style={styles.radio}>
              {selectedRole === 'CUSTOMER' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        <Button
          title="এগিয়ে যান"
          onPress={handleContinue}
          loading={loading}
          style={styles.continueBtn}
        />
      </View>
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
    marginTop: 20,
    alignItems: 'center',
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
  },
  options: {
    marginVertical: 20,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardEmoji: {
    fontSize: 26,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  continueBtn: {
    marginBottom: 16,
  },
});
