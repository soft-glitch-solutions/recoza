import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
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
import { ChevronRight, ShieldCheck, ArrowRight, UserPlus, CheckCircle, Phone, Zap } from 'lucide-react-native';

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
  const { linkToCollector, linkedCollector } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const isCollector = profile?.is_collector || profile?.collector_approved || false;

  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: '-10deg' }],
  }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleLinkCollector = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    setIsLinking(true);
    const result = await linkToCollector(inviteCode);
    setIsLinking(false);

    if (result.success) {
      setInviteCode('');
      Alert.alert('Success', 'Collector linked successfully!');
    } else {
      Alert.alert('Error', result.error || 'Failed to link collector');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ zIndex: 1000 }}>
        <Header />
      </View>

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

          {/* New: Recycling That Pays - Cool Movement Section */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.paysCard, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/impact')}
          >
            <View style={styles.paysContent}>
              <View style={styles.paysTextContainer}>
                <Text style={styles.paysTitle}>Recycling That Pays</Text>
                <Text style={styles.paysSubtitle}>Turn your trash into treasure. See your earned rewards.</Text>
              </View>
              <Animated.View style={[styles.paysIconContainer, { backgroundColor: colors.accent }, animatedIconStyle]}>
                <Zap size={24} color={colors.primary} />
              </Animated.View>
            </View>
          </TouchableOpacity>

          {/* 2. Link Collector Section (For unlinked households) */}
          {!isCollector && !linkedCollector && (
            <View style={[styles.linkCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={[styles.linkIconContainer, { backgroundColor: colors.accent + '20' }]}>
                <UserPlus size={24} color={colors.primary} />
              </View>
              <View style={styles.linkContent}>
                <Text style={[styles.linkTitle, { color: colors.text }]}>Link a Collector</Text>
                <Text style={[styles.linkSubtitle, { color: colors.textSecondary }]}>
                  Enter your collector's code to start scheduling collections.
                </Text>
                <View style={styles.linkInputRow}>
                  <TextInput
                    style={[styles.linkInput, { backgroundColor: colors.surfaceSecondary, color: colors.text }]}
                    placeholder="Enter Invite Code"
                    placeholderTextColor={colors.textSecondary}
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={[styles.linkSubmitButton, { backgroundColor: colors.primary }]}
                    onPress={handleLinkCollector}
                    disabled={isLinking}
                  >
                    {isLinking ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <ArrowRight size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* 2. Linked Collector Display (For linked households) */}
          {/* 4. Upcoming Collections */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Pickups</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Scheduled recycle collections</Text>
          </View>
          {!isCollector && linkedCollector && (
            <View style={[styles.collectorDisplayCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.collectorDisplayHeader}>
                <View style={[styles.avatarSmall, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.avatarSmallText, { color: colors.primary }]}>
                    {linkedCollector.full_name?.charAt(0) || 'C'}
                  </Text>
                </View>
                <View style={styles.collectorDisplayTexts}>
                  <Text style={[styles.collectorDisplayName, { color: colors.text }]}>{linkedCollector.full_name}</Text>
                  <View style={styles.collectorBadgeRow}>
                    <CheckCircle size={14} color="#16A34A" />
                    <Text style={styles.collectorBadgeText}>Linked Collector</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.callButton, { backgroundColor: colors.primary + '15' }]}
                  onPress={() => Linking.openURL(`tel:${linkedCollector.phone_number}`)}
                >
                  <Phone size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

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
          {/* 3. Your Stats */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Performance</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Tracking your environmental impact</Text>
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

          {/* 5. Recent Activity */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Your latest recycling logs</Text>
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
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  paysCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#000000',
  },
  paysContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paysTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  paysTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  paysSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  paysIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-10deg' }],
    borderWidth: 3,
    borderColor: '#000000',
  },
  linkCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#000000',
    marginBottom: 24,
    flexDirection: 'row',
    gap: 16,
  },
  linkIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  linkSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  linkInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  linkInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 3,
    borderColor: '#000000',
  },
  linkSubmitButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  collectorDisplayCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#000000',
    marginBottom: 24,
  },
  collectorDisplayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: {
    fontSize: 18,
    fontWeight: '800',
  },
  collectorDisplayTexts: {
    flex: 1,
  },
  collectorDisplayName: {
    fontSize: 16,
    fontWeight: '700',
  },
  collectorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  collectorBadgeText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});