import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../src/theme/colors.js';
import { typography } from '../../src/theme/typography.js';
import { Card } from '../../src/components/ui/Card.js';
import { Button } from '../../src/components/ui/Button.js';
import { Input } from '../../src/components/ui/Input.js';
import api from '../../src/services/api.js';

export default function AccountsScreen() {
  const [report, setReport] = useState<any | null>(null);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [savingExpense, setSavingExpense] = useState(false);

  const fetchDailyReport = async () => {
    try {
      const res = await api.get('/payments/reports/daily');
      if (res.data?.success) {
        setReport(res.data.data);
      }
    } catch {
      // Mock fallback
      setReport({
        totalIncome: 4200,
        totalExpense: 850,
        netProfit: 3350,
        methodBreakdown: {
          CASH: 2700,
          BKASH: 1500,
        },
      });
    }
  };

  useEffect(() => {
    fetchDailyReport();
  }, []);

  const handleAddExpense = async () => {
    if (!expenseCategory.trim() || !expenseAmount.trim()) {
      Alert.alert('ত্রুটি', 'খরচের খাত ও পরিমাণ পূরণ করুন');
      return;
    }

    setSavingExpense(true);
    try {
      const res = await api.post('/payments/expenses', {
        category: expenseCategory.trim(),
        amount: parseFloat(expenseAmount) || 0,
      });

      if (res.data?.success) {
        Alert.alert('সফল', 'খরচের হিসাব যুক্ত হয়েছে!');
        setExpenseCategory('');
        setExpenseAmount('');
        fetchDailyReport();
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'খরচ যোগ করা যায়নি');
    } finally {
      setSavingExpense(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>হিসাব ও রিপোর্ট (Accounts)</Text>

        {/* Daily Financial Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>আজকের আয়-ব্যয় চিত্র</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>মোট জমা (আয়)</Text>
              <Text style={[styles.summaryVal, { color: colors.success }]}>
                ৳ {report?.totalIncome || 0}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>মোট খরচ</Text>
              <Text style={[styles.summaryVal, { color: colors.danger }]}>
                ৳ {report?.totalExpense || 0}
              </Text>
            </View>
          </View>

          <View style={styles.netProfitBox}>
            <Text style={styles.netProfitLabel}>আজকের নীট লাভ:</Text>
            <Text style={styles.netProfitVal}>
              ৳ {report?.netProfit || 0}
            </Text>
          </View>
        </Card>

        {/* Payment Methods Breakdown */}
        <Card>
          <Text style={styles.sectionTitle}>পেমেন্ট মেথড অনুযায়ী জমা</Text>
          <View style={styles.methodRow}>
            <Text style={styles.methodName}>💵 ক্যাশ (Cash):</Text>
            <Text style={styles.methodAmount}>
              ৳ {report?.methodBreakdown?.CASH || 0}
            </Text>
          </View>
          <View style={styles.methodRow}>
            <Text style={styles.methodName}>📱 বিকাশ (bKash):</Text>
            <Text style={styles.methodAmount}>
              ৳ {report?.methodBreakdown?.BKASH || 0}
            </Text>
          </View>
        </Card>

        {/* Add Expense Form */}
        <Card>
          <Text style={styles.sectionTitle}>দোকানের খরচ যোগ করুন (Expense)</Text>

          <Input
            label="খরচের খাত *"
            placeholder="যেমন: সুতা, বোতাম, দোকান ভাড়া, চা-নাস্তা"
            value={expenseCategory}
            onChangeText={setExpenseCategory}
          />

          <Input
            label="টাকার পরিমাণ *"
            placeholder="যেমন: 250"
            keyboardType="numeric"
            value={expenseAmount}
            onChangeText={setExpenseAmount}
          />

          <Button
            title="খরচ সেভ করুন"
            onPress={handleAddExpense}
            loading={savingExpense}
            style={styles.addExpenseBtn}
          />
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
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 16,
  },
  summaryCard: {
    padding: 18,
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  summaryTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryItem: {
    width: '48%',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryVal: {
    fontSize: 22,
    fontWeight: '800',
  },
  netProfitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.primary,
    paddingTop: 10,
  },
  netProfitLabel: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primary,
  },
  netProfitVal: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
  },
  sectionTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  methodName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  methodAmount: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  addExpenseBtn: {
    marginTop: 6,
  },
});
