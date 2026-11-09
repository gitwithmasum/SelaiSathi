import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { colors } from '../../src/theme/colors.js';
import { typography } from '../../src/theme/typography.js';
import { Card } from '../../src/components/ui/Card.js';
import { Badge } from '../../src/components/ui/Badge.js';
import api from '../../src/services/api.js';
import { MfsCheckoutModal } from '../../src/components/payments/MfsCheckoutModal.js';
import { ReviewModal } from '../../src/components/reviews/ReviewModal.js';

export default function CustomerOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [mfsModalVisible, setMfsModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/portal/my/orders');
      if (res.data?.success) {
        setOrders(res.data.data || []);
      }
    } catch {
      // Mock fallback
      setOrders([
        {
          id: 'ord1',
          orderNo: 'SS-2026-0001',
          totalPrice: 850,
          advancePaid: 300,
          status: 'IN_PROGRESS',
          deliveryDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          tailor: {
            shopName: 'নিউ ফ্যাশন টেইলার্স',
            address: 'নিউমার্কেট, ঢাকা',
            shopCode: 'SS-1024',
          },
          items: [
            {
              garmentType: { nameBn: 'পাঞ্জাবি' },
              stage: 'STITCHING',
            },
          ],
        },
        {
          id: 'ord2',
          orderNo: 'SS-2026-0002',
          totalPrice: 1200,
          advancePaid: 1200,
          status: 'DELIVERED',
          deliveryDate: new Date(Date.now() - 86400000 * 2).toISOString(),
          tailor: {
            shopName: 'রয়েল টেইলার্স',
            address: 'ধানমন্ডি, ঢাকা',
            shopCode: 'SS-1008',
          },
          items: [
            {
              garmentType: { nameBn: 'স্যুট / ব্লেজার' },
              stage: 'DELIVERED',
            },
          ],
        },
      ]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getProgressPercent = (stage: string) => {
    switch (stage) {
      case 'FABRIC_RECEIVED':
        return 20;
      case 'CUTTING':
        return 40;
      case 'STITCHING':
        return 65;
      case 'FINISHING_IRONING':
        return 80;
      case 'READY':
        return 95;
      case 'DELIVERED':
        return 100;
      default:
        return 20;
    }
  };

  const openMfsCheckout = (order: any) => {
    setSelectedOrder(order);
    setMfsModalVisible(true);
  };

  const openReview = (order: any) => {
    setSelectedOrder(order);
    setReviewModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>আমার অর্ডারসমূহ (My Orders)</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🛍️</Text>
            <Text style={styles.emptyTitle}>আপনার কোনো সক্রিয় অর্ডার নেই</Text>
            <Text style={styles.emptySubtitle}>
              টেইলারের কাছে শপ কোড জেনে যুক্ত হোন বা দোকানে গিয়ে আপনার নম্বর দিন
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const total = Number(item.totalPrice || 0);
          const advance = Number(item.advancePaid || 0);
          const due = Math.max(0, total - advance);
          const mainItem = item.items?.[0] || {};
          const currentStage = mainItem.stage || 'FABRIC_RECEIVED';
          const isDelivered = item.status === 'DELIVERED' || currentStage === 'DELIVERED';
          const progress = getProgressPercent(currentStage);

          return (
            <Card style={styles.orderCard}>
              <View style={styles.shopRow}>
                <View>
                  <Text style={styles.shopName}>{item.tailor?.shopName}</Text>
                  <Text style={styles.orderNo}>অর্ডার: {item.orderNo}</Text>
                </View>
                <Badge label={currentStage} stage={currentStage} />
              </View>

              {/* Visual Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
                <View style={styles.stagesRow}>
                  <Text style={styles.stageName}>কাপড় গ্রহণ</Text>
                  <Text style={styles.stageName}>কাটিং</Text>
                  <Text style={styles.stageName}>সেলাই</Text>
                  <Text style={styles.stageName}>রেডি</Text>
                  <Text style={styles.stageName}>ডেলিভারি</Text>
                </View>
              </View>

              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryLabel}>আনুমানিক ডেলিভারি:</Text>
                <Text style={styles.deliveryDate}>
                  {new Date(item.deliveryDate).toLocaleDateString('bn-BD')}
                </Text>
              </View>

              {/* Finance summary */}
              <View style={styles.financeRow}>
                <Text style={styles.dueLabel}>
                  মোট বিল: ৳{total} | বকেয়া:{' '}
                  <Text style={[styles.dueAmount, due > 0 ? styles.dueTextDanger : styles.dueTextPaid]}>
                    ৳{due}
                  </Text>
                </Text>

                {due > 0 && (
                  <TouchableOpacity
                    style={styles.payOnlineBtn}
                    onPress={() => openMfsCheckout(item)}
                  >
                    <Text style={styles.payOnlineText}>💳 বিকাশ/নগদে পরিশোধ</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Action Buttons Row */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `whatsapp://send?text=আসসালামু আলাইকুম, আমি অর্ডার নং ${item.orderNo} সম্পর্কে জানতে চাই`
                    )
                  }
                  style={styles.chatBtn}
                >
                  <Text style={styles.chatBtnText}>দোকানে মেসেজ 💬</Text>
                </TouchableOpacity>

                {isDelivered && (
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() => openReview(item)}
                  >
                    <Text style={styles.reviewBtnText}>⭐ রিভিউ দিন</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          );
        }}
      />

      {/* MFS Checkout Modal */}
      {selectedOrder && (
        <MfsCheckoutModal
          visible={mfsModalVisible}
          onClose={() => setMfsModalVisible(false)}
          orderId={selectedOrder.id}
          orderNo={selectedOrder.orderNo}
          dueAmount={Math.max(0, Number(selectedOrder.totalPrice || 0) - Number(selectedOrder.advancePaid || 0))}
          onSuccess={() => {
            fetchOrders();
          }}
        />
      )}

      {/* Review Modal */}
      {selectedOrder && (
        <ReviewModal
          visible={reviewModalVisible}
          onClose={() => setReviewModalVisible(false)}
          orderId={selectedOrder.id}
          orderNo={selectedOrder.orderNo}
          tailorName={selectedOrder.tailor?.shopName}
          onSuccess={() => {
            fetchOrders();
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 8,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    padding: 16,
    marginBottom: 16,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shopName: {
    ...typography.h3,
    color: colors.primary,
  },
  orderNo: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  stagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  stageName: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  deliveryRow: {
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
  financeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dueLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  dueAmount: {
    fontWeight: '700',
  },
  dueTextDanger: {
    color: colors.danger,
  },
  dueTextPaid: {
    color: colors.success,
  },
  payOnlineBtn: {
    backgroundColor: '#D12053',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  payOnlineText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  chatBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chatBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  reviewBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#B45309',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
