import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Package, 
  Calendar, 
  ChevronRight, 
  History, 
  Filter,
  CheckCircle2,
  Clock,
  ArrowLeft
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { StatsCard } from '@/components/home/StatsCard';

type FilterType = 'all' | 'logs' | 'pickups';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const { 
    recyclableItems = [], 
    collections = [], 
    refreshData,
    loading 
  } = useRecyclables();
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const isCollector = profile?.is_collector || profile?.collector_approved || false;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // Merge and sort activity
  const activityList = useMemo(() => {
    const logs = recyclableItems.map(item => ({
      id: item.id,
      type: 'log' as const,
      title: item.type?.name || 'Recyclable Item',
      subtitle: `${item.quantity} units • ${item.estimatedWeightKg.toFixed(1)} kg`,
      date: new Date(item.loggedAt),
      status: item.collected ? 'collected' : 'pending'
    }));

    const pickups = collections.filter(c => c.status === 'completed').map(c => ({
      id: c.id,
      type: 'pickup' as const,
      title: `Collection #${c.id.slice(0, 8)}`,
      subtitle: `${c.totalWeight.toFixed(1)} kg collected`,
      date: new Date(c.completedAt || c.scheduledDate),
      status: 'completed'
    }));

    const combined = [...logs, ...pickups];
    
    // Sort by date descending
    combined.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Filter
    if (activeFilter === 'logs') return combined.filter(a => a.type === 'log');
    if (activeFilter === 'pickups') return combined.filter(a => a.type === 'pickup');
    
    return combined;
  }, [recyclableItems, collections, activeFilter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Activity History</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.content}>
          {/* Stats Summary */}
          <StatsCard 
            itemsCount={recyclableItems.length}
            totalWeight={recyclableItems.reduce((acc, item) => acc + (item.estimatedWeightKg || 0), 0)}
            isCollector={isCollector}
          />

          {/* Filters */}
          <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
              {(['all', 'logs', 'pickups'] as FilterType[]).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterPill,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    activeFilter === filter && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[
                    styles.filterText,
                    { color: colors.textSecondary },
                    activeFilter === filter && { color: '#fff' }
                  ]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Activity List */}
          <View style={styles.listSection}>
            {activityList.length === 0 ? (
              <View style={styles.emptyState}>
                <Clock size={48} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No activity history found</Text>
              </View>
            ) : (
              activityList.map((item) => (
                <View key={`${item.type}-${item.id}`} style={[styles.activityCard, { backgroundColor: colors.surface }]}>
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: item.type === 'log' 
                      ? (isDark ? '#064E3B' : '#F0FDF4') 
                      : (isDark ? '#1E3A8A' : '#F0F9FF') 
                    }
                  ]}>
                    {item.type === 'log' ? (
                      <Package size={20} color={colors.primary} />
                    ) : (
                      <Calendar size={20} color="#3B82F6" />
                    )}
                  </View>
                  
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.itemDate, { color: colors.textSecondary }]}>
                        {item.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                    
                    <View style={styles.itemFooter}>
                      <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.status === 'completed' || item.status === 'collected' 
                          ? (isDark ? '#064E3B' : '#D1FAE5') 
                          : (isDark ? '#78350F' : '#FEF3C7') 
                        }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: item.status === 'completed' || item.status === 'collected' ? '#10B981' : '#F59E0B' }
                        ]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1 },
  backButton: { padding: 8, marginRight: 12, marginLeft: -8 },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  content: { padding: 20 },
  filterSection: { marginTop: 24, marginBottom: 16 },
  filterContainer: { gap: 10 },
  filterPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  filterText: { fontSize: 14, fontWeight: '700' },
  listSection: { gap: 12, marginTop: 8 },
  activityCard: { flexDirection: 'row', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  iconContainer: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  itemContent: { flex: 1, marginLeft: 16 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  itemDate: { fontSize: 11, fontWeight: '500' },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  itemSubtitle: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 60 },
  emptyText: { fontSize: 15, marginTop: 16, fontWeight: '500' },
});
;
