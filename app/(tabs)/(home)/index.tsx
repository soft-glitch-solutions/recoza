import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Recycle, TrendingUp, Calendar, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { RecyclableType } from '@/types';

const RECYCLABLE_ICONS: Record<RecyclableType, string> = {
  plastic: '🫙',
  paper: '📰',
  glass: '🍾',
  metal: '🥫',
  cardboard: '📦',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { uncollectedItems, weeklyItems, estimatedEarnings, prices, deleteItem } = useRecyclables();
  const [refreshing, setRefreshing] = useState(false);

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

  const getTotalWeight = () => {
    return uncollectedItems.reduce((sum, item) => {
      return sum + (item.unit === 'kg' ? item.quantity : item.quantity * 0.05);
    }, 0);
  };

  const getItemsByType = () => {
    const grouped: Record<RecyclableType, number> = {
      plastic: 0,
      paper: 0,
      glass: 0,
      metal: 0,
      cardboard: 0,
    };
    
    uncollectedItems.forEach(item => {
      const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
      grouped[item.type] += weight;
    });
    
    return Object.entries(grouped)
      .filter(([_, weight]) => weight > 0)
      .map(([type, weight]) => ({
        type: type as RecyclableType,
        weight,
        price: prices.find(p => p.type === type)?.pricePerKg || 0,
      }));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Recycler'}</Text>
          </View>
          <View style={styles.logoSmall}>
            <Recycle size={24} color={Colors.white} />
          </View>
        </View>

        <View style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.earningsLabel}>Estimated Earnings</Text>
          </View>
          <Text style={styles.earningsAmount}>R{estimatedEarnings.toFixed(2)}</Text>
          <Text style={styles.earningsSubtext}>
            {getTotalWeight().toFixed(1)}kg ready for collection
          </Text>
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Log</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/(home)/log-item')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickLogScroll}>
            {prices.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={styles.quickLogItem}
                onPress={() => router.push({
                  pathname: '/(tabs)/(home)/log-item',
                  params: { type: item.type }
                })}
              >
                <View style={[styles.quickLogIcon, { backgroundColor: Colors.recyclables[item.type] + '20' }]}>
                  <Text style={styles.quickLogEmoji}>{RECYCLABLE_ICONS[item.type]}</Text>
                </View>
                <Text style={styles.quickLogLabel}>{item.label}</Text>
                <Text style={styles.quickLogPrice}>R{item.pricePerKg}/kg</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Week's Items</Text>
            <View style={styles.weekBadge}>
              <Calendar size={14} color={Colors.primary} />
              <Text style={styles.weekBadgeText}>{weeklyItems.length} items</Text>
            </View>
          </View>

          {getItemsByType().length > 0 ? (
            <View style={styles.itemsGrid}>
              {getItemsByType().map((item) => (
                <View key={item.type} style={styles.itemCard}>
                  <View style={[styles.itemIconContainer, { backgroundColor: Colors.recyclables[item.type] + '15' }]}>
                    <Text style={styles.itemEmoji}>{RECYCLABLE_ICONS[item.type]}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemType}>{prices.find(p => p.type === item.type)?.label}</Text>
                    <Text style={styles.itemWeight}>{item.weight.toFixed(1)} kg</Text>
                  </View>
                  <Text style={styles.itemValue}>R{(item.weight * item.price).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Recycle size={48} color={Colors.textLight} />
              <Text style={styles.emptyStateText}>No items logged this week</Text>
              <Text style={styles.emptyStateSubtext}>Tap the + button to log your recyclables</Text>
            </View>
          )}
        </View>

        {uncollectedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Logs</Text>
            {uncollectedItems.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.recentItem}>
                <View style={[styles.recentItemIcon, { backgroundColor: Colors.recyclables[item.type] + '15' }]}>
                  <Text>{RECYCLABLE_ICONS[item.type]}</Text>
                </View>
                <View style={styles.recentItemInfo}>
                  <Text style={styles.recentItemType}>{prices.find(p => p.type === item.type)?.label}</Text>
                  <Text style={styles.recentItemDate}>
                    {new Date(item.loggedAt).toLocaleDateString('en-ZA', { 
                      day: 'numeric', 
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <Text style={styles.recentItemQuantity}>
                  {item.quantity} {item.unit}
                </Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteItem(item.id)}
                >
                  <Trash2 size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        onPress={() => router.push('/(tabs)/(home)/log-item')}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.fabGradient}
        >
          <Plus size={28} color={Colors.white} strokeWidth={2.5} />
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
    paddingBottom: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
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
  earningsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    marginLeft: 20,
    marginRight: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
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
    fontWeight: '500' as const,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  earningsSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    marginTop: 50,
  },
  contentContainer: {
    paddingTop: 16,
    paddingHorizontal: 20,
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
    fontWeight: '700' as const,
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
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
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLogEmoji: {
    fontSize: 28,
  },
  quickLogLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
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
    fontWeight: '600' as const,
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
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
    fontWeight: '600' as const,
    color: Colors.text,
  },
  itemWeight: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '700' as const,
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
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  recentItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentItemInfo: {
    flex: 1,
  },
  recentItemType: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  recentItemDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recentItemQuantity: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
