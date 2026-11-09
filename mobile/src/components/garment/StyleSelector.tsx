import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme/colors.js';
import { typography } from '../../theme/typography.js';

interface StyleOptionGroup {
  category: string;
  labelBn: string;
  options: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
}

interface StyleSelectorProps {
  selectedStyles: Record<string, string>;
  onSelectStyle: (category: string, optionId: string) => void;
  groups?: StyleOptionGroup[];
}

export const DEFAULT_STYLE_GROUPS: StyleOptionGroup[] = [
  {
    category: 'collar',
    labelBn: 'কলার ডিজাইন',
    options: [
      { id: 'band', label: 'ব্যান্ড কলার', icon: '👔' },
      { id: 'mandarin', label: 'চাইনিজ কলার', icon: '👘' },
      { id: 'shirt', label: 'শার্ট কলার', icon: '👔' },
      { id: 'sherwani', label: 'শেরওয়ানি কলার', icon: '👑' },
    ],
  },
  {
    category: 'pocket',
    labelBn: 'পকেট স্টাইল',
    options: [
      { id: 'both_sides', label: 'উভয় সাইড পকেট', icon: '📥' },
      { id: 'chest_pocket', label: 'বুক পকেট সহ', icon: '📇' },
      { id: 'secret_pocket', label: 'গোপন পকেট', icon: '🔒' },
      { id: 'no_pocket', label: 'পকেট ছাড়া', icon: '🚫' },
    ],
  },
  {
    category: 'cuff',
    labelBn: 'কাফ ডিজাইন',
    options: [
      { id: 'open', label: 'সাধারণ খোলা', icon: '✋' },
      { id: 'cut_cuff', label: 'কাট কাফ (Cut)', icon: '✂️' },
      { id: 'button_cuff', label: 'বাটন কাফ', icon: '🔘' },
    ],
  },
  {
    category: 'neck_female',
    labelBn: 'গলার ডিজাইন (ব্লাউজ/কামিজ)',
    options: [
      { id: 'round', label: 'গোল গলা', icon: '⭕' },
      { id: 'paan', label: 'পান গলা', icon: '🍃' },
      { id: 'v_cut', label: 'ভি-কাট গলা', icon: '🔻' },
      { id: 'square', label: 'চারকোনা গলা', icon: '⏹️' },
      { id: 'boat_neck', label: 'বোট নেক', icon: '⛵' },
      { id: 'piping', label: 'পাইপিং ডিজাইন', icon: '🧵' },
    ],
  },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyles,
  onSelectStyle,
  groups = DEFAULT_STYLE_GROUPS,
}) => {
  return (
    <View style={styles.container}>
      {groups.map((group) => (
        <View key={group.category} style={styles.groupContainer}>
          <Text style={styles.groupTitle}>{group.labelBn}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            {group.options.map((opt) => {
              const isSelected = selectedStyles[group.category] === opt.id;

              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.8}
                  onPress={() => onSelectStyle(group.category, opt.id)}
                  style={[
                    styles.optionCard,
                    isSelected ? styles.optionCardSelected : {},
                  ]}
                >
                  <Text style={styles.optionIcon}>{opt.icon}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected ? styles.optionLabelSelected : {},
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  groupContainer: {
    marginBottom: 14,
  },
  groupTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionCard: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
    minWidth: 88,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  optionLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
