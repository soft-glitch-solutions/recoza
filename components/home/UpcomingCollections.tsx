import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Package, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Collection } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface UpcomingCollectionsProps {
  collections: Collection[];
}

export const UpcomingCollections: React.FC<UpcomingCollectionsProps> = ({ collections }) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  if (collections.length === 0) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Clock size={24} color={colors.border} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No pending collections</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {collections.map((collection) => (
        <TouchableOpacity
          key={collection.id}
          style={[styles.taskCard, { backgroundColor: colors.surface }]}
          onPress={() => router.push(`/collections/${collection.id}` as any)}
        >
          <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1E3A8A' : '#F0F9FF' }]}>
            <Package size={18} color={colors.primary} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.text }]}>Household {collection.householdId.slice(0, 8)}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{new Date(collection.scheduledDate).toLocaleDateString()}</Text>
          </View>
          <ChevronRight size={18} color={colors.border} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  taskCard: {
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