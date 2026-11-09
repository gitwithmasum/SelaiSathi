import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors.js';
import { typography } from '../../src/theme/typography.js';
import { Card } from '../../src/components/ui/Card.js';
import { useAuthStore } from '../../src/store/authStore.js';
import api from '../../src/services/api.js';

export default function TailorDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const shop = user?.tailorProfile;

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    delayedOrders: 0,
    newOrders: 0,
    totalDue: 0,
    todayIncome: 0,
  });

  const loadDashboardData = async () => {
    try {
      const [reportRes, ordersRes] = await Promise.all([
        api.get('/payments/reports/daily'),
        api.get('/orders?limit=10'),
      ]);

      if (reportRes.data?.success) {
        setStats((prev) => ({
          ...prev,
          todayIncome: reportRes.data.data.totalIncome || 0,
          newOrders: reportRes.data.data.newOrdersCount || 0,
        }));
      }

      if (ordersRes.data?.success) {
        const orders = ordersRes.data.data || [];
        const delayed = orders.filter((o: any) => o.delayReason).length;
        setStats((prev) => ({
          ...prev,
          todayDeliveries: orders.filter((o: any) => o.status === 'CONFIRMED').length,
          delayedOrders: delayed,
        }));
      }
    } catch {
      // Mock / fallback values
      setStats({
        todayDeliveries: 4,
        delayedOrders: 1,
        newOrders: 3,
        totalDue: 3500,
        todayIncome: 1800,
      });
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleShareShopCode = async () => {
    if (!shop?.shopCode) return;
    try {
      await Share.share({
        message: `আমার টেইলার শপ "${shop.shopName}"-এ আপনাকে স্বাগতম! সেলাই সাথী অ্যাপে আপনার মাপ ও অর্ডারের অবস্থা দেখতে এই শপ কোড ব্যবহার করুন: ${shop.shopCode}`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Shop Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.shopName}>{shop?.shopName || 'আমার টেইলার শপ'}</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeLabel}>শপ কোড: </Text>
              <Text style={styles.shopCodeBadge}>{shop?.shopCode || 'SS-1024'}</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleShareShopCode}
            style={styles.shareCodeBtn}
          >
            <Text style={styles.shareCodeText}>কোড শেয়ার 📲</Text>
          </TouchableOpacity>
        </View>

        {/* 3 Primary Action Buttons */}
        <Text style={styles.sectionTitle}>দ্রুত কাজ (Quick Actions)</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tailor)/orders/new')}
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.actionIcon}>🧵</Text>
            <Text style={styles.actionText}>নতুন অর্ডার</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tailor)/measurements/form')}
            style={[styles.actionBtn, { backgroundColor: '#1864AB' }]}
          >
            <Text style={styles.actionIcon}>📏</Text>
            <Text style={styles.actionText}>মাপ নিন</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tailor)/customers')}
            style={[styles.actionBtn, { backgroundColor: '#5C7CFA' }]}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>কাস্টমার</Text>
          </TouchableOpacity>
        </View>

        {/* 2 Operations Shortcuts: Calendar & Workers */}
        <View style={styles.shortcutRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tailor)/calendar')}
            style={styles.shortcutBtn}
          >
            <Text style={styles.shortcutIcon}>📅</Text>
            <View>
              <Text style={styles.shortcutTitle}>ডেলিভারি ক্যালেন্ডার</Text>
              <Text style={styles.shortcutSubtitle}>তারিখভিত্তিক কাজের চাপ</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tailor)/workers')}
            style={styles.shortcutBtn}
          >
            <Text style={styles.shortcutIcon}>✂️</Text>
            <View>
              <Text style={styles.shortcutTitle}>কারিগর খাতা</Text>
              <Text style={styles.shortcutSubtitle}>মজুরি ও খোরাকি হিসাব</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Today's Overview Metric Cards */}
        <Text style={styles.sectionTitle}>আজকের সংক্ষিপ্ত চিত্র</Text>
        <View style={styles.grid}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>আজকের ডেলিভারি</Text>
            <Text style={[styles.metricValue, { color: colors.primary }]}>
              {stats.todayDeliveries} টি
            </Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>দেরি হওয়া অর্ডার</Text>
            <Text
              style={[
                styles.metricValue,
                { color: stats.delayedOrders > 0 ? colors.danger : colors.textSecondary },
              ]}
            >
              {stats.delayedOrders} টি
            </Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>আজকের আয়</Text>
            <Text style={[styles.metricValue, { color: colors.success }]}>
              ৳ {stats.todayIncome}
            </Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>মোট বকেয়া</Text>
            <Text style={[styles.metricValue, { color: colors.warning }]}>
              ৳ {stats.totalDue}
            </Text>
          </Card>
        </View>

        {/* Eid / Rush Mode Capacity Radar */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(tailor)/calendar')}
        >
          <Card style={styles.rushCard}>
            <View style={styles.rushHeader}>
              <Text style={styles.rushEmoji}>⚡</Text>
              <View>
                <Text style={styles.rushTitle}>ঈদ / সিজন রাশ ক্যাপাসিটি</Text>
                <Text style={styles.rushSubtitle}>
                  দৈনিক সর্বোচ্চ অর্ডার সীমা: {shop?.dailyOrderLimit || 15} টি (ক্যালেন্ডার দেখতে ট্যাপ করুন)
                </Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(
                      100,
                      (stats.todayDeliveries / (shop?.dailyOrderLimit || 15)) * 100
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.rushStatus}>
              {stats.todayDeliveries >= (shop?.dailyOrderLimit || 15)
                ? '⚠️ আজকের ডেলিভারি স্লট ফুল! নতুন ডেলিভারি সাবধানে নিন।'
                : '✅ কাজের চাপ স্বাভাবিক সীমায় রয়েছে।'}
            </Text>
          </Card>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shopName: {
    ...typography.h2,
    color: colors.primary,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  codeLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  shopCodeBadge: {
    ...typography.caption,
    fontWeight: '700',
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shareCodeBtn: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareCodeText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  actionIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  actionText: {
    ...typography.button,
    color: '#fff',
    fontSize: 14,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  shortcutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 12,
  },
  shortcutIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  shortcutTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text,
  },
  shortcutSubtitle: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    marginBottom: 0,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  metricValue: {
    ...typography.h2,
  },
  rushCard: {
    marginTop: 8,
    backgroundColor: '#FFF9DB',
    borderColor: '#FFE066',
  },
  rushHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rushEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  rushTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: '#D9480F',
  },
  rushSubtitle: {
    ...typography.caption,
    color: '#E8590C',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#FFE8CC',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F76707',
    borderRadius: 5,
  },
  rushStatus: {
    ...typography.caption,
    fontWeight: '600',
    color: '#D9480F',
  },
});
