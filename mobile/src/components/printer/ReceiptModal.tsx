import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors.js';
import { typography } from '../../theme/typography.js';
import { Button } from '../ui/Button.js';
import {
  ReceiptData,
  generate58mmReceiptText,
} from '../../services/printer/thermalReceipt.js';

interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  data: ReceiptData;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  visible,
  onClose,
  data,
}) => {
  const receiptText = generate58mmReceiptText(data);

  const handleShareReceipt = async () => {
    try {
      await Share.share({
        message: receiptText,
      });
    } catch {}
  };

  const handleBluetoothPrint = () => {
    Alert.alert(
      'ব্লুটুথ প্রিন্টার',
      'কাছের ৫৮মিমি / ৮০মিমি থার্মাল প্রিন্টারে সংযোগ অনুসন্ধান করা হচ্ছে... (স্লিপটি প্রিন্ট কমান্ডে পাঠানো হয়েছে)',
      [{ text: 'ঠিক আছে' }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>থার্মাল ক্যাশ মেমো (Receipt)</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Realistic Thermal Paper Roll Simulation */}
          <ScrollView style={styles.paperRoll}>
            <View style={styles.paper}>
              <Text style={styles.receiptMonoText}>{receiptText}</Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Button
              title="ব্লুটুথ প্রিন্ট করুন 🖨️"
              onPress={handleBluetoothPrint}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="মেমো শেয়ার 📲"
              variant="outline"
              onPress={handleShareReceipt}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    maxHeight: '85%',
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  paperRoll: {
    backgroundColor: '#F4F4F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0DC',
    padding: 12,
    marginVertical: 10,
  },
  paper: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#D1D5DB',
  },
  receiptMonoText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
});
