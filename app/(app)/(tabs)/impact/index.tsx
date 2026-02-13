import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Leaf, 
  Droplets, 
  Zap, 
  TreePine, 
  Award, 
  Target,
  TrendingUp,
  Globe,
  Sparkles
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useEffect } from 'react';
import Colors from '@/constants/colors';
import { useRecyclables } from '@/contexts/RecyclablesContext';

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
  const { items, collectorStats } = useRecyclables();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const totalWeight = items.reduce((sum, item) => {
    return sum + (item.unit === 'kg' ? item.quantity : item.quantity * 0.05);
  }, 0);

  const co2Saved = totalWeight * 2.5;
  const waterSaved = totalWeight * 17;
  const energySaved = totalWeight * 4.2;
  const treeEquivalent = co2Saved / 21;

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Log your first recyclable item',
      icon: <Sparkles size={isDesktop ? 28 : 24} color={Colors.white} />,
      requirement: 1,
      current: items.length,
      unit: 'items',
      unlocked: items.length >= 1,
      color: '#10B981',
    },
    {
      id: '2',
      title: 'Eco Warrior',
      description: 'Recycle 10kg of materials',
      icon: <Leaf size={isDesktop ? 28 : 24} color={Colors.white} />,
      requirement: 10,
      current: totalWeight,
      unit: 'kg',
      unlocked: totalWeight >= 10,
      color: '#059669',
    },
    {
      id: '3',
      title: 'Planet Protector',
      description: 'Save 50kg of CO₂ emissions',
      icon: <Globe size={isDesktop ? 28 : 24} color={Colors.white} />,
      requirement: 50,
      current: co2Saved,
      unit: 'kg CO₂',
      unlocked: co2Saved >= 50,
      color: '#0EA5E9',
    },
    {
      id: '4',
      title: 'Consistency King',
      description: 'Log items for 7 consecutive days',
      icon: <Target size={isDesktop ? 28 : 24} color={Colors.white} />,
      requirement: 7,
      current: getConsecutiveDays(items),
      unit: 'days',
      unlocked: getConsecutiveDays(items) >= 7,
      color: '#8B5CF6',
    },
    {
      id: '5',
      title: 'Community Builder',
      description: 'Complete 5 collections as a collector',
      icon: <Award size={isDesktop ? 28 : 24} color={Colors.white} />,
      requirement: 5,
      current: collectorStats.totalCollections,
      unit: 'collections',
      unlocked: collectorStats.totalCollections >= 5,
      color: '#F59E0B',
    },
    {
      id: '6',
      title: 'Recycling Master',
      description: 'Recycle 100kg of materials',
      icon: <TrendingUp size={isDesktop ? 28 : 24} color={Colors.white} />,
      requirement: 100,
      current: totalWeight,
      unit: 'kg',
      unlocked: totalWeight >= 100,
      color: '#EC4899',
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const getLayoutConfig = () => {
    if (isDesktop) {
      return {
        contentMaxWidth: 1400,
        paddingHorizontal: 40,
        impactGridColumns: 4,
        headerPaddingBottom: 40,
      };
    }
    if (isTablet) {
      return {
        contentMaxWidth: 900,
        paddingHorizontal: 32,
        impactGridColumns: 2,
        headerPaddingBottom: 32,
      };
    }
    return {
      contentMaxWidth: '100%',
      paddingHorizontal: 20,
      impactGridColumns: 2,
      headerPaddingBottom: 20,
    };
  };

  const layout = getLayoutConfig();

  return (
    <View style={styles.container}>
      {/* Header - No floating card */}
      <LinearGradient
        colors={['#059669', '#047857']}
        style={[
          styles.header,
          { 
            paddingTop: insets.top + (isDesktop ? 24 : 16),
            paddingBottom: layout.headerPaddingBottom,
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
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.headerTitle, isDesktop && { fontSize: 32 }]}>
              Your Impact
            </Text>
            <Text style={[styles.headerSubtitle, isDesktop && { fontSize: 16 }]}>
              Making South Africa greener
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>

      {/* Main Stat Card - Separate from header */}
      <View style={[
        styles.mainStatCardWrapper,
        {
          paddingHorizontal: layout.paddingHorizontal,
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
          width: '100%',
          marginTop: -30,
          marginBottom: isDesktop ? 40 : 24,
        }
      ]}>
        <View style={[
          styles.mainStatCard,
          isDesktop && { padding: 24, borderRadius: 24 }
        ]}>
          <View style={[
            styles.mainStatIcon,
            isDesktop && { width: 80, height: 80, borderRadius: 24 }
          ]}>
            <Leaf size={isDesktop ? 40 : 32} color="#059669" />
          </View>
          <View style={styles.mainStatContent}>
            <Text style={[styles.mainStatValue, isDesktop && { fontSize: 48 }]}>
              {totalWeight.toFixed(1)} kg
            </Text>
            <Text style={[styles.mainStatLabel, isDesktop && { fontSize: 16 }]}>
              Total Recycled
            </Text>
          </View>
        </View>
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
            paddingTop: 0,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Impact Grid */}
        <View style={[
          styles.impactGrid,
          isDesktop && { gap: 24, marginBottom: 48 }
        ]}>
          <View style={[styles.impactCard, { backgroundColor: '#ECFDF5' }, isDesktop && { padding: 24 }]}>
            <View style={[styles.impactIconContainer, { backgroundColor: '#10B981' }, isDesktop && { width: 48, height: 48, borderRadius: 14 }]}>
              <Droplets size={isDesktop ? 24 : 20} color={Colors.white} />
            </View>
            <Text style={[styles.impactValue, isDesktop && { fontSize: 28 }]}>{waterSaved.toFixed(0)}L</Text>
            <Text style={[styles.impactLabel, isDesktop && { fontSize: 14 }]}>Water Saved</Text>
          </View>

          <View style={[styles.impactCard, { backgroundColor: '#F0F9FF' }, isDesktop && { padding: 24 }]}>
            <View style={[styles.impactIconContainer, { backgroundColor: '#0EA5E9' }, isDesktop && { width: 48, height: 48, borderRadius: 14 }]}>
              <Globe size={isDesktop ? 24 : 20} color={Colors.white} />
            </View>
            <Text style={[styles.impactValue, isDesktop && { fontSize: 28 }]}>{co2Saved.toFixed(1)}kg</Text>
            <Text style={[styles.impactLabel, isDesktop && { fontSize: 14 }]}>CO₂ Prevented</Text>
          </View>

          <View style={[styles.impactCard, { backgroundColor: '#FEF3C7' }, isDesktop && { padding: 24 }]}>
            <View style={[styles.impactIconContainer, { backgroundColor: '#F59E0B' }, isDesktop && { width: 48, height: 48, borderRadius: 14 }]}>
              <Zap size={isDesktop ? 24 : 20} color={Colors.white} />
            </View>
            <Text style={[styles.impactValue, isDesktop && { fontSize: 28 }]}>{energySaved.toFixed(1)}kWh</Text>
            <Text style={[styles.impactLabel, isDesktop && { fontSize: 14 }]}>Energy Saved</Text>
          </View>

          <View style={[styles.impactCard, { backgroundColor: '#F0FDF4' }, isDesktop && { padding: 24 }]}>
            <View style={[styles.impactIconContainer, { backgroundColor: '#22C55E' }, isDesktop && { width: 48, height: 48, borderRadius: 14 }]}>
              <TreePine size={isDesktop ? 24 : 20} color={Colors.white} />
            </View>
            <Text style={[styles.impactValue, isDesktop && { fontSize: 28 }]}>{treeEquivalent.toFixed(1)}</Text>
            <Text style={[styles.impactLabel, isDesktop && { fontSize: 14 }]}>Trees Equivalent</Text>
          </View>
        </View>

        {/* Desktop/Tablet Grid Layout for Achievements */}
        <View style={[
          styles.section,
          isDesktop && styles.desktopSection
        ]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDesktop && { fontSize: 24 }]}>
              Achievements
            </Text>
            <View style={[styles.achievementCount, isDesktop && { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }]}>
              <Award size={isDesktop ? 16 : 14} color={Colors.primary} />
              <Text style={[styles.achievementCountText, isDesktop && { fontSize: 14 }]}>
                {unlockedCount}/{achievements.length}
              </Text>
            </View>
          </View>

          <View style={[
            styles.achievementsGrid,
            isDesktop && styles.desktopAchievementsGrid
          ]}>
            {achievements.map((achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementCardLocked,
                  isDesktop && { padding: 20 }
                ]}
              >
                <View style={styles.achievementRow}>
                  <View style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.unlocked ? achievement.color : Colors.textLight },
                    isDesktop && { width: 56, height: 56, borderRadius: 16 }
                  ]}>
                    {achievement.icon}
                  </View>
                  <View style={styles.achievementContent}>
                    <Text style={[
                      styles.achievementTitle,
                      !achievement.unlocked && styles.achievementTitleLocked,
                      isDesktop && { fontSize: 18 }
                    ]}>
                      {achievement.title}
                    </Text>
                    <Text style={[
                      styles.achievementDescription,
                      isDesktop && { fontSize: 14 }
                    ]}>
                      {achievement.description}
                    </Text>
                  </View>
                  {achievement.unlocked && (
                    <View style={[styles.unlockedBadge, { backgroundColor: achievement.color }, isDesktop && { width: 28, height: 28, borderRadius: 14 }]}>
                      <Text style={[styles.unlockedBadgeText, isDesktop && { fontSize: 16 }]}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, isDesktop && { height: 8, borderRadius: 4 }]}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${Math.min((achievement.current / achievement.requirement) * 100, 100)}%`,
                          backgroundColor: achievement.unlocked ? achievement.color : Colors.textLight
                        },
                        isDesktop && { borderRadius: 4 }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.progressText, isDesktop && { fontSize: 13, marginTop: 6 }]}>
                    {achievement.current.toFixed(1)}/{achievement.requirement} {achievement.unit}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[
          styles.section,
          isDesktop && { marginBottom: 48 }
        ]}>
          <Text style={[styles.sectionTitle, isDesktop && { fontSize: 24, marginBottom: 20 }]}>
            Weekly Goal
          </Text>
          <View style={[
            styles.goalCard,
            isDesktop && { padding: 24, borderRadius: 20 }
          ]}>
            <View style={styles.goalHeader}>
              <Target size={isDesktop ? 28 : 24} color={Colors.primary} />
              <Text style={[styles.goalTitle, isDesktop && { fontSize: 18 }]}>
                Recycle 5kg this week
              </Text>
            </View>
            <View style={styles.goalProgressContainer}>
              <View style={[styles.goalProgressBar, isDesktop && { height: 12, borderRadius: 6 }]}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.goalProgressFill,
                    { width: `${Math.min((getWeeklyWeight(items) / 5) * 100, 100)}%` },
                    isDesktop && { borderRadius: 6 }
                  ]}
                />
              </View>
              <Text style={[styles.goalProgressText, isDesktop && { fontSize: 16, marginTop: 10 }]}>
                {getWeeklyWeight(items).toFixed(1)} / 5 kg
              </Text>
            </View>
            <Text style={[styles.goalReward, isDesktop && { fontSize: 15 }]}>
              🎁 Complete to earn bonus recognition!
            </Text>
          </View>
        </View>

        <View style={{ height: isDesktop ? 120 : 100 }} />
      </ScrollView>
    </View>
  );
}

function getConsecutiveDays(items: any[]): number {
  if (items.length === 0) return 0;
  
  const dates = [...new Set(items.map(i => 
    new Date(i.loggedAt).toDateString()
  ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
    const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function getWeeklyWeight(items: any[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return items
    .filter(item => new Date(item.loggedAt) >= weekAgo)
    .reduce((sum, item) => {
      return sum + (item.unit === 'kg' ? item.quantity : item.quantity * 0.05);
    }, 0);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  mainStatCardWrapper: {
    width: '100%',
    zIndex: 10,
  },
  mainStatCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  mainStatIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainStatContent: {
    flex: 1,
  },
  mainStatValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
  },
  mainStatLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  impactCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  impactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  impactLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  desktopSection: {
    marginBottom: 48,
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
  achievementCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievementCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  achievementsGrid: {
    gap: 12,
  },
  desktopAchievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  achievementCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
  },
  desktopAchievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  achievementCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
  },
  desktopAchievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  achievementCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
  },
  desktopAchievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  achievementCard: {
    flex: 1,
    minWidth: isDesktop ? 'calc(50% - 10px)' : '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  achievementTitleLocked: {
    color: Colors.textSecondary,
  },
  achievementDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  unlockedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedBadgeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  goalProgressContainer: {
    marginBottom: 12,
  },
  goalProgressBar: {
    height: 10,
    backgroundColor: Colors.borderLight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  goalProgressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  goalReward: {
    fontSize: 13,
    color: Colors.primary,
    textAlign: 'center',
  },
});