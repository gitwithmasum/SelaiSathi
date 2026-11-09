import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { colors } from '../../src/theme/colors.js';
import { typography } from '../../src/theme/typography.js';
import { Card } from '../../src/components/ui/Card.js';
import api from '../../src/services/api.js';

export default function CustomerMeasurementsScreen() {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMeasurements = async () => {
    try {
      const res = await api.get('/portal/my/measurements');
      if (res.data?.success) {
        setMeasurements(res.data.data || []);
      }
    } catch {
      // Mock fallback
      setMeasurements([
        {
          id: 'm1',
          unit: 'INCH',
          version: 1,
          takenAt: new Date().toISOString(),
          garmentType: { nameBn: 'পাঞ্জাবি' },
          tailorCustomer: { tailor: { shopName: 'নিউ ফ্যাশন টেইলার্স' } },
          values: {
            length: 42,
            chest: 38,
            shoulder: 18,
            sleeve: 24.5,
            collar: 15.5,
          },
        },
      ]);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMeasurements();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>আমার মাপসমূহ (My Measurements)</Text>
        <Text style={styles.subtitle}>
          আপনার টেইলারের নেওয়া ডিজিটাল মাপ (সুরক্ষিত ও শুধু দেখার জন্য)
        </Text>
      </View>

      <FlatList
        data={measurements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📏</Text>
            <Text style={styles.emptyTitle}>কোনো মাপ এখনো যুক্ত করা হয়নি</Text>
            <Text style={styles.emptySubtitle}>
              আপনার টেইলার দোকানে মাপ নিলে তা স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.garmentName}>{item.garmentType?.nameBn}</Text>
                <Text style={styles.shopName}>
                  দোকান: {item.tailorCustomer?.tailor?.shopName}
                </Text>
              </View>
              <Text style={styles.versionBadge}>ভার্সন {item.version}</Text>
            </View>

            <View style={styles.valuesGrid}>
              {Object.entries(item.values || {}).map(([key, val]) => (
                <View key={key} style={styles.valueItem}>
                  <Text style={styles.fieldKey}>{key}:</Text>
                  <Text style={styles.fieldVal}>
                    {val as any} {item.unit === 'INCH' ? 'ইঞ্চি' : 'সেমি'}
                  </Text>
                </View>
              ))}
            </View>

            {item.note ? (
              <Text style={styles.noteText}>📝 নোট: {item.note}</Text>
            ) : null}
          </Card>
        )}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 8,
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
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  garmentName: {
    ...typography.h3,
    color: colors.primary,
  },
  shopName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  versionBadge: {
    ...typography.caption,
    fontWeight: '700',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    color: colors.textMuted,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  valueItem: {
    width: '48%',
    backgroundColor: colors.surfaceAlt,
    padding: 8,
    borderRadius: 8,
  },
  fieldKey: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  fieldVal: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  noteText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
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
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
