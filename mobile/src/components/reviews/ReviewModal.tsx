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
} from 'react-native';
import { colors } from '../../theme/colors.js';
import { typography } from '../../theme/typography.js';
import api from '../../services/api.js';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  orderNo: string;
  tailorName?: string;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  orderId,
  orderNo,
  tailorName,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const ratingDescriptions: Record<number, string> = {
    1: '১ - একদম পছন্দ হয়নি',
    2: '২ - মোটামুটি / মানানসই নয়',
    3: '৩ - সন্তোষজনক / ভালো',
    4: '৪ - খুব ভালো লেগেছে',
    5: '৫ - অসাধারণ ফিটিং ও নিখুঁত সেলাই!',
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/reviews', {
        orderId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (res.data?.success) {
        Alert.alert('ধন্যবাদ!', 'আপনার মূল্যবান রিভিউটি সফলভাবে জমা হয়েছে।');
        onSuccess();
        onClose();
      } else {
        Alert.alert('ব্যর্থ', res.data?.error?.message || 'রিভিউ জমা দেওয়া যায়নি');
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.response?.data?.error?.message || 'রিভিউ জমা দিতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>রিভিউ ও রেটিং দিন</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.orderInfo}>
            অর্ডার নং: <Text style={styles.bold}>{orderNo}</Text>
            {tailorName ? ` • ${tailorName}` : ''}
          </Text>

          {/* Star selector */}
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
                style={styles.starBtn}
              >
                <Text style={[styles.starIcon, rating >= star && styles.starActive]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingHint}>{ratingDescriptions[rating]}</Text>

          {/* Comment input */}
          <Text style={styles.label}>আপনার মন্তব্য লিখুন (ঐচ্ছিক):</Text>
          <TextInput
            style={styles.commentInput}
            multiline
            numberOfLines={4}
            placeholder="ফিটিং কেমন হয়েছে? সময়মতো ডেলিভারি পেয়েছেন কিনা বিস্তারিত লিখুন..."
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>রিভিউ জমা দিন ✓</Text>
            )}
          </TouchableOpacity>
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
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  orderInfo: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
  },
  starBtn: {
    padding: 6,
  },
  starIcon: {
    fontSize: 36,
    color: '#D1D5DB',
  },
  starActive: {
    color: '#F59E0B',
  },
  ratingHint: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  commentInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    ...typography.body,
    backgroundColor: colors.surfaceAlt,
    minHeight: 100,
    marginBottom: 20,
    color: colors.text,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
