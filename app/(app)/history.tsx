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

          {/* Weekly Summary Chart */}
          <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <View style={styles.chartHeader}>
              <TrendingUp size={18} color={colors.primary} />
              <Text style={[styles.chartHeaderText, { color: colors.text }]}>Last 7 Days</Text>
            </View>
            <View style={styles.chartBody}>
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toDateString();
                const dayItems = recyclableItems.filter(item => new Date(item.loggedAt).toDateString() === dateStr);
                const weight = dayItems.reduce((sum, item) => sum + (item.estimatedWeightKg || 0), 0);
                const maxWeight = Math.max(...recyclableItems.map(item => item.estimatedWeightKg || 0), 1);
                const barHeight = (weight / maxWeight) * 100;
                
                return (
                  <View key={dateStr} style={styles.barWrapper}>
                    {weight > 0 && (
                      <View style={[styles.miniValueLabel, { backgroundColor: colors.surfaceSecondary }]}>
                        <Text style={[styles.miniValueText, { color: colors.text }]}>{weight.toFixed(1)}</Text>
                      </View>
                    )}
                    <View style={[styles.miniBarTrack, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                      <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={[styles.miniBarFill, { height: Math.max(barHeight, 4) }]}
                      />
                    </View>
                    <Text style={[styles.miniDayLabel, { color: i === 0 ? colors.primary : colors.textSecondary }]}>
                      {i === 0 ? 'T' : d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </Text>
                  </View>
                );
              }).reverse()}
            </View>
          </View>

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
              activityList.map((item, index) => {
                const showDateHeader = index === 0 || activityList[index - 1].date.toDateString() !== item.date.toDateString();
                
                return (
                  <View key={`${item.type}-${item.id}`}>
                    {showDateHeader && (
                      <View style={styles.dateHeaderRow}>
                        <Text style={[styles.dateHeaderText, { color: colors.textSecondary }]}>
                          {item.date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </Text>
                      </View>
                    )}
                    <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                      <View style={styles.infographicWrapper}>
                        <View style={[styles.ringOuter, { borderColor: item.type === 'log' ? colors.primary + '30' : colors.info + '30' }]}>
                          <View style={[styles.ringInner, { backgroundColor: item.type === 'log' ? colors.primary + '10' : colors.info + '10' }]}>
                             <Text style={[styles.weightValue, { color: item.type === 'log' ? colors.primary : colors.info }]}>
                               {parseFloat(item.subtitle).toFixed(1)}
                             </Text>
                             <Text style={[styles.weightUnit, { color: item.type === 'log' ? colors.primary : colors.info }]}>kg</Text>
                          </View>
                        </View>
                        
                        <View style={styles.itemContent}>
                          <View style={styles.itemHeader}>
                            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
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
                          
                          <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                            {item.type === 'log' ? 'Logged contribution' : 'Completed collection'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
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
  dateHeaderRow: { marginTop: 24, marginBottom: 12, paddingLeft: 4 },
  dateHeaderText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  activityCard: { padding: 16, borderRadius: 24, borderWidth: 1, marginBottom: 12 },
  infographicWrapper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringOuter: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  ringInner: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  weightValue: { fontSize: 16, fontWeight: '800' },
  weightUnit: { fontSize: 10, fontWeight: '700', marginTop: -2 },
  itemContent: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  itemTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  itemSubtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  chartCard: { borderRadius: 32, padding: 24, borderWidth: 1, marginTop: 24 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  chartHeaderText: { fontSize: 16, fontWeight: '800' },
  chartBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingTop: 20 },
  barWrapper: { alignItems: 'center', flex: 1 },
  miniValueLabel: { paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, position: 'absolute', top: -20 },
  miniValueText: { fontSize: 8, fontWeight: '800' },
  miniBarTrack: { width: 10, height: 80, borderRadius: 5, justifyContent: 'flex-end', overflow: 'hidden' },
  miniBarFill: { width: '100%', borderRadius: 5 },
  miniDayLabel: { marginTop: 8, fontSize: 10, fontWeight: '800' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 60 },
  emptyText: { fontSize: 15, marginTop: 16, fontWeight: '500' },
});
;
