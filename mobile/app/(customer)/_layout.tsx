import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/theme/colors.js';

export default function CustomerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="orders"
        options={{
          title: 'আমার অর্ডার',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛍️</Text>,
        }}
      />
      <Tabs.Screen
        name="measurements"
        options={{
          title: 'আমার মাপ',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📏</Text>,
        }}
      />
    </Tabs>
  );
}
