import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme/colors.js';
import { typography } from '../../../src/theme/typography.js';
import { Card } from '../../../src/components/ui/Card.js';
import { Badge } from '../../../src/components/ui/Badge.js';
import api from '../../../src/services/api.js';

export default function CalendarScreen() {
  const router = useRouter();

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [workloadData, setWorkloadData] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const fetchWorkload = async () => {
    try {
      const res = await api.get(`/calendar/workload?year=${year}&month=${month}`);
      if (res.data?.success) {
        setWorkloadData(res.data.data);
      }
    } catch {
      // Mock fallback
      setWorkloadData({
        dailyOrderLimit: 15,
        workloadByDate: [
          {
            date: selectedDate,
            count: 14,
            isOverloaded: false,
            orders: [
              {
                id: '1',
                orderNo: 'SS-2026-0001',
                priority: 'URGENT',
                fabricTagCode: 'TAG-001',
                customer: { name: 'রফিকুল ইসলাম', phone: '01711223344' },
              },
              {
                id: '2',
                orderNo: 'SS-2026-0002',
                priority: 'NORMAL',
                fabricTagCode: 'TAG-002',
                customer: { name: 'মোস্তাফিজুর রহমান', phone: '01811554433' },
              },
            ],
          },
        ],
        holidays: [{ date: '2026-04-10', reason: 'পবিত্র জুমাতুল বিদা' }],
      });
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, [year, month]);

  const selectedDayData = workloadData?.workloadByDate?.find(
    (d: any) => d.date === selectedDate
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>ক্যালেন্ডার ও কাজের চাপ</Text>
          <Text style={styles.subtitle}>
            ডেলিভারি সিডিউল ও ঈদ রাশ ক্যাপাসিটি রেডার
          </Text>
        </View>

        {/* Month Selector */}
        <Card style={styles.monthCard}>
          <TouchableOpacity
            onPress={() => setMonth((prev) => (prev > 1 ? prev - 1 : 12))}
            style={styles.navBtn}
          >
            <Text style={styles.navIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {month === 1
              ? 'জানুয়ারি'
              : month === 2
              ? 'ফেব্রুয়ারি'
              : month === 3
              ? 'মার্চ'
              : month === 4
              ? 'এপ্রিল'
              : month === 5
              ? 'মে'
              : month === 6
              ? 'জুন'
              : month === 7
              ? 'জুলাই'
              : month === 8
              ? 'আগস্ট'
              : month === 9
              ? 'সেপ্টেম্বর'
              : month === 10
              ? 'অক্টোবর'
              : month === 11
              ? 'নভেম্বর'
              : 'ডিসেম্বর'}{' '}
            {year}
          </Text>
          <TouchableOpacity
            onPress={() => setMonth((prev) => (prev < 12 ? prev + 1 : 1))}
            style={styles.navBtn}
          >
            <Text style={styles.navIcon}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Daily Capacity Status Banner */}
        <Card style={styles.capacityCard}>
          <View style={styles.capacityHeader}>
            <Text style={styles.capacityEmoji}>⚡</Text>
            <View>
              <Text style={styles.capacityTitle}>দৈনিক ডেলিভারি সীমা</Text>
              <Text style={styles.capacitySubtitle}>
                সর্বোচ্চ {workloadData?.dailyOrderLimit || 15} টি অর্ডার / দিন
              </Text>
            </View>
          </View>
        </Card>

        {/* Workload Calendar Dates Grid Preview */}
        <Card>
          <Text style={styles.sectionTitle}>তারিখভিত্তিক কাজের চাপ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {Array.from({ length: 14 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + i);
              const dStr = d.toISOString().split('T')[0];
              const isSelected = selectedDate === dStr;
              const isToday = i === 0;

              return (
                <TouchableOpacity
                  key={dStr}
                  onPress={() => setSelectedDate(dStr)}
                  style={[
                    styles.datePill,
                    isSelected ? styles.datePillActive : {},
                    isToday ? styles.datePillToday : {},
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected ? { color: '#fff' } : {},
                    ]}
                  >
                    {d.toLocaleDateString('bn-BD', { weekday: 'short' })}
                  </Text>
                  <Text
                    style={[
                      styles.dateNum,
                      isSelected ? { color: '#fff' } : {},
                    ]}
                  >
                    {d.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Card>

        {/* Selected Date Orders List */}
        <View style={styles.ordersHeader}>
          <Text style={styles.selectedDateTitle}>
            {new Date(selectedDate).toLocaleDateString('bn-BD', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}{' '}
            এর ডেলিভারি তালিকা ({selectedDayData?.orders?.length || 0} টি):
          </Text>
        </View>

        {selectedDayData?.orders && selectedDayData.orders.length > 0 ? (
          selectedDayData.orders.map((ord: any) => (
            <TouchableOpacity
              key={ord.id}
              activeOpacity={0.8}
              onPress={() => router.push(`/(tailor)/orders/${ord.id}` as any)}
            >
              <Card style={styles.orderCard}>
                <View style={styles.orderRow}>
                  <Text style={styles.orderNo}>{ord.orderNo}</Text>
                  <Text style={styles.fabricTag}>📌 {ord.fabricTagCode}</Text>
                </View>
                <Text style={styles.custName}>{ord.customer?.name}</Text>
                <Text style={styles.custPhone}>{ord.customer?.phone}</Text>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>এই তারিখে কোনো ডেলিভারি নেই।</Text>
          </Card>
        )}
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
  header: {
    marginBottom: 14,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 12,
  },
  navBtn: {
    padding: 8,
  },
  navIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  monthText: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primary,
  },
  capacityCard: {
    backgroundColor: '#FFF9DB',
    borderColor: '#FFE066',
    marginBottom: 12,
  },
  capacityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityEmoji: {
    fontSize: 26,
    marginRight: 10,
  },
  capacityTitle: {
    ...typography.body,
    fontWeight: '700',
    color: '#D9480F',
  },
  capacitySubtitle: {
    ...typography.caption,
    color: '#E8590C',
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  dateScroll: {
    flexDirection: 'row',
  },
  datePill: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    minWidth: 56,
  },
  datePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  datePillToday: {
    borderColor: colors.accent,
  },
  dayText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  ordersHeader: {
    marginTop: 10,
    marginBottom: 10,
  },
  selectedDateTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  orderCard: {
    padding: 14,
    marginBottom: 10,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderNo: {
    ...typography.h3,
    color: colors.primary,
  },
  fabricTag: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.accent,
  },
  custName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  custPhone: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
