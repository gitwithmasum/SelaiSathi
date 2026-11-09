import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '../../src/theme/colors.js';
import { typography } from '../../src/theme/typography.js';
import { Card } from '../../src/components/ui/Card.js';
import { Badge } from '../../src/components/ui/Badge.js';
import api from '../../src/services/api.js';

export default function PublicOrderTrackScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    api
      .get(`/public/track/${token}`)
      .then((res) => {
        if (res.data?.success) {
          setOrder(res.data.data);
        } else {
          setError('অর্ডারের তথ্য পাওয়া যায়নি');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error?.message || 'অর্ডার লোড করা যায়নি');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>অর্ডারের অবস্থা লোড হচ্ছে...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>🔍</Text>
          <Text style={styles.errorText}>{error || 'অর্ডার পাওয়া যায়নি'}</Text>
          <Text style={styles.errorSub}>অনুগ্রহ করে সঠিক ট্র্যাকিং লিংক ব্যবহার করুন</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Shop Info Header */}
        <Card style={styles.shopCard}>
          <Text style={styles.shopName}>{order.shop?.name}</Text>
          <Text style={styles.shopAddress}>{order.shop?.address}</Text>

          <View style={styles.contactRow}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${order.shop?.phone}`)}
              style={styles.contactBtn}
            >
              <Text style={styles.contactBtnText}>📞 কল করুন</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  `whatsapp://send?phone=${order.shop?.phone?.replace('+', '')}`
                )
              }
              style={[styles.contactBtn, { backgroundColor: '#E8F5E9' }]}
            >
              <Text style={[styles.contactBtnText, { color: '#2E7D32' }]}>
                💬 হোয়াটসঅ্যাপ
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Order Status Card */}
        <Card>
          <View style={styles.orderTop}>
            <View>
              <Text style={styles.orderNo}>{order.orderNo}</Text>
              <Text style={styles.customerGreeting}>
                সম্মানিত গ্রাহক: {order.customerName}
              </Text>
            </View>
            <Badge label={order.status} variant="primary" />
          </View>

          {order.fabricTagCode && (
            <View style={styles.tagBox}>
              <Text style={styles.tagLabel}>কাপড়ের পিন ট্যাগ নং: </Text>
              <Text style={styles.tagCode}>📌 {order.fabricTagCode}</Text>
            </View>
          )}

          <View style={styles.deliveryBox}>
            <Text style={styles.deliveryLabel}>আনুমানিক ডেলিভারি:</Text>
            <Text style={styles.deliveryDate}>
              {new Date(order.deliveryDate).toLocaleDateString('bn-BD')}
            </Text>
          </View>

          {order.delayReason ? (
            <View style={styles.delayBox}>
              <Text style={styles.delayText}>
                ⚠️ ডেলিভারি পেছানো হয়েছে: {order.delayReason}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Item Stages */}
        <Card>
          <Text style={styles.sectionTitle}>পোশাকের বর্তমান অবস্থা</Text>
          {order.items?.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <View>
                <Text style={styles.itemName}>{item.garmentType?.nameBn}</Text>
                <Text style={styles.itemQty}>পরিমাণ: {item.quantity} টি</Text>
              </View>
              <Badge label={item.stageLabelBn || item.stage} stage={item.stage} />
            </View>
          ))}
        </Card>

        {/* Financial Summary */}
        <Card>
          <Text style={styles.sectionTitle}>পেমেন্ট বিবরণ</Text>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>মোট বিল:</Text>
            <Text style={styles.financeVal}>৳ {order.financials?.totalPrice}</Text>
          </View>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>পরিশোধিত (জমা):</Text>
            <Text style={[styles.financeVal, { color: colors.success }]}>
              ৳ {order.financials?.totalPaid}
            </Text>
          </View>
          <View style={[styles.financeRow, styles.dueRow]}>
            <Text style={[styles.financeLabel, { fontWeight: '700' }]}>
              বাকি টাকা:
            </Text>
            <Text style={[styles.financeVal, styles.dueVal]}>
              ৳ {order.financials?.dueAmount}
            </Text>
          </View>
        </Card>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    ...typography.h3,
    color: colors.danger,
    marginBottom: 4,
    textAlign: 'center',
  },
  errorSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  shopCard: {
    padding: 18,
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  shopName: {
    ...typography.h2,
    color: colors.primary,
  },
  shopAddress: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactBtnText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primary,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderNo: {
    ...typography.h2,
    color: colors.primary,
  },
  customerGreeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  tagLabel: {
    ...typography.caption,
    color: colors.accent,
  },
  tagCode: {
    ...typography.bodyLarge,
    fontWeight: '800',
    color: colors.accent,
  },
  deliveryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deliveryLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  deliveryDate: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text,
  },
  delayBox: {
    backgroundColor: '#FFF3BF',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  delayText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#D9480F',
  },
  sectionTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  itemQty: {
    ...typography.caption,
    color: colors.textMuted,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  financeLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  financeVal: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  dueRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 6,
    paddingTop: 8,
  },
  dueVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.danger,
  },
});
