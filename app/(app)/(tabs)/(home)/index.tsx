import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { Header } from '@/components/home/Header';
import { StatsCard } from '@/components/home/StatsCard';
import { QuickLogSection } from '@/components/home/QuickLogSection';
import { UpcomingCollections } from '@/components/home/UpcomingCollections';
import { RecentActivity } from '@/components/home/RecentActivity';
import { TabletImpactSection } from '@/components/home/TabletImpactSection';
import { SkeletonBlock, SkeletonList } from '@/components/Skeleton';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

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

// Recyclable types with icons
const RECYCLABLE_TYPES = [
  { type: 'plastic', label: 'Plastic', emoji: '🫙', color: '#2D9B5E', bgColor: '#2D9B5E20' },
  { type: 'paper', label: 'Paper', emoji: '📰', color: '#3B82F6', bgColor: '#3B82F620' },
  { type: 'glass', label: 'Glass', emoji: '🍾', color: '#F59E0B', bgColor: '#F59E0B20' },
  { type: 'metal', label: 'Metal', emoji: '🥫', color: '#EF4444', bgColor: '#EF444420' },
  { type: 'cardboard', label: 'Cardboard', emoji: '📦', color: '#8B5CF6', bgColor: '#8B5CF620' },
];

export default function HomeScreen() {
  const router = useRouter();
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
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weekly = items.filter(item => new Date(item.created_at) >= weekAgo);
      setWeeklyItems(weekly);
      
      const stats = weekly.reduce((acc, item) => {
        const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
        return {
          totalWeight: acc.totalWeight + weight,
          itemCount: acc.itemCount + 1,
        };
      }, { totalWeight: 0, itemCount: 0 });
      
      setWeeklyStats(stats);
      
      setImpactStats({
        co2Saved: stats.totalWeight * 2.5,
        treesSaved: (stats.totalWeight * 2.5) / 21,
        waterSaved: stats.totalWeight * 17,
      });
      
      setRecentLogs(items.slice(0, 5));
    }
  }, [items]);

  // Get upcoming collections
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
      <Header isDesktop={isDesktop} scale={scale} layout={layout} />

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
        {isDesktop ? (
          // Desktop 2-Column Layout
          <View style={styles.desktopGrid}>
            <View style={{ flex: 1, gap: 24 }}>
              <QuickLogSection isDesktop={isDesktop} scale={scale} />
              
              <View style={{ width: '100%' }}>
                <Text style={{ marginBottom: 16, fontSize: scale(24), fontWeight: '700', color: Colors.text }}>
                  Your Impact Overview
                </Text>
                {loading ? (
                  <SkeletonBlock height={160} />
                ) : (
                  <StatsCard 
                    weeklyStats={weeklyStats}
                    impactStats={impactStats}
                    isCollector={isCollector}
                    isDesktop={isDesktop}
                    scale={scale}
                    layout={{ paddingHorizontal: 0, contentMaxWidth: '100%' }}
                  />
                )}
              </View>
            </View>

            <View style={{ flex: 1, gap: 24 }}>
              {isCollector && (
                <UpcomingCollections 
                  collections={upcomingCollections}
                  isDesktop={isDesktop}
                  scale={scale}
                />
              )}
              
              {loading ? (
                <View style={{ marginTop: 0 }}>
                  <Text style={{ fontSize: scale(20), fontWeight: '700', color: Colors.text, marginBottom: 16 }}>Recent Activity</Text>
                  <SkeletonList count={4} height={70} />
                </View>
              ) : (
                <RecentActivity 
                  items={items}
                  recentLogs={recentLogs}
                  getIcon={getIcon}
                  getLabel={getLabel}
                  getColor={getColor}
                  formatDate={formatDate}
                  isDesktop={isDesktop}
                  scale={scale}
                />
              )}
            </View>
          </View>
        ) : (
          // Mobile Stacked Layout
          <View style={{ gap: 24 }}>
            <QuickLogSection isDesktop={false} scale={scale} />

            {isCollector && (
              <UpcomingCollections 
                collections={upcomingCollections}
                isDesktop={false}
                scale={scale}
              />
            )}

            {loading ? (
              <View style={{ marginTop: 0 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 16 }}>Recent Activity</Text>
                <SkeletonList count={4} height={70} />
              </View>
            ) : (
              <RecentActivity 
                items={items}
                recentLogs={recentLogs}
                getIcon={getIcon}
                getLabel={getLabel}
                getColor={getColor}
                formatDate={formatDate}
                isDesktop={false}
                scale={scale}
              />
            )}

            {isTablet && (
              <TabletImpactSection impactStats={impactStats} />
            )}

            <View style={{ width: '100%' }}>
              <Text style={{ marginBottom: 16, fontSize: 20, fontWeight: '700', color: Colors.text }}>
                Your Impact Overview
              </Text>
              {loading ? (
                <SkeletonBlock height={160} />
              ) : (
                <StatsCard 
                  weeklyStats={weeklyStats}
                  impactStats={impactStats}
                  isCollector={isCollector}
                  isDesktop={false}
                  scale={scale}
                  layout={{ paddingHorizontal: 0, contentMaxWidth: '100%' }}
                />
              )}
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    paddingTop: 24,
  },
  desktopGrid: {
    flexDirection: 'row',
    gap: 32,
  },
});