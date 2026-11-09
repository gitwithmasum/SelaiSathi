import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme/colors.js';
import { typography } from '../../../src/theme/typography.js';
import { Card } from '../../../src/components/ui/Card.js';
import { Badge } from '../../../src/components/ui/Badge.js';
import { Input } from '../../../src/components/ui/Input.js';
import api from '../../../src/services/api.js';

export default function OrderListScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');

  const STAGE_FILTERS = [
    { key: 'ALL', label: 'সকল' },
    { key: 'FABRIC_RECEIVED', label: 'কাপড় গ্রহণ' },
    { key: 'CUTTING', label: 'কাটিং' },
    { key: 'STITCHING', label: 'সেলাই' },
    { key: 'READY', label: 'রেডি' },
    { key: 'DELIVERED', label: 'ডেলিভারি' },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = '/orders?limit=50';
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setOrders(res.data.data || []);
      }
    } catch {
      // Mock fallback data
      setOrders([
        {
          id: '1',
          orderNo: 'SS-2026-0001',
          fabricTagCode: 'TAG-001',
          priority: 'URGENT',
          deliveryDate: new Date().toISOString(),
          totalPrice: 850,
          advancePaid: 300,
          customer: { name: 'রফিকুল ইসলাম', phone: '01711223344' },
          items: [{ garmentType: { nameBn: 'পাঞ্জাবি' }, stage: 'STITCHING' }],
        },
        {
          id: '2',
          orderNo: 'SS-2026-0002',
          fabricTagCode: 'TAG-002',
          priority: 'NORMAL',
          deliveryDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          totalPrice: 1200,
          advancePaid: 1200,
          customer: { name: 'মোস্তাফিজুর রহমান', phone: '01811554433' },
          items: [
            { garmentType: { nameBn: 'শার্ট' }, stage: 'READY' },
            { garmentType: { nameBn: 'প্যান্ট' }, stage: 'READY' },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedStage === 'ALL') return true;
    return order.items?.some((i: any) => i.stage === selectedStage);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>অর্ডার তালিকা (Orders)</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tailor)/orders/new')}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ নতুন অর্ডার</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="অর্ডার নং, কাস্টমারের নাম বা ট্যাগ খুঁজুন..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Stage Filter Pills */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STAGE_FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedStage(item.key)}
              style={[
                styles.filterPill,
                selectedStage === item.key ? styles.filterPillActive : {},
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedStage === item.key ? styles.filterPillTextActive : {},
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>কোনো অর্ডার পাওয়া যায়নি</Text>
          </View>
        }
        renderItem={({ item }) => {
          const total = Number(item.totalPrice || 0);
          const advance = Number(item.advancePaid || 0);
          const due = Math.max(0, total - advance);
          const mainStage = item.items?.[0]?.stage || 'FABRIC_RECEIVED';

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/(tailor)/orders/${item.id}` as any)}
            >
              <Card style={styles.orderCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.orderNoRow}>
                    <Text style={styles.orderNo}>{item.orderNo}</Text>
                    {item.priority === 'URGENT' && (
                      <Badge label="জরুরি ⚡" variant="danger" />
                    )}
                  </View>
                  <Text style={styles.fabricTag}>📌 {item.fabricTagCode}</Text>
                </View>

                <View style={styles.customerRow}>
                  <Text style={styles.customerName}>{item.customer?.name}</Text>
                  <Text style={styles.customerPhone}>{item.customer?.phone}</Text>
                </View>

                <View style={styles.itemsSummary}>
                  {item.items?.map((it: any, idx: number) => (
                    <Text key={idx} style={styles.itemBadge}>
                      {it.garmentType?.nameBn || 'পোশাক'}
                    </Text>
                  ))}
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.dueLabel}>
                      বাকি: <Text style={styles.dueAmount}>৳ {due}</Text>
                    </Text>
                  </View>
                  <Badge label={mainStage} stage={mainStage} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 8,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: -8,
  },
  filterBar: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNo: {
    ...typography.h3,
    color: colors.primary,
  },
  fabricTag: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.accent,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  customerName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  customerPhone: {
    ...typography.body,
    color: colors.textMuted,
  },
  itemsSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  itemBadge: {
    ...typography.caption,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  dueLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  dueAmount: {
    fontWeight: '700',
    color: colors.danger,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
