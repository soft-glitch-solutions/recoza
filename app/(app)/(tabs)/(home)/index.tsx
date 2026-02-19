import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Recycle, Calendar, Trash2, Leaf, Award, Users, Clock, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRecyclables } from '@/contexts/RecyclablesContext';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isLargeDesktop = width >= 1440;

// Responsive scaling
const scale = (size: number) => {
  if (isDesktop) {
    return size * (width / 1920) * 1.2;
  }
  if (isTablet) {
    return size * (width / 768) * 1.1;
  }
  return size;
};

// Recyclable types with icons - Made more prominent
const RECYCLABLE_TYPES = [
  { type: 'plastic', label: 'Plastic', emoji: '🫙', color: '#2D9B5E', bgColor: '#2D9B5E20' },
  { type: 'paper', label: 'Paper', emoji: '📰', color: '#3B82F6', bgColor: '#3B82F620' },
  { type: 'glass', label: 'Glass', emoji: '🍾', color: '#F59E0B', bgColor: '#F59E0B20' },
  { type: 'metal', label: 'Metal', emoji: '🥫', color: '#EF4444', bgColor: '#EF444420' },
  { type: 'cardboard', label: 'Cardboard', emoji: '📦', color: '#8B5CF6', bgColor: '#8B5CF620' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { 
    items = [], 
    collections = [], 
    loading,
    fetchRecyclableItems,
    fetchCollections,
    deleteRecyclableItem 
  } = useRecyclables();
  
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState({
    totalWeight: 0,
    itemCount: 0,
  });
  const [impactStats, setImpactStats] = useState({
    co2Saved: 0,
    treesSaved: 0,
    waterSaved: 0,
  });
  const [weeklyItems, setWeeklyItems] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [upcomingCollections, setUpcomingCollections] = useState<any[]>([]);

  // Check if user is a collector
  const isCollector = user?.is_collector === true;

  // Calculate statistics from real data
  useEffect(() => {
    if (items && items.length > 0) {
      // Calculate weekly items (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weekly = items.filter(item => new Date(item.created_at) >= weekAgo);
      setWeeklyItems(weekly);
      
      // Calculate weekly stats
      const stats = weekly.reduce((acc, item) => {
        const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
        
        return {
          totalWeight: acc.totalWeight + weight,
          itemCount: acc.itemCount + 1,
        };
      }, { totalWeight: 0, itemCount: 0 });
      
      setWeeklyStats(stats);
      
      // Calculate impact stats
      setImpactStats({
        co2Saved: stats.totalWeight * 2.5,
        treesSaved: (stats.totalWeight * 2.5) / 21,
        waterSaved: stats.totalWeight * 17,
      });
      
      // Get recent logs (last 5 items)
      setRecentLogs(items.slice(0, 5));
    }
  }, [items]);

  // Get upcoming collections (only for collectors)
  useEffect(() => {
    if (isCollector && collections && collections.length > 0) {
      const upcoming = collections
        .filter(c => c.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
        .slice(0, 3);
      
      setUpcomingCollections(upcoming);
    }
  }, [collections, isCollector]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchRecyclableItems(),
        fetchCollections(),
      ]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchRecyclableItems, fetchCollections]);

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const result = await deleteRecyclableItem(itemId);
            if (result.success) {
              Alert.alert('Success', 'Item deleted successfully');
            } else {
              Alert.alert('Error', result.error || 'Failed to delete item');
            }
          }
        },
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getIcon = (type: string) => {
    const item = RECYCLABLE_TYPES.find(t => t.type === type);
    return item?.emoji || '♻️';
  };

  const getLabel = (type: string) => {
    const item = RECYCLABLE_TYPES.find(t => t.type === type);
    return item?.label || type;
  };

  const getColor = (type: string) => {
    const item = RECYCLABLE_TYPES.find(t => t.type === type);
    return item?.color || Colors.primary;
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
  };

  // Desktop layout configuration
  const getLayoutConfig = () => {
    if (isDesktop) {
      return {
        contentMaxWidth: 1400,
        paddingHorizontal: 40,
        gridColumns: 3,
        showImpactSection: true,
        headerHeight: scale(80),
      };
    }
    if (isTablet) {
      return {
        contentMaxWidth: 900,
        paddingHorizontal: 32,
        gridColumns: 2,
        showImpactSection: true,
        headerHeight: scale(70),
      };
    }
    return {
      contentMaxWidth: '100%' as const,
      paddingHorizontal: 20,
      gridColumns: 1,
      showImpactSection: false,
      headerHeight: scale(60),
    };
  };

  const layout = getLayoutConfig();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[
          styles.header,
          { 
            paddingTop: insets.top + (isDesktop ? 24 : 16),
            paddingBottom: isDesktop ? 40 : 20,
          }
        ]}
      >
        <View style={[
          styles.headerContent,
          { 
            paddingHorizontal: layout.paddingHorizontal,
            maxWidth: layout.contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
          }
        ]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, isDesktop && { fontSize: scale(18) }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.userName, isDesktop && { fontSize: scale(32) }]}>
              {user?.full_name?.split(' ')[0] || 'Recycler'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[
              styles.logoSmall,
              isDesktop && {
                width: scale(52),
                height: scale(52),
                borderRadius: scale(26),
              }
            ]}>
              <Recycle size={isDesktop ? scale(28) : 24} color={Colors.white} />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Card */}
      <View style={[
        styles.statsCardWrapper,
        {
          paddingHorizontal: layout.paddingHorizontal,
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
          width: '100%',
          marginTop: isDesktop ? 20 : 10,
          marginBottom: isDesktop ? 40 : 20,
        }
      ]}>
        <LinearGradient
          colors={['#ffffff', '#f8f9fa']}
          style={[
            styles.statsCard,
            isDesktop && styles.statsCardDesktop
          ]}
        >
          <View style={styles.statsRow}>
            <View style={styles.statsLeft}>
              <View style={styles.statsHeader}>
                <Leaf size={isDesktop ? 24 : 20} color={Colors.primary} />
                <Text style={[styles.statsLabel, isDesktop && { fontSize: scale(18) }]}>
                  Your Impact
                </Text>
              </View>
              
              <View style={styles.impactMetrics}>
                <View style={styles.impactMetric}>
                  <Text style={[styles.impactValue, isDesktop && { fontSize: scale(28) }]}>
                    {weeklyStats.totalWeight.toFixed(1)}kg
                  </Text>
                  <Text style={[styles.impactMetricLabel, isDesktop && { fontSize: scale(14) }]}>
                    Recycled this week
                  </Text>
                </View>
                
                <View style={styles.impactMetric}>
                  <Text style={[styles.impactValue, isDesktop && { fontSize: scale(28) }]}>
                    {weeklyStats.itemCount}
                  </Text>
                  <Text style={[styles.impactMetricLabel, isDesktop && { fontSize: scale(14) }]}>
                    Items logged
                  </Text>
                </View>
              </View>

              {/* Environmental Impact */}
              <View style={styles.environmentalImpact}>
                <Text style={styles.environmentalTitle}>🌍 Environmental Impact</Text>
                <View style={styles.environmentalMetrics}>
                  <View style={styles.environmentalMetric}>
                    <Text style={styles.environmentalValue}>{impactStats.co2Saved.toFixed(1)}kg</Text>
                    <Text style={styles.environmentalLabel}>CO₂ Saved</Text>
                  </View>
                  <View style={styles.environmentalMetric}>
                    <Text style={styles.environmentalValue}>{impactStats.waterSaved.toFixed(0)}L</Text>
                    <Text style={styles.environmentalLabel}>Water Saved</Text>
                  </View>
                  <View style={styles.environmentalMetric}>
                    <Text style={styles.environmentalValue}>{impactStats.treesSaved.toFixed(1)}</Text>
                    <Text style={styles.environmentalLabel}>Trees Saved</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Desktop impact stats */}
            {isDesktop && (
              <View style={styles.desktopImpactStats}>
                <View style={styles.desktopImpactStat}>
                  <Leaf size={24} color={Colors.primary} />
                  <Text style={styles.desktopImpactValue}>{impactStats.co2Saved.toFixed(1)}kg</Text>
                  <Text style={styles.desktopImpactLabel}>CO₂ Saved</Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.desktopImpactStat}>
                  <Award size={24} color={Colors.primary} />
                  <Text style={styles.desktopImpactValue}>{impactStats.waterSaved.toFixed(0)}L</Text>
                  <Text style={styles.desktopImpactLabel}>Water Saved</Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.desktopImpactStat}>
                  <Users size={24} color={Colors.primary} />
                  <Text style={styles.desktopImpactValue}>{impactStats.treesSaved.toFixed(1)}</Text>
                  <Text style={styles.desktopImpactLabel}>Trees Saved</Text>
                </View>
              </View>
            )}
          </View>

          {/* Collector-only earnings section */}
          {isCollector && (
            <View style={styles.collectorEarnings}>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsRow}>
                <TrendingUp size={20} color={Colors.primary} />
                <Text style={styles.earningsText}>
                  You've earned R{weeklyStats.totalWeight * 8} this week as a collector
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: layout.paddingHorizontal,
            maxWidth: layout.contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
            paddingBottom: 20,
          }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={Colors.primary} 
            colors={[Colors.primary]}
          />
        }
      >
        {/* Quick Log Section - Primary way to add items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDesktop && { fontSize: scale(24) }]}>
              What are you recycling?
            </Text>
            <Text style={[styles.quickLogHint, isDesktop && { fontSize: scale(14) }]}>
              Tap to log
            </Text>
          </View>
          
          <View style={styles.quickLogGrid}>
            {RECYCLABLE_TYPES.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.quickLogCard,
                  isDesktop && { 
                    padding: scale(16),
                    borderRadius: scale(20),
                  }
                ]}
                onPress={() => router.push({
                  pathname: '/(tabs)/(home)/log-item',
                  params: { type: item.type }
                })}
              >
                <LinearGradient
                  colors={[item.color + '20', item.color + '10']}
                  style={[
                    styles.quickLogIconLarge,
                    { 
                      width: isDesktop ? scale(80) : 64,
                      height: isDesktop ? scale(80) : 64,
                      borderRadius: isDesktop ? scale(24) : 20,
                    }
                  ]}
                >
                  <Text style={[
                    styles.quickLogEmojiLarge,
                    isDesktop && { fontSize: scale(40) }
                  ]}>
                    {item.emoji}
                  </Text>
                </LinearGradient>
                <Text style={[
                  styles.quickLogLabelLarge,
                  isDesktop && { fontSize: scale(18), marginTop: scale(12) }
                ]}>
                  {item.label}
                </Text>
                <Text style={[
                  styles.quickLogTap,
                  isDesktop && { fontSize: scale(14) }
                ]}>
                  Tap to add →
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Collections - Only for collectors */}
        {isCollector && upcomingCollections.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDesktop && { fontSize: scale(24) }]}>
                Upcoming Collections
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/collections')}>
                <Text style={[styles.seeAllText, isDesktop && { fontSize: scale(16) }]}>
                  View all
                </Text>
              </TouchableOpacity>
            </View>

            {upcomingCollections.map((collection) => (
              <View key={collection.id} style={[
                styles.collectionCard,
                isDesktop && { padding: scale(20), marginBottom: scale(12), borderRadius: scale(16) }
              ]}>
                <View style={styles.collectionHeader}>
                  <View style={styles.collectionInfo}>
                    <Text style={[styles.collectionDate, isDesktop && { fontSize: scale(16) }]}>
                      <Calendar size={14} color={Colors.primary} /> {new Date(collection.scheduled_date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                  <View style={[styles.collectionBadge, { backgroundColor: Colors.warning + '20' }]}>
                    <Clock size={14} color={Colors.warning} />
                    <Text style={[styles.collectionStatus, { color: Colors.warning }]}>Scheduled</Text>
                  </View>
                </View>
                <Text style={[styles.collectionHousehold, isDesktop && { fontSize: scale(18) }]}>
                  {collection.household?.full_name || 'Household'}
                </Text>
                <Text style={[styles.collectionEstimate, isDesktop && { fontSize: scale(14) }]}>
                  Est. {collection.total_weight_kg?.toFixed(1)}kg
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Two column layout for desktop */}
        <View style={[
          isDesktop && styles.desktopGrid
        ]}>
          {/* This Week's Items */}
          <View style={[
            styles.section,
            isDesktop && styles.desktopGridItem
          ]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDesktop && { fontSize: scale(24) }]}>
                This Week's Items
              </Text>
              <View style={[
                styles.weekBadge,
                isDesktop && {
                  paddingHorizontal: scale(12),
                  paddingVertical: scale(6),
                  borderRadius: scale(16),
                }
              ]}>
                <Calendar size={isDesktop ? 16 : 14} color={Colors.primary} />
                <Text style={[styles.weekBadgeText, isDesktop && { fontSize: scale(14) }]}>
                  {weeklyItems.length} items
                </Text>
              </View>
            </View>

            {weeklyItems.length > 0 ? (
              <View style={styles.itemsGrid}>
                {weeklyItems.slice(0, isDesktop ? 5 : 3).map((item, index) => {
                  const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
                  
                  return (
                    <View key={item.id} style={[
                      styles.itemCard,
                      isDesktop && { padding: scale(20) }
                    ]}>
                      <View style={[
                        styles.itemIconContainer,
                        { 
                          backgroundColor: getColor(item.type) + '15',
                          width: isDesktop ? scale(60) : 48,
                          height: isDesktop ? scale(60) : 48,
                          borderRadius: isDesktop ? scale(16) : 12,
                        }
                      ]}>
                        <Text style={[
                          styles.itemEmoji,
                          isDesktop && { fontSize: scale(28) }
                        ]}>
                          {getIcon(item.type)}
                        </Text>
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={[
                          styles.itemType,
                          isDesktop && { fontSize: scale(18) }
                        ]}>
                          {item.item_name || getLabel(item.type)}
                        </Text>
                        <Text style={[
                          styles.itemWeight,
                          isDesktop && { fontSize: scale(16) }
                        ]}>
                          {weight.toFixed(1)} kg
                        </Text>
                        <Text style={[
                          styles.itemDate,
                          isDesktop && { fontSize: scale(14) }
                        ]}>
                          {formatDate(item.created_at)}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.deleteButton, isDesktop && { padding: scale(10) }]}
                        onPress={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 size={isDesktop ? 20 : 18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={[
                styles.emptyState,
                isDesktop && { padding: scale(40), borderRadius: scale(20) }
              ]}>
                <Recycle size={isDesktop ? 64 : 48} color={Colors.textLight} />
                <Text style={[styles.emptyStateText, isDesktop && { fontSize: scale(18), marginTop: scale(16) }]}>
                  No items logged this week
                </Text>
                <Text style={[styles.emptyStateSubtext, isDesktop && { fontSize: scale(16) }]}>
                  Choose a recyclable type above to get started
                </Text>
              </View>
            )}
          </View>

          {/* Recent Logs */}
          <View style={[
            styles.section,
            isDesktop && styles.desktopGridItem
          ]}>
            <Text style={[styles.sectionTitle, isDesktop && { fontSize: scale(24), marginBottom: scale(24) }]}>
              Recent Activity
            </Text>
            
            {recentLogs.length > 0 ? (
              recentLogs.slice(0, isDesktop ? 6 : 4).map((item) => {
                const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
                
                return (
                  <View key={item.id} style={[
                    styles.recentItem,
                    isDesktop && { padding: scale(16), marginBottom: scale(12), borderRadius: scale(14) }
                  ]}>
                    <View style={[
                      styles.recentItemIcon,
                      { 
                        backgroundColor: getColor(item.type) + '15',
                        width: isDesktop ? scale(48) : 40,
                        height: isDesktop ? scale(48) : 40,
                        borderRadius: isDesktop ? scale(12) : 10,
                      }
                    ]}>
                      <Text style={isDesktop && { fontSize: scale(20) }}>
                        {getIcon(item.type)}
                      </Text>
                    </View>
                    <View style={styles.recentItemInfo}>
                      <Text style={[
                        styles.recentItemType,
                        isDesktop && { fontSize: scale(16) }
                      ]}>
                        {item.item_name || getLabel(item.type)}
                      </Text>
                      <Text style={[
                        styles.recentItemDate,
                        isDesktop && { fontSize: scale(14) }
                      ]}>
                        {formatDate(item.created_at)} • {weight.toFixed(1)}kg
                      </Text>
                    </View>
                    <ChevronRight size={20} color={Colors.textSecondary} />
                  </View>
                );
              })
            ) : (
              <View style={[
                styles.emptyStateSmall,
                isDesktop && { padding: scale(40), borderRadius: scale(16) }
              ]}>
                <Text style={[styles.emptyStateTextSmall, isDesktop && { fontSize: scale(16) }]}>
                  No activity yet
                </Text>
                <Text style={[styles.emptyStateSubtextSmall, isDesktop && { fontSize: scale(14) }]}>
                  Your recent logs will appear here
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tablet impact section */}
        {isTablet && !isDesktop && (
          <View style={styles.tabletImpactSection}>
            <LinearGradient
              colors={['#f8f9fa', '#ffffff']}
              style={styles.tabletImpactCard}
            >
              <View style={styles.impactStatRow}>
                <View style={styles.impactStat}>
                  <Leaf size={20} color={Colors.primary} />
                  <Text style={styles.impactValueSmall}>{impactStats.co2Saved.toFixed(1)}kg</Text>
                  <Text style={styles.impactLabelSmall}>CO₂ Saved</Text>
                </View>
                <View style={styles.impactStat}>
                  <Award size={20} color={Colors.primary} />
                  <Text style={styles.impactValueSmall}>{impactStats.waterSaved.toFixed(0)}L</Text>
                  <Text style={styles.impactLabelSmall}>Water Saved</Text>
                </View>
                <View style={styles.impactStat}>
                  <Users size={20} color={Colors.primary} />
                  <Text style={styles.impactValueSmall}>{impactStats.treesSaved.toFixed(1)}</Text>
                  <Text style={styles.impactLabelSmall}>Trees Saved</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  logoSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCardWrapper: {
    width: '100%',
    zIndex: 10,
  },
  statsCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statsCardDesktop: {
    paddingVertical: 32,
    borderRadius: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLeft: {
    flex: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  impactMetrics: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  impactMetric: {
    flex: 1,
  },
  impactValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  impactMetricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  environmentalImpact: {
    backgroundColor: Colors.surfaceSecondary,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  environmentalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  environmentalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  environmentalMetric: {
    alignItems: 'center',
  },
  environmentalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  environmentalLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  desktopImpactStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    marginLeft: 20,
  },
  desktopImpactStat: {
    alignItems: 'center',
  },
  desktopImpactValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  desktopImpactLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  impactDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  collectorEarnings: {
    marginTop: 16,
  },
  earningsDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  earningsText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    paddingTop: 0,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  quickLogHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  quickLogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickLogCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickLogIconLarge: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickLogEmojiLarge: {
    fontSize: 36,
  },
  quickLogLabelLarge: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  quickLogTap: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  weekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weekBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  desktopGrid: {
    flexDirection: 'row',
    gap: 32,
  },
  desktopGridItem: {
    flex: 1,
  },
  itemsGrid: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemType: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  itemWeight: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  itemDate: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyStateSmall: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  emptyStateTextSmall: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyStateSubtextSmall: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  recentItemIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentItemInfo: {
    flex: 1,
  },
  recentItemType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  recentItemDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tabletImpactSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  tabletImpactCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  impactStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  impactStat: {
    alignItems: 'center',
  },
  impactValueSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 4,
  },
  impactLabelSmall: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  collectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  collectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  collectionStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  collectionHousehold: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  collectionEstimate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});