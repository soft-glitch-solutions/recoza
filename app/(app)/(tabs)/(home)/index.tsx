import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/home/Header';
import { StatsCard } from '@/components/home/StatsCard';
import { QuickLogSection } from '@/components/home/QuickLogSection';
import { UpcomingCollections } from '@/components/home/UpcomingCollections';
import { RecentActivity } from '@/components/home/RecentActivity';
import { SkeletonBlock, SkeletonList } from '@/components/Skeleton';
import { ChevronRight, ShieldCheck, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  const { colors } = useTheme();
  const { 
    recyclableItems = [], 
    collections = [], 
    loading,
    refreshData,
  } = useRecyclables();
  
  const [refreshing, setRefreshing] = useState(false);

  const isCollector = profile?.is_collector || profile?.collector_approved || false;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.primary} 
          />
        }
      >
        <View style={styles.content}>
          {/* 1. Quick Log Hero */}
          <QuickLogSection />

          {/* 2. Become a Collector CTA (For non-collectors) */}
          {!isCollector && (
            <TouchableOpacity 
              style={[styles.collectorCTA, { backgroundColor: colors.secondary }]}
              onPress={() => router.push('/profile')}
            >
              <View style={styles.ctaContent}>
                <View style={styles.ctaIconContainer}>
                  <ShieldCheck size={24} color={colors.secondary} />
                </View>
                <View style={styles.ctaTextContainer}>
                  <Text style={styles.ctaTitle}>Become a Collector</Text>
                  <Text style={styles.ctaSubtitle}>Earn rewards for every kg collected</Text>
                </View>
                <View style={[styles.arrowContainer, { backgroundColor: colors.accent }]}>
                   <ArrowRight size={16} color={colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* 3. Unified Stats (The 3 Pills) */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Personal Impact</Text>
          </View>
          {loading ? (
            <SkeletonBlock height={100} />
          ) : (
            <StatsCard 
              itemsCount={recyclableItems.length}
              totalWeight={recyclableItems.reduce((acc, item) => acc + (item.estimatedWeightKg || 0), 0)}
              isCollector={isCollector}
            />
          )}

          {/* 3. Collector Tasks (If applicable) */}
          {isCollector && (
            <>
              <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Tasks</Text>
                <TouchableOpacity onPress={() => router.push('/collections' as any)}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
                </TouchableOpacity>
              </View>
              {loading ? (
                <SkeletonList count={2} height={80} />
              ) : (
                <UpcomingCollections 
                  collections={collections.filter(c => c.status === 'scheduled').slice(0, 3)}
                />
              )}
            </>
          )}

          {/* 4. Recent Activity */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          </View>
          {loading ? (
            <SkeletonList count={3} height={70} />
          ) : (
            <RecentActivity 
              items={recyclableItems.slice(0, 5)}
            />
          )}

          <TouchableOpacity 
            style={styles.historyLink}
            onPress={() => router.push('/history' as any)}
          >
            <Text style={[styles.historyLinkText, { color: colors.textSecondary }]}>
              View Activity History
            </Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  collectorCTA: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ctaIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  ctaSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 20,
  },
  historyLinkText: {
    fontSize: 15,
    fontWeight: '600',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});