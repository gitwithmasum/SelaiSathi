import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Linking,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme/colors.js';
import { typography } from '../../../src/theme/typography.js';
import { Card } from '../../../src/components/ui/Card.js';
import { Input } from '../../../src/components/ui/Input.js';
import { Button } from '../../../src/components/ui/Button.js';
import api from '../../../src/services/api.js';

export default function CustomersScreen() {
  const router = useRouter();

  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // New customer form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    try {
      let url = '/customers?limit=50';
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setCustomers(res.data.data || []);
      }
    } catch {
      // Mock fallback
      setCustomers([
        {
          id: 'c1',
          totalDue: 550,
          tag: 'VIP',
          customer: { name: 'রফিকুল ইসলাম', phone: '01711223344', address: 'ধানমন্ডি, ঢাকা' },
        },
        {
          id: 'c2',
          totalDue: 0,
          tag: 'REGULAR',
          customer: { name: 'মোস্তাফিজুর রহমান', phone: '01811554433', address: 'মিরপুর, ঢাকা' },
        },
      ]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleAddCustomer = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('ত্রুটি', 'নাম ও মোবাইল নম্বর পূরণ করুন');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/customers', {
        name: newName.trim(),
        phone: newPhone.trim(),
        address: newAddress.trim() || undefined,
        sendInviteSms: true,
      });

      if (res.data?.success) {
        Alert.alert('সফল', 'কাস্টমার সফলভাবে যোগ করা হয়েছে এবং ইনভাইটেশন পাঠানো হয়েছে!');
        setModalVisible(false);
        setNewName('');
        setNewPhone('');
        setNewAddress('');
        fetchCustomers();
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'কাস্টমার যোগ করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>কাস্টমার তালিকা (Customers)</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ নতুন কাস্টমার</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Input
          placeholder="কাস্টমারের নাম বা ফোন নম্বর খুঁজুন..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const cust = item.customer || {};
          const due = Number(item.totalDue || 0);

          return (
            <Card style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.custName}>{cust.name}</Text>
                  <Text style={styles.custPhone}>{cust.phone}</Text>
                </View>
                {due > 0 ? (
                  <View style={styles.dueBadge}>
                    <Text style={styles.dueText}>বকেয়া: ৳ {due}</Text>
                  </View>
                ) : (
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidText}>পরিশোধিত</Text>
                  </View>
                )}
              </View>

              {cust.address ? (
                <Text style={styles.custAddress}>📍 {cust.address}</Text>
              ) : null}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${cust.phone}`)}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionText}>📞 কল</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `whatsapp://send?phone=${cust.phone?.replace('+', '')}`
                    )
                  }
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionText}>💬 হোয়াটসঅ্যাপ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/(tailor)/measurements/form',
                      params: { customerId: cust.id || item.customerId, customerName: cust.name },
                    } as any)
                  }
                  style={[styles.actionBtn, styles.measurementBtn]}
                >
                  <Text style={styles.measurementBtnText}>📏 মাপের খাতা</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
      />

      {/* Add Customer Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>নতুন কাস্টমার যোগ করুন</Text>

            <Input
              label="কাস্টমারের নাম *"
              placeholder="যেমন: তানভীর আহমেদ"
              value={newName}
              onChangeText={setNewName}
            />

            <Input
              label="মোবাইল নম্বর *"
              placeholder="017XXXXXXXX"
              keyboardType="phone-pad"
              maxLength={11}
              value={newPhone}
              onChangeText={setNewPhone}
            />

            <Input
              label="ঠিকানা (ঐচ্ছিক)"
              placeholder="ঠিকানা দিন"
              value={newAddress}
              onChangeText={setNewAddress}
            />

            <View style={styles.modalBtns}>
              <Button
                title="বাতিল"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="যোগ করুন"
                onPress={handleAddCustomer}
                loading={saving}
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
  searchBox: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: -8,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  custName: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
  },
  custPhone: {
    ...typography.body,
    color: colors.textMuted,
  },
  dueBadge: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dueText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.danger,
  },
  paidBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paidText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.success,
  },
  custAddress: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  actionText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
  },
  measurementBtn: {
    backgroundColor: colors.primaryLight,
  },
  measurementBtnText: {
    ...typography.caption,
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
  modalBtns: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
