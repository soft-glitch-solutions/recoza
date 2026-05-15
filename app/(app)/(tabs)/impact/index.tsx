import { View, Text, StyleSheet, ScrollView, Dimensions, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Leaf, 
  Droplets, 
  Zap, 
  TreePine, 
  Award, 
  Target,
  Globe,
  Sparkles,
  Flame,
  Medal,
  Star,
  Recycle
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { useAuth } from '@/contexts/AuthContext';
import { SkeletonBlock } from '@/components/Skeleton';
import { useTheme } from '@/contexts/ThemeContext';
import { RecyclableItem } from '@/types';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  current: number;
  unit: string;
  unlocked: boolean;
  color: string;
}

export default function ImpactScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { recyclableItems = [], collectorStats, loading } = useRecyclables();
  const { colors, isDark } = useTheme();
  
  const [streak, setStreak] = useState(0);
  const [weeklyWeight, setWeeklyWeight] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    if (recyclableItems && recyclableItems.length > 0) {
      const total = recyclableItems.reduce((sum: number, item: RecyclableItem) => {
        if (!item) return sum;
        // If the item has estimatedWeightKg, use it, otherwise fall back to quantity-based estimate
        return sum + (item.estimatedWeightKg || (item.quantity * 0.1) || 0);
      }, 0);
      
      setTotalWeight(total);
      setStreak(getConsecutiveDays(recyclableItems));
      setWeeklyWeight(getWeeklyWeight(recyclableItems));
    }
  }, [recyclableItems]);

  const co2Saved = totalWeight * 2.5 || 0;
  const waterSaved = totalWeight * 17 || 0;
  const energySaved = totalWeight * 4.2 || 0;
  const treeEquivalent = co2Saved / 21 || 0;

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Log your first recyclable item',
      icon: <Sparkles size={isDesktop ? 28 : 24} color="#fff" />,
      requirement: 1,
      current: recyclableItems?.length || 0,
      unit: 'items',
      unlocked: (recyclableItems?.length || 0) >= 1,
      color: colors.accent,
    },
    {
      id: '2',
      title: 'Eco Warrior',
      description: 'Recycle 10kg of materials',
      icon: <Leaf size={isDesktop ? 28 : 24} color="#fff" />,
      requirement: 10,
      current: totalWeight,
      unit: 'kg',
      unlocked: totalWeight >= 10,
      color: colors.primary,
    },
    {
      id: '3',
      title: 'Planet Protector',
      description: 'Save 50kg of CO₂ emissions',
      icon: <Globe size={isDesktop ? 28 : 24} color="#fff" />,
      requirement: 50,
      current: co2Saved,
      unit: 'kg CO₂',
      unlocked: co2Saved >= 50,
      color: colors.info,
    },
    {
      id: '4',
      title: 'Consistency King',
      description: 'Log items for 7 consecutive days',
      icon: <Flame size={isDesktop ? 28 : 24} color="#fff" />,
      requirement: 7,
      current: streak,
      unit: 'days',
      unlocked: streak >= 7,
      color: colors.secondary,
    },
    {
      id: '5',
      title: 'Community Builder',
      description: 'Complete 5 collections as a collector',
      icon: <Medal size={isDesktop ? 28 : 24} color="#fff" />,
      requirement: 5,
      current: collectorStats?.totalCollections || 0,
      unit: 'collections',
      unlocked: (collectorStats?.totalCollections || 0) >= 5,
      color: colors.primaryDark,
    },
    {
      id: '6',
      title: 'Recycling Master',
      description: 'Recycle 100kg of materials',
      icon: <Star size={isDesktop ? 28 : 24} color="#fff" />,
      requirement: 100,
      current: totalWeight,
      unit: 'kg',
      unlocked: totalWeight >= 100,
      color: '#3293ca', // info
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const layout = {
    contentMaxWidth: isDesktop ? 1200 : isTablet ? 800 : '100%',
    paddingHorizontal: isDesktop ? 40 : isTablet ? 32 : 20,
    headerPaddingBottom: isDesktop ? 30 : isTablet ? 24 : 20,
  };

  const renderImpactRing = (solidColor: string, icon: any, value: string, label: string, progress: number) => (
    <View style={styles.impactRingContainer}>
      <View style={[styles.ringOuter, { borderColor: solidColor + '20' }]}>
         <View style={[styles.ringInner, { backgroundColor: solidColor + '10' }]}>
           <View style={[styles.ringContent]}>
             {icon}
             <Text style={[styles.ringValue, { color: colors.text }]}>{value}</Text>
           </View>
         </View>
         {/* Simple circular progress visualization using borders */}
         <View style={[styles.ringProgress, { 
           borderColor: solidColor, 
           borderTopWidth: 4, 
           borderRightWidth: progress > 0.25 ? 4 : 0,
           borderBottomWidth: progress > 0.5 ? 4 : 0,
           borderLeftWidth: progress > 0.75 ? 4 : 0,
         }]} />
      </View>
      <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { 
            paddingTop: insets.top + (isDesktop ? 24 : 16),
            paddingBottom: layout.headerPaddingBottom + 20,
            backgroundColor: colors.background,
          }
        ]}
      >
        <View style={[
          styles.headerContent,
          {
            paddingHorizontal: layout.paddingHorizontal as any,
            maxWidth: layout.contentMaxWidth as any,
            alignSelf: 'center',
            width: '100%',
          }
        ]}>
          <View>
            <Text style={[styles.headerTitle, isDesktop && { fontSize: 36 }, { color: colors.primary }]}>
              Your Impact
            </Text>
            <Text style={[styles.headerSubtitle, isDesktop && { fontSize: 18 }, { color: colors.textSecondary }]}>
              Making South Africa greener, one item at a time
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: layout.paddingHorizontal as any, maxWidth: layout.contentMaxWidth as any, alignSelf: 'center', width: '100%', marginTop: -25, marginBottom: isDesktop ? 32 : 24 }}>
          <SkeletonBlock height={140} />
        </View>
      ) : (
      <View style={[
        styles.mainStatCardWrapper,
        {
          paddingHorizontal: layout.paddingHorizontal as any,
          maxWidth: layout.contentMaxWidth as any,
          alignSelf: 'center',
          width: '100%',
          marginTop: -25,
          marginBottom: isDesktop ? 32 : 24,
        }
      ]}>
        <View style={[
          styles.mainStatCard,
          isDesktop && { padding: 28, borderRadius: 28 },
          { backgroundColor: colors.surface, borderColor: colors.borderLight, borderLeftWidth: 8, borderLeftColor: colors.primary }
        ]}>
          <View style={[
            styles.mainStatIcon,
            isDesktop && { width: 90, height: 90, borderRadius: 28 },
            { backgroundColor: colors.accent }
          ]}>
            <Recycle size={isDesktop ? 48 : 36} color={colors.primary} />
          </View>
          <View style={styles.mainStatContent}>
            <Text style={[styles.mainStatValue, isDesktop && { fontSize: 52 }, { color: colors.primary }]}>
              {totalWeight.toFixed(1)} kg
            </Text>
            <Text style={[styles.mainStatLabel, isDesktop && { fontSize: 18 }, { color: colors.textSecondary }]}>
              Total Recycled
            </Text>
            
            <View style={[styles.quickStatsRow, { borderTopColor: colors.border }]}>
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatValue, { color: colors.text }]}>{recyclableItems?.length || 0}</Text>
                <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Items</Text>
              </View>
              <View style={[styles.quickStatDivider, { backgroundColor: colors.border } as ViewStyle]} />
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatValue, { color: colors.text }]}>{streak}</Text>
                <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Day Streak</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: layout.paddingHorizontal as any,
            maxWidth: layout.contentMaxWidth as any,
            alignSelf: 'center',
            width: '100%',
            paddingTop: 0,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infographicGrid}>
          {renderImpactRing(colors.info, <Droplets size={18} color={colors.info} />, `${waterSaved.toFixed(0)}L`, 'Water', 0.8)}
          {renderImpactRing(colors.primary, <Globe size={18} color={colors.primary} />, `${co2Saved.toFixed(0)}kg`, 'CO₂', 0.6)}
          {renderImpactRing(colors.secondary, <Zap size={18} color={colors.secondary} />, `${energySaved.toFixed(0)}kWh`, 'Energy', 0.4)}
          {renderImpactRing(colors.accent, <TreePine size={18} color={colors.accent} />, treeEquivalent.toFixed(1), 'Trees', 0.3)}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
            <View style={[styles.achievementCount, { backgroundColor: isDark ? '#1e293b' : '#E0F2FE' }]}>
              <Award size={14} color={colors.primary} />
              <Text style={[styles.achievementCountText, { color: colors.primary }]}>{unlockedCount}/{achievements.length}</Text>
            </View>
          </View>

          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard, 
                  { backgroundColor: achievement.unlocked ? colors.surface : colors.surfaceSecondary, borderColor: colors.borderLight }
                ]}
              >
                <View style={styles.achievementRow}>
                  <View style={[styles.achievementIcon, { backgroundColor: achievement.unlocked ? achievement.color : colors.textLight }]}>
                    {achievement.icon}
                  </View>
                  <View style={styles.achievementContent}>
                    <Text style={[styles.achievementTitle, !achievement.unlocked && styles.achievementTitleLocked, { color: colors.text }]}>{achievement.title}</Text>
                    <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>{achievement.description}</Text>
                  </View>
                  {achievement.unlocked && (
                    <View style={[styles.unlockedBadge, { backgroundColor: achievement.color }]}>
                      <Text style={styles.unlockedBadgeText}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressFill, { backgroundColor: achievement.unlocked ? achievement.color : colors.textLight, width: `${Math.min((achievement.current / achievement.requirement) * 100, 100)}%` }]} />
                  </View>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>{achievement.current.toFixed(1)}/{achievement.requirement} {achievement.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Weekly Goal</Text>
          <View style={[styles.goalCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <View style={styles.goalHeader}>
              <Target size={24} color={colors.primary} />
              <Text style={[styles.goalTitle, { color: colors.text }]}>Recycle 5kg this week</Text>
            </View>
            <View style={styles.goalProgressContainer}>
              <View style={[styles.goalProgressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.goalProgressFill, { backgroundColor: colors.primary, width: `${Math.min((weeklyWeight / 5) * 100, 100)}%` }]} />
              </View>
              <Text style={[styles.goalProgressText, { color: colors.textSecondary }]}>{weeklyWeight.toFixed(1)} / 5 kg</Text>
            </View>
            <View style={[styles.goalRewardContainer, { backgroundColor: isDark ? '#1e293b' : '#FEF3C7' }]}>
              <Sparkles size={16} color="#F59E0B" />
              <Text style={[styles.goalReward, { color: isDark ? '#fbbf24' : '#F59E0B' }]}>{weeklyWeight >= 5 ? '🎉 Goal achieved!' : `${(5 - weeklyWeight).toFixed(1)}kg to go!`}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: isDesktop ? 100 : 80 }} />
      </ScrollView>
    </View>
  );
}

function getConsecutiveDays(recyclables: RecyclableItem[]): number {
  if (!recyclables || recyclables.length === 0) return 0;
  try {
    const dates = [...new Set(recyclables.map(i => new Date(i.loggedAt).toDateString()))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
        const current = new Date(dates[i]);
        const next = new Date(dates[i + 1]);
        const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) streak++;
        else break;
    }
    return streak;
  } catch (error) { return 0; }
}

function getWeeklyWeight(recyclables: RecyclableItem[]): number {
  if (!recyclables || recyclables.length === 0) return 0;
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recyclables
      .filter(item => item && new Date(item.loggedAt) >= weekAgo)
      .reduce((sum: number, item: RecyclableItem) => {
        return sum + (item.estimatedWeightKg || item.quantity * 0.1 || 0);
      }, 0);
  } catch (error) { return 0; }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerContent: { width: '100%' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 },
  mainStatCardWrapper: { width: '100%', zIndex: 10 },
  mainStatCard: { borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8, borderWidth: 1 },
  mainStatIcon: { width: 64, height: 64, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  mainStatContent: { flex: 1 },
  mainStatValue: { fontSize: 32, fontWeight: '700' },
  mainStatLabel: { fontSize: 14, marginTop: 2 },
  quickStatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  quickStat: { flex: 1, alignItems: 'center' },
  quickStatValue: { fontSize: 18, fontWeight: '700' },
  quickStatLabel: { fontSize: 11, marginTop: 2 },
  quickStatDivider: { width: 1, height: 24 },
  scrollView: { flex: 1 },
  scrollContent: { width: '100%', paddingTop: 0 },
  infographicGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, marginBottom: 32 },
  impactRingContainer: { width: '47%', alignItems: 'center', marginBottom: 8 },
  ringOuter: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  ringInner: { width: 84, height: 84, borderRadius: 42, justifyContent: 'center', alignItems: 'center' },
  ringContent: { alignItems: 'center', justifyContent: 'center' },
  ringValue: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  ringLabel: { fontSize: 13, fontWeight: '600', marginTop: 10 },
  ringProgress: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderTransparent: true },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  achievementCount: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  achievementCountText: { fontSize: 12, fontWeight: '600' },
  achievementsGrid: { gap: 12 },
  achievementCard: { borderRadius: 20, padding: 16, borderWidth: 1 },
  achievementRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  achievementIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  achievementContent: { flex: 1 },
  achievementTitle: { fontSize: 16, fontWeight: '600' },
  achievementTitleLocked: { opacity: 0.6 },
  achievementDescription: { fontSize: 12, marginTop: 2 },
  unlockedBadge: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  unlockedBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  progressContainer: { marginTop: 12 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, marginTop: 6, textAlign: 'right', fontWeight: '500' },
  goalCard: { borderRadius: 20, padding: 20, borderWidth: 1 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  goalTitle: { fontSize: 16, fontWeight: '600' },
  goalProgressContainer: { marginBottom: 16 },
  goalProgressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  goalProgressFill: { height: '100%', borderRadius: 4 },
  goalProgressText: { fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: '500' },
  goalRewardContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12 },
  goalReward: { fontSize: 14, fontWeight: '600' },
});