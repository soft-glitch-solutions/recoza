import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface StatsCardProps {
  itemsCount: number;
  totalWeight: number;
  isCollector: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  itemsCount,
  totalWeight,
  isCollector,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.statsRowSimple, { backgroundColor: colors.surface }]}>
      <View style={styles.statPillSimple}>
        <Text style={[styles.statLabelSimple, { color: colors.textSecondary }]}>Logged</Text>
        <Text style={[styles.statValueSimple, { color: colors.text }]}>{itemsCount}</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
      <View style={styles.statPillSimple}>
        <Text style={[styles.statLabelSimple, { color: colors.textSecondary }]}>Weight</Text>
        <Text style={[styles.statValueSimple, { color: colors.text }]}>{totalWeight.toFixed(1)} kg</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
      <View style={styles.statPillSimple}>
        <Text style={[styles.statLabelSimple, { color: colors.textSecondary }]}>Mode</Text>
        <Text style={[styles.statValueSimple, { color: isCollector ? colors.success : colors.primary }]}>
          {isCollector ? 'Collector' : 'Household'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsRowSimple: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  statPillSimple: {
    alignItems: 'center',
    flex: 1,
  },
  statLabelSimple: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValueSimple: {
    fontSize: 16,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: '60%',
  }
});