import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, TrendingUp } from 'lucide-react-native';
import { RecyclableItem } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface RecentActivityProps {
  items: RecyclableItem[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 180;

export const RecentActivity: React.FC<RecentActivityProps> = ({ items }) => {
  const { colors, isDark } = useTheme();

  if (items.length === 0) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Package size={24} color={colors.border} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recent activity</Text>
      </View>
    );
  }

  // Get last 7 days
  const dailyStats = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const dayItems = items.filter(item => new Date(item.loggedAt).toDateString() === dateStr);
    const weight = dayItems.reduce((sum, item) => sum + (item.estimatedWeightKg || 0), 0);
    
    return {
      label: i === 0 ? 'T' : i === 1 ? 'Y' : d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      weight,
      isToday: i === 0
    };
  }).reverse();

  const maxWeight = Math.max(...dailyStats.map(s => s.weight), 1);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <TrendingUp size={18} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Weekly Volume</Text>
        </View>
        <Text style={[styles.totalWeight, { color: colors.primary }]}>
          {dailyStats.reduce((sum, s) => sum + s.weight, 0).toFixed(1)} <Text style={styles.unit}>kg</Text>
        </Text>
      </View>

      <View style={styles.chartContainer}>
        {dailyStats.map((stat, index) => {
          const barHeight = (stat.weight / maxWeight) * (CHART_HEIGHT - 40);
          const finalHeight = Math.max(barHeight, 4); // Minimum height for visibility

          return (
            <View key={index} style={styles.barWrapper}>
              {stat.weight > 0 && (
                <View style={[styles.valueLabel, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.valueText, { color: colors.text }]}>{stat.weight.toFixed(1)}</Text>
                </View>
              )}
              <View style={[styles.barTrack, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={[styles.barFill, { height: finalHeight }]}
                />
              </View>
              <Text style={[styles.dayLabel, { color: stat.isToday ? colors.primary : colors.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  totalWeight: {
    fontSize: 24,
    fontWeight: '900',
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    paddingTop: 20,
  },
  barWrapper: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 120) / 7,
  },
  valueLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
    position: 'absolute',
    top: -25,
  },
  valueText: {
    fontSize: 10,
    fontWeight: '800',
  },
  barTrack: {
    width: 14,
    height: CHART_HEIGHT - 40,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 10,
  },
  dayLabel: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
  },
});