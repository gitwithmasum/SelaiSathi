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
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../src/theme/colors.js';
import { typography } from '../../../src/theme/typography.js';
import { Card } from '../../../src/components/ui/Card.js';
import { Badge } from '../../../src/components/ui/Badge.js';
import { Button } from '../../../src/components/ui/Button.js';
import { ReceiptModal } from '../../../src/components/printer/ReceiptModal.js';
import api from '../../../src/services/api.js';
import whatsappHelper from '../../../src/utils/whatsappHelper.js';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data?.success) {
        setOrder(res.data.data);
      }
    } catch {
      // Mock fallback
      setOrder({
        id,
        orderNo: 'SS-2026-0001',
        fabricTagCode: 'TAG-001',
        status: 'CONFIRMED',
        priority: 'URGENT',
        deliveryDate: new Date().toISOString(),
        totalPrice: 850,
        totalPaid: 300,
        dueAmount: 550,
        trackingUrl: 'https://selaisathi.com/track/xyz123',
        customer: { name: 'রফিকুল ইসলাম', phone: '01711223344' },
        tailor: {
          shopName: 'নিউ ফ্যাশন টেইলার্স',
          address: 'দোকান ১২, নিউমার্কেট, ঢাকা',
          user: { phone: '01700000000' },
        },
        items: [
          {
            id: 'item1',
            garmentType: { nameBn: 'পাঞ্জাবি' },
            stage: 'STITCHING',
            quantity: 1,
            price: 850,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStage = async (itemId: string, newStage: string) => {
    try {
      const res = await api.patch(`/orders/${id}/items/${itemId}/stage`, {
        stage: newStage,
        notifyCustomer: true,
      });
      if (res.data?.success) {
        Alert.alert('সফল', 'কাজের স্টেজ সফলভাবে আপডেট করা হয়েছে!');
        fetchOrder();
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'স্টেজ আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handleShareTracking = async () => {
    if (!order?.trackingUrl) return;
    try {
      await Share.share({
        message: `আসসালামু আলাইকুম ${order.customer?.name}, আপনার অর্ডারের (${order.orderNo}) কাজের অবস্থা লাইভ দেখতে লিংকে ক্লিক করুন: ${order.trackingUrl}`,
      });
    } catch {}
  };

  const handleWhatsAppAction = () => {
    if (!order) return;

    Alert.alert(
      'হোয়াটসঅ্যাপ মেসেজ পাঠান',
      'কোন মেসেজটি পাঠাতে চান নির্বাচন করুন:',
      [
        {
          text: '📋 অর্ডার ইনভয়েস ও ট্র্যাকিং',
          onPress: () => {
            whatsappHelper.sendOrderConfirmation({
              shopName: order.tailor?.shopName || 'টেইলার্স শপ',
              customerName: order.customer?.name || 'সম্মানিত গ্রাহক',
              customerPhone: order.customer?.phone || '',
              orderNo: order.orderNo,
              fabricPinTag: order.fabricTagCode,
              items: (order.items || []).map((it: any) => ({
                name: it.garmentType?.nameBn || 'পোশাক',
                qty: it.quantity,
              })),
              totalPrice: Number(order.totalPrice || 0),
              advancePaid: Number(order.totalPaid || 0),
              dueAmount: Number(order.dueAmount || 0),
              deliveryDate: order.deliveryDate,
              trackingUrl: order.trackingUrl,
            });
          },
        },
        {
          text: '🎉 পোশাক রেডি মেসেজ',
          onPress: () => {
            whatsappHelper.sendOrderReady({
              shopName: order.tailor?.shopName || 'টেইলার্স শপ',
              customerName: order.customer?.name || 'সম্মানিত গ্রাহক',
              customerPhone: order.customer?.phone || '',
              orderNo: order.orderNo,
              dueAmount: Number(order.dueAmount || 0),
              trackingUrl: order.trackingUrl,
            });
          },
        },
        {
          text: '💰 বকেয়া টাকার তাগাদা',
          onPress: () => {
            whatsappHelper.sendDueReminder({
              shopName: order.tailor?.shopName || 'টেইলার্স শপ',
              customerName: order.customer?.name || 'সম্মানিত গ্রাহক',
              customerPhone: order.customer?.phone || '',
              orderNo: order.orderNo,
              dueAmount: Number(order.dueAmount || 0),
              mfsNumber: order.tailor?.user?.phone,
            });
          },
        },
        { text: 'বাতিল', style: 'cancel' },
      ]
    );
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>অর্ডারের তথ্য লোড হচ্ছে...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Prepared data for 58mm POS receipt
  const receiptData = {
    shopName: order.tailor?.shopName || 'সেলাই সাথী পার্টনার',
    address: order.tailor?.address || 'বাংলাদেশ',
    phone: order.tailor?.user?.phone || '০১৭০০০০০০০০',
    orderNo: order.orderNo,
    fabricTagCode: order.fabricTagCode,
    customerName: order.customer?.name || 'সম্মানিত গ্রাহক',
    customerPhone: order.customer?.phone || '',
    deliveryDate: order.deliveryDate,
    items: (order.items || []).map((it: any) => ({
      name: it.garmentType?.nameBn || 'আইটেম',
      quantity: it.quantity || 1,
      price: Number(it.price || 0),
    })),
    totalPrice: Number(order.totalPrice || 0),
    advancePaid: Number(order.totalPaid || 0),
    dueAmount: Number(order.dueAmount || 0),
    trackingUrl: order.trackingUrl,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Summary */}
        <View style={styles.header}>
          <View>
            <Text style={styles.orderNo}>{order.orderNo}</Text>
            {order.fabricTagCode && (
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>📌 পিন ট্যাগ: {order.fabricTagCode}</Text>
              </View>
            )}
          </View>
          <Badge label={order.status} stage={order.status} />
        </View>

        {/* Customer Info Card */}
        <Card>
          <Text style={styles.customerName}>গ্রাহক: {order.customer?.name}</Text>
          <Text style={styles.customerPhone}>মোবাইল: {order.customer?.phone}</Text>

          <View style={styles.customerActionRow}>
            <TouchableOpacity
              onPress={() => Alert.alert('কল', `${order.customer?.phone} এ ডায়াল হচ্ছে`)}
              style={[styles.smallBtn, { backgroundColor: colors.primaryLight }]}
            >
              <Text style={[styles.smallBtnText, { color: colors.primary }]}>
                📞 কল
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleWhatsAppAction}
              style={[styles.smallBtn, { backgroundColor: '#E8F5E9' }]}
            >
              <Text style={[styles.smallBtnText, { color: '#2E7D32' }]}>
                💬 হোয়াটসঅ্যাপ মেনু
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/(tailor)/orders/chat/${order.id}` as any)}
              style={[styles.smallBtn, { backgroundColor: '#E7F5FF' }]}
            >
              <Text style={[styles.smallBtnText, { color: '#1864AB' }]}>
                🎙️ ইন-অ্যাপ চ্যাট
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Order Items & One-tap Stage Progress */}
        <Card>
          <Text style={styles.sectionTitle}>পোশাকের তালিকা ও স্টেজ</Text>
          {order.items?.map((item: any) => (
            <View key={item.id} style={styles.itemBox}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.garmentType?.nameBn}</Text>
                <Badge label={item.stage} stage={item.stage} />
              </View>

              <Text style={styles.stageChangerLabel}>এক ট্যাপে স্টেজ পরিবর্তন করুন:</Text>
              <View style={styles.stageButtonGrid}>
                {['CUTTING', 'STITCHING', 'READY', 'DELIVERED'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => handleUpdateStage(item.id, st)}
                    style={[
                      styles.stagePill,
                      item.stage === st ? styles.stagePillCurrent : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.stagePillText,
                        item.stage === st ? styles.stagePillTextCurrent : {},
                      ]}
                    >
                      {st === 'CUTTING'
                        ? 'কাটিং'
                        : st === 'STITCHING'
                        ? 'সেলাই'
                        : st === 'READY'
                        ? 'রেডি'
                        : 'ডেলিভারি'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </Card>

        {/* Financials & Due Card */}
        <Card>
          <Text style={styles.sectionTitle}>হিসাব-নিকাশ</Text>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>মোট বিল:</Text>
            <Text style={styles.financeValue}>৳ {order.totalPrice}</Text>
          </View>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>জমা (Advance):</Text>
            <Text style={styles.financeValue}>৳ {order.totalPaid}</Text>
          </View>
          <View style={[styles.financeRow, styles.dueRow]}>
            <Text style={[styles.financeLabel, styles.dueLabel]}>মোট বকেয়া:</Text>
            <Text style={[styles.financeValue, styles.dueAmount]}>
              ৳ {order.dueAmount}
            </Text>
          </View>
        </Card>

        {/* Action Buttons: Print Slip & Share Link */}
        <Button
          title="৫৮মিমি থার্মাল মেমো ও প্রিন্ট স্লিপ 🖨️"
          onPress={() => setShowReceipt(true)}
          variant="secondary"
          style={styles.printBtn}
        />

        <Button
          title="কাস্টমারকে ট্র্যাকিং লিংক শেয়ার করুন 📲"
          onPress={handleShareTracking}
          style={styles.shareBtn}
        />

        {/* 58mm POS Receipt Modal */}
        <ReceiptModal
          visible={showReceipt}
          onClose={() => setShowReceipt(false)}
          data={receiptData}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNo: {
    ...typography.h2,
    color: colors.text,
  },
  tagBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  tagText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.accent,
  },
  customerName: {
    ...typography.h3,
    color: colors.text,
  },
  customerPhone: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  customerActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  smallBtnText: {
    ...typography.caption,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  itemBox: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
  },
  stageChangerLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 6,
  },
  stageButtonGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  stagePill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stagePillCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stagePillText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stagePillTextCurrent: {
    color: '#fff',
    fontWeight: '700',
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
  financeValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  dueRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 6,
  },
  dueLabel: {
    fontWeight: '700',
    color: colors.danger,
  },
  dueAmount: {
    ...typography.h3,
    color: colors.danger,
  },
  printBtn: {
    marginBottom: 10,
  },
  shareBtn: {
    marginBottom: 20,
  },
});
