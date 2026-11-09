import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../src/theme/colors.js';
import { typography } from '../../../src/theme/typography.js';
import { Card } from '../../../src/components/ui/Card.js';
import { Input } from '../../../src/components/ui/Input.js';
import { Button } from '../../../src/components/ui/Button.js';
import { parseBengaliSpeechToMeasurements } from '../../../src/utils/voiceParser.js';
import api from '../../../src/services/api.js';

export default function MeasurementFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ customerId?: string; customerName?: string }>();
  const customerId = params.customerId || '';
  const customerName = params.customerName || 'কাস্টমার';

  const [garmentTypes, setGarmentTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<any | null>(null);
  const [unit, setUnit] = useState<'INCH' | 'CM'>('INCH');
  const [values, setValues] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Voice Assistant Modal State
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [voiceSpeechInput, setVoiceSpeechInput] = useState('');

  useEffect(() => {
    api
      .get('/measurements/garment-types')
      .then((res) => {
        if (res.data?.success) {
          const types = res.data.data || [];
          setGarmentTypes(types);
          if (types.length > 0) {
            selectType(types[0]);
          }
        }
      })
      .catch(() => {
        // Fallback Panjabi Preset
        const fallback = {
          id: 'panjabi-1',
          nameBn: 'পাঞ্জাবি',
          fields: [
            { key: 'length', labelBn: 'লম্বা / ঝুল', defaultValue: 40 },
            { key: 'chest', labelBn: 'বুক / ছাতি', defaultValue: 38 },
            { key: 'shoulder', labelBn: 'তিরা / কাঁধ', defaultValue: 18 },
            { key: 'sleeve', labelBn: 'হাতা লম্বা', defaultValue: 24 },
            { key: 'cuff_opening', labelBn: 'হাতার মুহুরি', defaultValue: 11 },
            { key: 'collar', labelBn: 'গলা / কলার', defaultValue: 15.5 },
          ],
        };
        setGarmentTypes([fallback]);
        selectType(fallback);
      });
  }, []);

  const selectType = (type: any) => {
    setSelectedType(type);
    const initialValues: Record<string, number> = {};
    type.fields?.forEach((f: any) => {
      initialValues[f.key] = f.defaultValue || 30;
    });
    setValues(initialValues);
  };

  const handleAdjust = (fieldKey: string, delta: number) => {
    setValues((prev) => ({
      ...prev,
      [fieldKey]: Math.max(0, parseFloat(((prev[fieldKey] || 30) + delta).toFixed(2))),
    }));
  };

  const handleApplyVoiceSpeech = () => {
    if (!voiceSpeechInput.trim()) {
      Alert.alert('ত্রুটি', 'মাপের বাক্য লিখুন বা ভয়েসে বলুন');
      return;
    }

    const parsed = parseBengaliSpeechToMeasurements(voiceSpeechInput);
    const matchCount = Object.keys(parsed).length;

    if (matchCount === 0) {
      Alert.alert(
        'কোনো মাপ পাওয়া যায়নি',
        'দয়া করে বাক্যটি এভাবে বলুন: "ঝুল ৪২, বুক ৩৮, তিরা ১৮, হাতা ২৪, কলার ১৫.৫"'
      );
      return;
    }

    setValues((prev) => ({
      ...prev,
      ...parsed,
    }));

    setVoiceModalVisible(false);
    setVoiceSpeechInput('');
    Alert.alert('সফল', `ভয়েস পার্সার সফলভাবে ${matchCount}টি মাপ ফর্মে বসিয়েছে!`);
  };

  const handleSave = async () => {
    if (!customerId) {
      Alert.alert('ত্রুটি', 'অনুগ্রহ করে কাস্টমার তালিকা থেকে কাস্টমার সিলেক্ট করুন');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/measurements', {
        customerId,
        garmentTypeId: selectedType.id,
        values,
        unit,
        note: note.trim() || undefined,
      });

      if (res.data?.success) {
        Alert.alert('সফল', 'মাপ সফলভাবে ডিজিটাল খাতায় সংরক্ষণ করা হয়েছে (ভার্সন আপডেট হয়েছে)!');
        router.back();
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'মাপ সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ডিজিটাল মাপের খাতা</Text>
            <Text style={styles.custSubtitle}>কাস্টমার: {customerName}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setVoiceModalVisible(true)}
            style={styles.voiceAssistantBtn}
          >
            <Text style={styles.voiceAssistantText}>ভয়েসে মাপ 🎙️</Text>
          </TouchableOpacity>
        </View>

        {/* Garment Selector & Unit Toggle */}
        <View style={styles.topRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {garmentTypes.map((gt) => (
              <TouchableOpacity
                key={gt.id}
                onPress={() => selectType(gt)}
                style={[
                  styles.typePill,
                  selectedType?.id === gt.id ? styles.typePillActive : {},
                ]}
              >
                <Text
                  style={[
                    styles.typePillText,
                    selectedType?.id === gt.id ? styles.typePillTextActive : {},
                  ]}
                >
                  {gt.nameBn}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={() => setUnit(unit === 'INCH' ? 'CM' : 'INCH')}
            style={styles.unitBtn}
          >
            <Text style={styles.unitBtnText}>{unit === 'INCH' ? 'ইঞ্চি' : 'সেমি'}</Text>
          </TouchableOpacity>
        </View>

        {/* Rapid Measurement Stepper Pad */}
        <Card>
          <Text style={styles.cardHeader}>
            {selectedType?.nameBn} এর মাপসমূহ ({unit === 'INCH' ? 'ইঞ্চি' : 'সেমি'}):
          </Text>

          {selectedType?.fields?.map((f: any) => {
            const currentValue = values[f.key] ?? 30;

            return (
              <View key={f.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{f.labelBn}</Text>

                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    onPress={() => handleAdjust(f.key, -0.5)}
                    style={styles.stepperBtn}
                  >
                    <Text style={styles.stepperBtnText}>-০.৫</Text>
                  </TouchableOpacity>

                  <View style={styles.valBox}>
                    <Text style={styles.valText}>{currentValue}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleAdjust(f.key, 0.5)}
                    style={styles.stepperBtn}
                  >
                    <Text style={styles.stepperBtnText}>+০.৫</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Notes */}
        <Card>
          <Input
            label="বিশেষ ফিটিংস নোট (ঐচ্ছিক)"
            placeholder="যেমন: ডান কাঁধ ঢালু, হাতা একটু লুজ ফিট"
            value={note}
            onChangeText={setNote}
          />
        </Card>

        <Button
          title="মাপ সংরক্ষণ করুন (Save)"
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
        />
      </ScrollView>

      {/* Bengali Voice Assistant Modal */}
      <Modal visible={voiceModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ভয়েস টু মেজারমেন্ট অ্যাসিস্ট্যান্ট</Text>
              <Text style={styles.modalSubtitle}>
                ফিতা দিয়ে মাপ ধরার সময় মুখে বলুন, সিস্টেম স্বয়ংক্রিয়ভাবে সংখ্যাগুলো ফর্মে বসাবে।
              </Text>
            </View>

            <Input
              label="কথিত মাপের বাক্য লিখুন বা বলুন:"
              placeholder="যেমন: ঝুল ৪২, বুক ৩৮, কোমর ৩৪, তিরা ১৮, হাতা ২৪, কলার ১৫.৫"
              multiline
              numberOfLines={3}
              value={voiceSpeechInput}
              onChangeText={setVoiceSpeechInput}
            />

            <View style={styles.sampleSuggestions}>
              <Text style={styles.sampleTitle}>দ্রুত টেস্টের জন্য ক্লিক করুন:</Text>
              <TouchableOpacity
                onPress={() =>
                  setVoiceSpeechInput('ঝুল ৪২, বুক ৩৮, কোমর ৩৪, তিরা ১৮, হাতা ২৪, কলার ১৫.৫')
                }
                style={styles.samplePill}
              >
                <Text style={styles.samplePillText}>
                  "ঝুল ৪২, বুক ৩৮, কোমর ৩৪, তিরা ১৮, হাতা ২৪, কলার ১৫.৫"
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtns}>
              <Button
                title="বাতিল"
                variant="outline"
                onPress={() => setVoiceModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="ফর্মে প্রয়োগ করুন"
                onPress={handleApplyVoiceSpeech}
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
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  custSubtitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  voiceAssistantBtn: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  voiceAssistantText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.accent,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeScroll: {
    flex: 1,
    marginRight: 8,
  },
  typePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
  },
  typePillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typePillText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typePillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  unitBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  unitBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#fff',
  },
  cardHeader: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldLabel: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBtn: {
    width: 44,
    height: 38,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text,
  },
  valBox: {
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  saveBtn: {
    marginTop: 8,
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
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sampleSuggestions: {
    marginBottom: 16,
  },
  sampleTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
  },
  samplePill: {
    backgroundColor: colors.surfaceAlt,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  samplePillText: {
    ...typography.caption,
    color: colors.primary,
    fontStyle: 'italic',
  },
  modalBtns: {
    flexDirection: 'row',
  },
});
