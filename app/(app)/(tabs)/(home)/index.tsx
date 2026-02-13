import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Recycle, TrendingUp, Calendar, Trash2, Leaf, Award, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

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

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data
  const estimatedEarnings = 245.50;
  const totalWeight = 12.5;
  const impactStats = {
    co2Saved: 18.75,
    treesSaved: 2.5,
    waterSaved: 1250,
  };
  
  const recyclableTypes = [
    { type: 'plastic', label: 'Plastic', price: 12, emoji: '🫙', color: '#2D9B5E' },
    { type: 'paper', label: 'Paper', price: 8, emoji: '📰', color: '#3B82F6' },
    { type: 'glass', label: 'Glass', price: 5, emoji: '🍾', color: '#F59E0B' },
    { type: 'metal', label: 'Metal', price: 15, emoji: '🥫', color: '#EF4444' },
    { type: 'cardboard', label: 'Cardboard', price: 7, emoji: '📦', color: '#8B5CF6' },
  ];
  
  const weeklyItems = [
    { type: 'plastic', weight: 2.5, value: 30 },
    { type: 'paper', weight: 1.8, value: 14.40 },
    { type: 'glass', weight: 3.2, value: 16 },
    ...(isDesktop ? [{ type: 'metal', weight: 1.2, value: 18 }] : []),
  ];
  
  const recentLogs = [
    { id: '1', type: 'plastic', quantity: 5, unit: 'kg', date: new Date('2024-02-10T10:30:00') },
    { id: '2', type: 'glass', quantity: 3, unit: 'kg', date: new Date('2024-02-09T15:45:00') },
    { id: '3', type: 'paper', quantity: 2, unit: 'kg', date: new Date('2024-02-08T09:15:00') },
    ...(isDesktop ? [
      { id: '4', type: 'metal', quantity: 1.5, unit: 'kg', date: new Date('2024-02-07T14:20:00') }
    ] : []),
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getIcon = (type: string) => {
    const item = recyclableTypes.find(t => t.type === type);
    return item?.emoji || '♻️';
  };

  const getLabel = (type: string) => {
    const item = recyclableTypes.find(t => t.type === type);
    return item?.label || type;
  };

  const getColor = (type: string) => {
    const item = recyclableTypes.find(t => t.type === type);
    return item?.color || Colors.primary;
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
      contentMaxWidth: '100%',
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
              {user?.name || 'Recycler'}
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

      {/* Earnings Card - Separate from header */}
      <View style={[
        styles.earningsCardWrapper,
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
            styles.earningsCard,
            isDesktop && styles.earningsCardDesktop
          ]}
        >
          <View style={styles.earningsRow}>
            <View style={styles.earningsLeft}>
              <View style={styles.earningsHeader}>
                <TrendingUp size={isDesktop ? 24 : 20} color={Colors.primary} />
                <Text style={[styles.earningsLabel, isDesktop && { fontSize: scale(18) }]}>
                  Estimated Earnings
                </Text>
              </View>
              <Text style={[styles.earningsAmount, isDesktop && { fontSize: scale(48) }]}>
                R{estimatedEarnings.toFixed(2)}
              </Text>
              <Text style={[styles.earningsSubtext, isDesktop && { fontSize: scale(16) }]}>
                {totalWeight.toFixed(1)}kg ready for collection
              </Text>
            </View>
            
            {/* Desktop impact stats */}
            {isDesktop && (
              <View style={styles.impactStats}>
                <View style={styles.impactStat}>
                  <Leaf size={24} color={Colors.primary} />
                  <Text style={styles.impactValue}>{impactStats.co2Saved}kg</Text>
                  <Text style={styles.impactLabel}>CO₂ Saved</Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.impactStat}>
                  <Award size={24} color={Colors.primary} />
                  <Text style={styles.impactValue}>{impactStats.treesSaved}</Text>
                  <Text style={styles.impactLabel}>Trees Saved</Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.impactStat}>
                  <Users size={24} color={Colors.primary} />
                  <Text style={styles.impactValue}>{impactStats.waterSaved}L</Text>
                  <Text style={styles.impactLabel}>Water Saved</Text>
                </View>
              </View>
            )}
          </View>
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
        {/* Quick Log Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDesktop && { fontSize: scale(24) }]}>
              Quick Log
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/(home)/log-item')}>
              <Text style={[styles.seeAllText, isDesktop && { fontSize: scale(16) }]}>
                See all
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.quickLogScroll}
          >
            {recyclableTypes.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.quickLogItem,
                  isDesktop && { width: scale(100), marginRight: scale(20) }
                ]}
                onPress={() => router.push({
                  pathname: '/(tabs)/(home)/log-item',
                  params: { type: item.type }
                })}
              >
                <View style={[
                  styles.quickLogIcon,
                  { 
                    backgroundColor: item.color + '20',
                    width: isDesktop ? scale(70) : 56,
                    height: isDesktop ? scale(70) : 56,
                    borderRadius: isDesktop ? scale(20) : 16,
                  }
                ]}>
                  <Text style={[
                    styles.quickLogEmoji,
                    isDesktop && { fontSize: scale(32) }
                  ]}>
                    {item.emoji}
                  </Text>
                </View>
                <Text style={[
                  styles.quickLogLabel,
                  isDesktop && { fontSize: scale(16), marginTop: scale(8) }
                ]}>
                  {item.label}
                </Text>
                <Text style={[
                  styles.quickLogPrice,
                  isDesktop && { fontSize: scale(14) }
                ]}>
                  R{item.price}/kg
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

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
                {weeklyItems.map((item, index) => (
                  <View key={index} style={[
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
                        {getLabel(item.type)}
                      </Text>
                      <Text style={[
                        styles.itemWeight,
                        isDesktop && { fontSize: scale(16) }
                      ]}>
                        {item.weight.toFixed(1)} kg
                      </Text>
                    </View>
                    <Text style={[
                      styles.itemValue,
                      isDesktop && { fontSize: scale(20) }
                    ]}>
                      R{item.value.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[
                styles.emptyState,
                isDesktop && { padding: scale(60), borderRadius: scale(20) }
              ]}>
                <Recycle size={isDesktop ? 64 : 48} color={Colors.textLight} />
                <Text style={[styles.emptyStateText, isDesktop && { fontSize: scale(18), marginTop: scale(20) }]}>
                  No items logged this week
                </Text>
                <Text style={[styles.emptyStateSubtext, isDesktop && { fontSize: scale(16), marginTop: scale(8) }]}>
                  Tap the + button to log your recyclables
                </Text>
              </View>
            )}
          </View>

          {/* Recent Logs - Right column on desktop */}
          <View style={[
            styles.section,
            isDesktop && styles.desktopGridItem
          ]}>
            <Text style={[styles.sectionTitle, isDesktop && { fontSize: scale(24), marginBottom: scale(24) }]}>
              Recent Logs
            </Text>
            
            {recentLogs.map((item) => (
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
                    {getLabel(item.type)}
                  </Text>
                  <Text style={[
                    styles.recentItemDate,
                    isDesktop && { fontSize: scale(14) }
                  ]}>
                    {item.date.toLocaleDateString('en-ZA', { 
                      day: 'numeric', 
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <Text style={[
                  styles.recentItemQuantity,
                  isDesktop && { fontSize: scale(16) }
                ]}>
                  {item.quantity} {item.unit}
                </Text>
                <TouchableOpacity 
                  style={[styles.deleteButton, isDesktop && { padding: scale(10) }]}
                  onPress={() => console.log('Delete', item.id)}
                >
                  <Trash2 size={isDesktop ? 20 : 18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
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
                  <Text style={styles.impactValueSmall}>{impactStats.co2Saved}kg</Text>
                  <Text style={styles.impactLabelSmall}>CO₂ Saved</Text>
                </View>
                <View style={styles.impactStat}>
                  <Award size={20} color={Colors.primary} />
                  <Text style={styles.impactValueSmall}>{impactStats.treesSaved}</Text>
                  <Text style={styles.impactLabelSmall}>Trees Saved</Text>
                </View>
                <View style={styles.impactStat}>
                  <Users size={20} color={Colors.primary} />
                  <Text style={styles.impactValueSmall}>{impactStats.waterSaved}L</Text>
                  <Text style={styles.impactLabelSmall}>Water Saved</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={{ height: isDesktop ? 120 : 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          { 
            bottom: insets.bottom + (isDesktop ? 40 : 20),
            right: isDesktop ? 40 : 20,
            width: isDesktop ? scale(70) : 60,
            height: isDesktop ? scale(70) : 60,
            borderRadius: isDesktop ? scale(35) : 30,
          }
        ]}
        onPress={() => router.push('/(tabs)/(home)/log-item')}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={[
            styles.fabGradient,
            {
              width: isDesktop ? scale(70) : 60,
              height: isDesktop ? scale(70) : 60,
              borderRadius: isDesktop ? scale(35) : 30,
            }
          ]}
        >
          <Plus size={isDesktop ? scale(32) : 28} color={Colors.white} strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>
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
  earningsCardWrapper: {
    width: '100%',
    zIndex: 10,
  },
  earningsCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  earningsCardDesktop: {
    paddingVertical: 32,
    borderRadius: 24,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLeft: {
    flex: 1,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  earningsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  earningsSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  impactStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  impactStat: {
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  impactLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  impactDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    paddingTop: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  quickLogScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  quickLogItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  quickLogIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLogEmoji: {
    fontSize: 28,
  },
  quickLogLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  quickLogPrice: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
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
    borderRadius: 12,
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
  itemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
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
  recentItemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  deleteButton: {
    padding: 8,
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
  fab: {
    position: 'absolute',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});