import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { colors } from '../../../src/theme/colors.js';
import { typography } from '../../../src/theme/typography.js';
import { Card } from '../../../src/components/ui/Card.js';
import { Button } from '../../../src/components/ui/Button.js';
import { Input } from '../../../src/components/ui/Input.js';
import api from '../../../src/services/api.js';

export default function WorkersScreen() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New Worker Modal State
  const [workerModalVisible, setWorkerModalVisible] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerSkill, setWorkerSkill] = useState('SEWING_OPERATOR');
  const [savingWorker, setSavingWorker] = useState(false);

  // Khoraki / Advance Payment Modal State
  const [khorakiModalVisible, setKhorakiModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [khorakiAmount, setKhorakiAmount] = useState('');
  const [khorakiNote, setKhorakiNote] = useState('');
  const [savingKhoraki, setSavingKhoraki] = useState(false);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workers');
      if (res.data?.success) {
        setWorkers(res.data.data || []);
      }
    } catch {
      // Mock fallback
      setWorkers([
        {
          id: 'w1',
          name: 'মো. রফিক (কাটিং মাস্টার)',
          phone: '01722334455',
          skill: 'CUTTING_MASTER',
          totalEarned: 3500,
          totalWagePaid: 2000,
          totalAdvanceTaken: 800,
          netDue: 700,
        },
        {
          id: 'w2',
          name: 'আকবর হোসেন (সেলাই কারিগর)',
          phone: '01833445566',
          skill: 'SEWING_OPERATOR',
          totalEarned: 4800,
          totalWagePaid: 3000,
          totalAdvanceTaken: 1200,
          netDue: 600,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleCreateWorker = async () => {
    if (!workerName.trim() || !workerPhone.trim()) {
      Alert.alert('ত্রুটি', 'নাম ও মোবাইল নম্বর দিন');
      return;
    }

    setSavingWorker(true);
    try {
      const res = await api.post('/workers', {
        name: workerName.trim(),
        phone: workerPhone.trim(),
        skill: workerSkill,
      });

      if (res.data?.success) {
        Alert.alert('সফল', 'নতুন কারিগর যোগ করা হয়েছে!');
        setWorkerModalVisible(false);
        setWorkerName('');
        setWorkerPhone('');
        fetchWorkers();
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'যোগ করা যায়নি');
    } finally {
      setSavingWorker(false);
    }
  };

  const handlePayKhoraki = async () => {
    if (!selectedWorker || !khorakiAmount.trim()) {
      Alert.alert('ত্রুটি', 'টাকার পরিমাণ লিখুন');
      return;
    }

    setSavingKhoraki(true);
    try {
      const res = await api.post('/workers/payments', {
        workerId: selectedWorker.id,
        amount: parseFloat(khorakiAmount) || 0,
        type: 'ADVANCE', // খোরাকি
        note: khorakiNote.trim() || 'সাপ্তাহিক খোরাকি',
      });

      if (res.data?.success) {
        Alert.alert('সফল', 'খোরাকি (অগ্রিম) হিসাব সংরক্ষণ করা হয়েছে!');
        setKhorakiModalVisible(false);
        setKhorakiAmount('');
        setKhorakiNote('');
        fetchWorkers();
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'পরিশোধ সংরক্ষণ করা যায়নি');
    } finally {
      setSavingKhoraki(false);
    }
  };

  const getSkillLabel = (skill: string) => {
    switch (skill) {
      case 'CUTTING_MASTER':
        return 'কাটিং মাস্টার ✂️';
      case 'SEWING_OPERATOR':
        return 'সেলাই কারিগর 🧵';
      case 'IRON_FINISHER':
        return 'ইস্ত্রি ও ফিনিশার';
      case 'BUTTON_HANDWORK':
        return 'বোতাম ও হাতের কাজ';
      default:
        return 'অলরাউন্ডার কারিগর';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>কারিগর খাতা (Workers)</Text>
          <Text style={styles.subtitle}>পিস-রেট মজুরি ও সাপ্তাহিক খোরাকি হিসাব</Text>
        </View>
        <TouchableOpacity
          onPress={() => setWorkerModalVisible(true)}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ নতুন কারিগর</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.workerCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.workerName}>{item.name}</Text>
                <Text style={styles.workerPhone}>📱 {item.phone}</Text>
              </View>
              <Text style={styles.skillBadge}>{getSkillLabel(item.skill)}</Text>
            </View>

            {/* Financial Ledger Breakdown */}
            <View style={styles.ledgerGrid}>
              <View style={styles.ledgerItem}>
                <Text style={styles.ledgerLabel}>পিস-রেট আয়:</Text>
                <Text style={styles.ledgerValue}>৳ {item.totalEarned || 0}</Text>
              </View>
              <View style={styles.ledgerItem}>
                <Text style={styles.ledgerLabel}>নেওয়া খোরাকি:</Text>
                <Text style={[styles.ledgerValue, { color: colors.warning }]}>
                  ৳ {item.totalAdvanceTaken || 0}
                </Text>
              </View>
              <View style={styles.ledgerItem}>
                <Text style={styles.ledgerLabel}>নিট পাওনা:</Text>
                <Text style={[styles.ledgerValue, { color: colors.success }]}>
                  ৳ {item.netDue || 0}
                </Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedWorker(item);
                  setKhorakiModalVisible(true);
                }}
                style={styles.khorakiBtn}
              >
                <Text style={styles.khorakiBtnText}>+ খোরাকি (অগ্রিম) দিন</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      {/* Add Worker Modal */}
      <Modal visible={workerModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>নতুন কারিগর যোগ করুন</Text>

            <Input
              label="নাম *"
              placeholder="যেমন: মো. আকবর হোসেন"
              value={workerName}
              onChangeText={setWorkerName}
            />

            <Input
              label="মোবাইল নম্বর *"
              placeholder="01XXXXXXXXX"
              keyboardType="phone-pad"
              maxLength={11}
              value={workerPhone}
              onChangeText={setWorkerPhone}
            />

            <Text style={styles.skillSelectLabel}>দক্ষতা / কাজের পদ:</Text>
            <View style={styles.skillOptions}>
              {[
                { id: 'CUTTING_MASTER', label: 'কাটিং মাস্টার' },
                { id: 'SEWING_OPERATOR', label: 'সেলাই কারিগর' },
                { id: 'BUTTON_HANDWORK', label: 'বোতাম / কাজ' },
              ].map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setWorkerSkill(s.id)}
                  style={[
                    styles.skillChip,
                    workerSkill === s.id ? styles.skillChipActive : {},
                  ]}
                >
                  <Text
                    style={[
                      styles.skillChipText,
                      workerSkill === s.id ? styles.skillChipTextActive : {},
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <Button
                title="বাতিল"
                variant="outline"
                onPress={() => setWorkerModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="সংরক্ষণ করুন"
                onPress={handleCreateWorker}
                loading={savingWorker}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Khoraki / Advance Modal */}
      <Modal visible={khorakiModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              খোরাকি (অগ্রিম) প্রদান — {selectedWorker?.name}
            </Text>

            <Input
              label="টাকার পরিমাণ (৳) *"
              placeholder="যেমন: 500"
              keyboardType="numeric"
              value={khorakiAmount}
              onChangeText={setKhorakiAmount}
            />

            <Input
              label="নোট বা বিবরণ (ঐচ্ছিক)"
              placeholder="যেমন: সাপ্তাহিক হাতখরচ"
              value={khorakiNote}
              onChangeText={setKhorakiNote}
            />

            <View style={styles.modalBtns}>
              <Button
                title="বাতিল"
                variant="outline"
                onPress={() => setKhorakiModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="খোরাকি জমা দিন"
                onPress={handlePayKhoraki}
                loading={savingKhoraki}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
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
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  workerCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  workerName: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
  },
  workerPhone: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  skillBadge: {
    ...typography.caption,
    fontWeight: '700',
    backgroundColor: colors.surfaceAlt,
    color: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ledgerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  ledgerItem: {
    alignItems: 'center',
  },
  ledgerLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  ledgerValue: {
    ...typography.body,
    fontWeight: '800',
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  khorakiBtn: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  khorakiBtnText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 16,
  },
  skillSelectLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  skillOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  skillChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  skillChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  skillChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  skillChipTextActive: {
    color: '#fff',
  },
  modalBtns: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
