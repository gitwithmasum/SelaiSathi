import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors.js';
import { typography } from '../../theme/typography.js';

interface BadgeProps {
  label: string;
  stage?: keyof typeof colors.stages;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export const Badge: React.FC<BadgeProps> = ({ label, stage, variant = 'primary' }) => {
  let bgColor: string = colors.primaryLight;
  let textColor: string = colors.primary;

  if (stage && colors.stages[stage]) {
    bgColor = colors.stages[stage].bg;
    textColor = colors.stages[stage].text;
  } else {
    switch (variant) {
      case 'success':
        bgColor = colors.successLight;
        textColor = colors.success;
        break;
      case 'warning':
        bgColor = colors.warningLight;
        textColor = colors.warning;
        break;
      case 'danger':
        bgColor = colors.dangerLight;
        textColor = colors.danger;
        break;
    }
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '700',
  },
});
