import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, TrendingUp, Users, Calendar, CheckCircle, Clock, AlertCircle, Plus, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRecyclables } from '@/contexts/RecyclablesContext';

export default function CollectionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { collections, collectorStats, completeCollection, scheduleCollection, uncollectedItems, prices } = useRecyclables();
  const [refreshing, setRefreshing] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const isCollector = user?.isCollector;
  const pendingCollections = collections.filter(c => c.status === 'scheduled');
  const completedCollections = collections.filter(c => c.status === 'completed');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'scheduled':
        return <Clock size={16} color={Colors.warning} />;
      default:
        return <AlertCircle size={16} color={Colors.error} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'scheduled':
        return Colors.warning;
      default:
        return Colors.error;
    }
  };

  if (!isCollector) {
    return (
      <View style={styles.container}>
        <View style={[styles.notCollectorHeader, { paddingTop: insets.top + 16 }]}>
          <Package size={64} color={Colors.primary} />
          <Text style={styles.notCollectorTitle}>Become a Collector</Text>
          <Text style={styles.notCollectorText}>
            As a collector, you can plan weekly collections from households in your network and earn money for recycling.
          </Text>
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.applyButtonText}>Apply in Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.householdSection}>
          <Text style={styles.householdTitle}>Your Collection Status</Text>
          <View style={styles.householdCard}>
            <View style={styles.householdIcon}>
              <Calendar size={24} color={Colors.primary} />
            </View>
            <View style={styles.householdInfo}>
              <Text style={styles.householdLabel}>Next Pickup</Text>
              <Text style={styles.householdValue}>No collection scheduled</Text>
            </View>
          </View>
          <Text style={styles.householdHint}>
            Your collector will notify you when they plan a pickup
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.recyclables.plastic, '#1D4ED8']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.headerTitle}>Collections</Text>
        <View style={styles.headerActions}>
          <Text style={styles.headerSubtitle}>Manage your pickups</Text>
          <TouchableOpacity 
            style={styles.networkButton}
            onPress={() => router.push('/(tabs)/collections/network')}
          >
            <Users size={18} color={Colors.white} />
            <Text style={styles.networkButtonText}>Network</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.statValue}>R{collectorStats.weeklyEarnings.toFixed(0)}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Package size={20} color={Colors.warning} />
            <Text style={styles.statValue}>{pendingCollections.length}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={20} color={Colors.success} />
            <Text style={styles.statValue}>{collectorStats.householdsCount}</Text>
            <Text style={styles.statLabel}>Households</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {pendingCollections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Collections</Text>
            {pendingCollections.map((collection) => (
              <View key={collection.id} style={styles.collectionCard}>
                <View style={styles.collectionHeader}>
                  <View style={styles.collectionInfo}>
                    <Text style={styles.collectionName}>{collection.householdName}</Text>
                    <View style={styles.collectionDate}>
                      <Calendar size={14} color={Colors.textSecondary} />
                      <Text style={styles.collectionDateText}>
                        {new Date(collection.scheduledDate).toLocaleDateString('en-ZA', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(collection.status) + '20' }]}>
                    {getStatusIcon(collection.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(collection.status) }]}>
                      {collection.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.collectionDetails}>
                  <View style={styles.collectionStat}>
                    <Text style={styles.collectionStatLabel}>Weight</Text>
                    <Text style={styles.collectionStatValue}>{collection.totalWeight.toFixed(1)} kg</Text>
                  </View>
                  <View style={styles.collectionStat}>
                    <Text style={styles.collectionStatLabel}>Est. Value</Text>
                    <Text style={[styles.collectionStatValue, { color: Colors.primary }]}>
                      R{collection.estimatedEarnings.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => completeCollection(collection.id)}
                >
                  <CheckCircle size={18} color={Colors.white} />
                  <Text style={styles.completeButtonText}>Mark Complete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection History</Text>
          {completedCollections.length > 0 ? (
            completedCollections.slice(0, 10).map((collection) => (
              <View key={collection.id} style={styles.historyCard}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName}>{collection.householdName}</Text>
                  <Text style={styles.historyDate}>
                    {collection.completedAt && new Date(collection.completedAt).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={styles.historyStats}>
                  <Text style={styles.historyWeight}>{collection.totalWeight.toFixed(1)} kg</Text>
                  <Text style={styles.historyEarnings}>R{collection.estimatedEarnings.toFixed(2)}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Package size={48} color={Colors.textLight} />
              <Text style={styles.emptyStateText}>No collections yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start by connecting with households in your network
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => {
            if (uncollectedItems.length === 0) {
              Alert.alert('No Items', 'There are no uncollected items to schedule');
              return;
            }
            setShowScheduleModal(true);
          }}
        >
          <Plus size={20} color={Colors.white} />
          <Text style={styles.scheduleButtonText}>Schedule Collection</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showScheduleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Collection</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Items ready for collection:</Text>
            
            <View style={styles.itemsSummary}>
              {Object.entries(
                uncollectedItems.reduce((acc, item) => {
                  const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
                  acc[item.type] = (acc[item.type] || 0) + weight;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, weight]) => (
                <View key={type} style={styles.itemSummaryRow}>
                  <Text style={styles.itemSummaryType}>
                    {prices.find(p => p.type === type)?.label || type}
                  </Text>
                  <Text style={styles.itemSummaryWeight}>{(weight as number).toFixed(1)} kg</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.confirmScheduleButton}
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                scheduleCollection('self', 'My Collection', tomorrow.toISOString(), uncollectedItems);
                setShowScheduleModal(false);
                Alert.alert('Scheduled!', 'Your collection has been scheduled for tomorrow');
              }}
            >
              <Calendar size={20} color={Colors.white} />
              <Text style={styles.confirmScheduleText}>Schedule for Tomorrow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -40,
    left: 20,
    right: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    marginTop: 50,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  collectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  collectionDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  collectionDateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize',
  },
  collectionDetails: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  collectionStat: {},
  collectionStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  collectionStatValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 2,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 12,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyStats: {
    alignItems: 'flex-end',
  },
  historyWeight: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  historyEarnings: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  notCollectorHeader: {
    alignItems: 'center',
    padding: 40,
    paddingBottom: 32,
  },
  notCollectorTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  notCollectorText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  householdSection: {
    padding: 20,
  },
  householdTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  householdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  householdIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  householdInfo: {
    flex: 1,
  },
  householdLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  householdValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 2,
  },
  householdHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  networkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  networkButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  itemsSummary: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  itemSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemSummaryType: {
    fontSize: 15,
    color: Colors.text,
  },
  itemSummaryWeight: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  confirmScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 16,
    borderRadius: 12,
  },
  confirmScheduleText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
