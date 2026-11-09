import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors.js';
import { typography } from '../../theme/typography.js';
import api from '../../services/api.js';

interface MfsCheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  orderNo: string;
  dueAmount: number;
  onSuccess: (data: any) => void;
}

export const MfsCheckoutModal: React.FC<MfsCheckoutModalProps> = ({
  visible,
  onClose,
  orderId,
  orderNo,
  dueAmount,
  onSuccess,
}) => {
  const [gateway, setGateway] = useState<'BKASH' | 'NAGAD'>('BKASH');
  const [amount, setAmount] = useState(dueAmount > 0 ? dueAmount.toString() : '500');
  const [trxId, setTrxId] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [loading, setLoading] = useState(false);
  const [paymentSession, setPaymentSession] = useState<any>(null);

  const resetState = () => {
    setStep('select');
    setTrxId('');
    setPaymentSession(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleInitiate = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('ভুল ইনপুট', 'সঠিক টাকার পরিমাণ লিখুন');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/payments/mfs/initiate', {
        orderId,
        amount: numAmount,
        gateway,
      });

      if (res.data?.success) {
        setPaymentSession(res.data.data);
        setStep('confirm');
      } else {
        Alert.alert('ব্যর্থ', res.data?.error?.message || 'পেমেন্ট তৈরি করা যায়নি');
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.response?.data?.error?.message || 'সার্ভারে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!trxId.trim()) {
      Alert.alert('তথ্য দিন', 'অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) লিখুন');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/payments/mfs/verify', {
        orderId,
        gateway,
        paymentId: paymentSession?.paymentId || `PAY-${Date.now()}`,
        trxId: trxId.trim().toUpperCase(),
        amount: parseFloat(amount),
      });

      if (res.data?.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess(res.data.data);
          handleClose();
        }, 1800);
      } else {
        Alert.alert('পেমেন্ট ভেরিফিকেশন ব্যর্থ', res.data?.error?.message || 'সঠিক TrxID দিন');
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.response?.data?.error?.message || 'ভেরিফাই করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 'success' ? 'পেমেন্ট সম্পন্ন!' : 'অনলাইন পেমেন্ট (MFS)'}
            </Text>
            {step !== 'success' && (
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {step === 'select' && (
              <View>
                <Text style={styles.subtitle}>
                  অর্ডার নং: <Text style={styles.highlight}>{orderNo}</Text>
                </Text>

                {/* Gateway Picker */}
                <Text style={styles.sectionLabel}>পেমেন্ট মেথড বেছে নিন:</Text>
                <View style={styles.gatewayRow}>
                  <TouchableOpacity
                    style={[
                      styles.gatewayCard,
                      gateway === 'BKASH' && styles.bkashActive,
                    ]}
                    onPress={() => setGateway('BKASH')}
                  >
                    <Text style={styles.gatewayEmoji}>🌸</Text>
                    <Text
                      style={[
                        styles.gatewayName,
                        gateway === 'BKASH' && { color: '#D12053', fontWeight: '700' },
                      ]}
                    >
                      বিকাশ (bKash)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.gatewayCard,
                      gateway === 'NAGAD' && styles.nagadActive,
                    ]}
                    onPress={() => setGateway('NAGAD')}
                  >
                    <Text style={styles.gatewayEmoji}>⚡</Text>
                    <Text
                      style={[
                        styles.gatewayName,
                        gateway === 'NAGAD' && { color: '#F7941D', fontWeight: '700' },
                      ]}
                    >
                      নগদ (Nagad)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Amount input */}
                <Text style={styles.sectionLabel}>পরিশোধের পরিমাণ (টাকা):</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>৳</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0"
                  />
                </View>

                {dueAmount > 0 && (
                  <Text style={styles.dueHint}>
                    বর্তমান মোট বকেয়া: ৳ {dueAmount}
                  </Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    gateway === 'BKASH' ? styles.bkashBtn : styles.nagadBtn,
                  ]}
                  onPress={handleInitiate}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      {gateway === 'BKASH' ? 'বিকাশে' : 'নগদে'} এগিয়ে যান ➔
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {step === 'confirm' && (
              <View>
                <View style={styles.instructionBox}>
                  <Text style={styles.instructionTitle}>
                    {gateway === 'BKASH' ? 'বিকাশ সেন্ড মানি / মার্চেন্ট পে' : 'নগদ ক্যাশআউট / পে'}
                  </Text>
                  <Text style={styles.instructionText}>
                    ১. আপনার {gateway === 'BKASH' ? 'বিকাশ' : 'নগদ'} অ্যাপ অথবা ডায়াল করে
                    নিচের নম্বরে ৳{amount} পাঠান:
                  </Text>
                  <View style={styles.numberBox}>
                    <Text style={styles.merchantNumber}>
                      {gateway === 'BKASH' ? '01700-112233 (Merchant)' : '01900-334455 (Personal)'}
                    </Text>
                  </View>
                  <Text style={styles.instructionText}>
                    ২. পেমেন্ট সফল হলে এসএমএস বা স্টেটমেন্ট থেকে প্রাপ্ত ট্রানজেকশন আইডি (TrxID)
                    নিচের বক্সে লিখুন:
                  </Text>
                </View>

                <Text style={styles.sectionLabel}>ট্রানজেকশন আইডি (TrxID):</Text>
                <TextInput
                  style={styles.trxInput}
                  placeholder="যেমন: BL98A2K5X"
                  value={trxId}
                  onChangeText={setTrxId}
                  autoCapitalize="characters"
                />

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    gateway === 'BKASH' ? styles.bkashBtn : styles.nagadBtn,
                  ]}
                  onPress={handleVerify}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>পেমেন্ট নিশ্চিত করুন ✓</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStep('select')}
                  disabled={loading}
                >
                  <Text style={styles.backBtnText}>আগের ধাপে ফিরুন</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'success' && (
              <View style={styles.successContainer}>
                <Text style={styles.successEmoji}>🎉</Text>
                <Text style={styles.successTitle}>পেমেন্ট সফল হয়েছে!</Text>
                <Text style={styles.successSubtitle}>
                  ৳{amount} সফলভাবে গ্রহণ করা হয়েছে এবং অর্ডারের স্টেটমেন্ট আপডেট করা হয়েছে।
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '700',
  },
  body: {
    paddingBottom: 20,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  highlight: {
    fontWeight: '700',
    color: colors.text,
  },
  sectionLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  gatewayRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  gatewayCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: colors.surfaceAlt,
  },
  bkashActive: {
    borderColor: '#D12053',
    backgroundColor: '#FFF0F5',
  },
  nagadActive: {
    borderColor: '#F7941D',
    backgroundColor: '#FFF8F0',
  },
  gatewayEmoji: {
    fontSize: 20,
  },
  gatewayName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 8,
  },
  currencySymbol: {
    ...typography.h2,
    color: colors.textMuted,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    ...typography.h2,
    color: colors.text,
    paddingVertical: 10,
  },
  dueHint: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
    marginBottom: 20,
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  bkashBtn: {
    backgroundColor: '#D12053',
  },
  nagadBtn: {
    backgroundColor: '#F7941D',
  },
  primaryBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructionBox: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  instructionTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  instructionText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginVertical: 4,
  },
  numberBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 6,
    alignItems: 'center',
  },
  merchantNumber: {
    ...typography.h3,
    letterSpacing: 1,
    color: colors.primary,
  },
  trxInput: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 16,
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  backBtnText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  successEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  successTitle: {
    ...typography.h2,
    color: colors.success,
    marginBottom: 8,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});
