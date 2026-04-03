import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';
import { RecyclableItem } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface RecentActivityProps {
  items: RecyclableItem[];
}

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

  const getEmoji = (typeId: string) => {
    return '♻️';
  };

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.id} style={[styles.activityCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={{ fontSize: 18 }}>{getEmoji(item.recyclableTypeId)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.text }]}>{item.type?.name || 'Recyclable Item'}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {item.quantity} units • {item.estimatedWeightKg.toFixed(1)} kg
            </Text>
          </View>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {new Date(item.loggedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});