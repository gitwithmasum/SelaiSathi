import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../../src/components/ui/Button.js';
import { Input } from '../../../src/components/ui/Input.js';
import { Card } from '../../../src/components/ui/Card.js';
import { colors } from '../../../src/theme/colors.js';
import { typography } from '../../../src/theme/typography.js';
import api from '../../../src/services/api.js';

export default function NewOrderScreen() {
  const router = useRouter();

  const [customers, setCustomers] = useState<any[]>([]);
  const [garmentTypes, setGarmentTypes] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedGarmentId, setSelectedGarmentId] = useState('');

  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('800');
  const [advance, setAdvance] = useState('300');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState<any | null>(null);

  useEffect(() => {
    // Load customers and garment presets
    Promise.all([
      api.get('/customers'),
      api.get('/measurements/garment-types'),
    ])
      .then(([custRes, typesRes]) => {
        if (custRes.data?.success) setCustomers(custRes.data.data || []);
        if (typesRes.data?.success) {
          const types = typesRes.data.data || [];
          setGarmentTypes(types);
          if (types.length > 0) setSelectedGarmentId(types[0].id);
        }
      })
      .catch(() => {
        // Fallback options
        setGarmentTypes([
          { id: '1', nameBn: 'পাঞ্জাবি' },
          { id: '2', nameBn: 'শার্ট' },
          { id: '3', nameBn: 'প্যান্ট' },
          { id: '4', nameBn: 'সালোয়ার-কামিজ' },
        ]);
        setSelectedGarmentId('1');
      });
  }, []);

  const handleCreateOrder = async () => {
    if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].customerId || customers[0].id);
    }

    setLoading(true);

    try {
      const payload = {
        customerId: selectedCustomerId || (customers[0]?.customerId || customers[0]?.id),
        deliveryDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        priority,
        discount: 0,
        advancePaid: parseFloat(advance) || 0,
        advancePaymentMethod: 'CASH',
        notes: notes.trim(),
        items: [
          {
            garmentTypeId: selectedGarmentId,
            quantity: parseInt(quantity, 10) || 1,
            price: parseFloat(price) || 0,
            fabricSource: 'CUSTOMER',
          },
        ],
      };

      const res = await api.post('/orders', payload);
      if (res.data?.success) {
        setCreatedOrderData(res.data.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'অর্ডার তৈরি করা যায়নি';
      Alert.alert('ত্রুটি', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!createdOrderData?.whatsappText) return;
    try {
      await Share.share({
        message: decodeURIComponent(createdOrderData.whatsappText),
      });
    } catch {}
  };

  if (createdOrderData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>অর্ডার সফলভাবে তৈরি হয়েছে!</Text>
          <Text style={styles.orderNoLabel}>
            অর্ডার নং: {createdOrderData.order?.orderNo}
          </Text>

          {/* Fabric Pin Tag Display */}
          <Card style={styles.tagCard}>
            <Text style={styles.tagCardTitle}>কাপড়ের পিন ট্যাগ (Fabric Pin Tag)</Text>
            <Text style={styles.tagCode}>{createdOrderData.fabricTagCode}</Text>
            <Text style={styles.tagHint}>
              এই ট্যাগটি সেফটি পিন দিয়ে কাস্টমারের কাপড়ে আটকে রাখুন
            </Text>
          </Card>

          {createdOrderData.capacityWarning && (
            <Text style={styles.warningText}>
              {createdOrderData.capacityWarning}
            </Text>
          )}

          <Button
            title="হোয়াটসঅ্যাপে ইনভয়েস পাঠান 💬"
            onPress={handleShareWhatsApp}
            variant="secondary"
            style={styles.shareBtn}
          />

          <Button
            title="অর্ডার তালিকায় যান"
            onPress={() => router.replace('/(tailor)/orders')}
            style={styles.backBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>নতুন অর্ডার তৈরি করুন</Text>

        {/* Customer Select */}
        <Card>
          <Text style={styles.sectionLabel}>১. কাস্টমার নির্বাচন করুন *</Text>
          {customers.length > 0 ? (
            <View style={styles.customerChips}>
              {customers.slice(0, 5).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedCustomerId(c.customerId || c.id)}
                  style={[
                    styles.customerChip,
                    (selectedCustomerId === c.customerId || selectedCustomerId === c.id)
                      ? styles.customerChipActive
                      : {},
                  ]}
                >
                  <Text
                    style={[
                      styles.customerChipText,
                      (selectedCustomerId === c.customerId || selectedCustomerId === c.id)
                        ? styles.customerChipTextActive
                        : {},
                    ]}
                  >
                    {c.customer?.name || c.name} ({c.customer?.phone || c.phone})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noCustText}>
              কোনো কাস্টমার যুক্ত নেই। প্রথমে কাস্টমার যোগ করুন।
            </Text>
          )}
        </Card>

        {/* Garment Select */}
        <Card>
          <Text style={styles.sectionLabel}>২. পোশাকের ধরন নির্বাচন করুন *</Text>
          <View style={styles.garmentGrid}>
            {garmentTypes.map((gt) => (
              <TouchableOpacity
                key={gt.id}
                onPress={() => setSelectedGarmentId(gt.id)}
                style={[
                  styles.garmentPill,
                  selectedGarmentId === gt.id ? styles.garmentPillActive : {},
                ]}
              >
                <Text
                  style={[
                    styles.garmentPillText,
                    selectedGarmentId === gt.id ? styles.garmentPillTextActive : {},
                  ]}
                >
                  {gt.nameBn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Financials & Quantity */}
        <Card>
          <Text style={styles.sectionLabel}>৩. দাম ও অগ্রিম হিসাব</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="পরিমাণ (পিস)"
                keyboardType="number-pad"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="মোট মূল্য (৳)"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </View>

          <Input
            label="অগ্রিম জমা (৳)"
            keyboardType="numeric"
            value={advance}
            onChangeText={setAdvance}
            helper="বাকি থাকবে: ৳ " +
              Math.max(0, (parseFloat(price) || 0) - (parseFloat(advance) || 0))
          />

          <View style={styles.priorityRow}>
            <Text style={styles.priorityLabel}>জরুরি অর্ডার (Urgent)?</Text>
            <TouchableOpacity
              onPress={() =>
                setPriority(priority === 'NORMAL' ? 'URGENT' : 'NORMAL')
              }
              style={[
                styles.priorityToggle,
                priority === 'URGENT' ? styles.priorityUrgent : {},
              ]}
            >
              <Text
                style={[
                  styles.priorityToggleText,
                  priority === 'URGENT' ? { color: '#fff' } : {},
                ]}
              >
                {priority === 'URGENT' ? 'জরুরি ⚡' : 'সাধারণ'}
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label="ডিজাইন বা বিশেষ নোট"
            placeholder="যেমন: ব্যান্ড কলার, বুক পকেট, ডাবল কাফ"
            value={notes}
            onChangeText={setNotes}
          />
        </Card>

        <Button
          title="অর্ডার নিশ্চিত করুন"
          onPress={handleCreateOrder}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 16,
  },
  sectionLabel: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  customerChips: {
    gap: 8,
  },
  customerChip: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customerChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  customerChipText: {
    ...typography.body,
    color: colors.text,
  },
  customerChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  noCustText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  garmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  garmentPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  garmentPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  garmentPillText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  garmentPillTextActive: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  priorityLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  priorityToggle: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityUrgent: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  priorityToggleText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  submitBtn: {
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  successTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: 4,
  },
  orderNoLabel: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  tagCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.accentLight,
    borderColor: colors.accent,
    width: '100%',
    marginBottom: 16,
  },
  tagCardTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 6,
  },
  tagCode: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 2,
    marginBottom: 6,
  },
  tagHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning,
    marginBottom: 16,
    textAlign: 'center',
  },
  shareBtn: {
    width: '100%',
    marginBottom: 12,
  },
  backBtn: {
    width: '100%',
  },
});
