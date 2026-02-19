import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
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
import { useRef, useEffect, useState } from 'react';
import Colors from '@/constants/colors';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { useAuth } from '@/contexts/AuthContext';

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
  gradient: [string, string];
}

export default function ImpactScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { items = [], collectorStats = { totalCollections: 0, weeklyEarnings: 0, householdsCount: 0 } } = useRecyclables();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  const [streak, setStreak] = useState(0);
  const [weeklyWeight, setWeeklyWeight] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();

    // Calculate stats safely
    if (items && items.length > 0) {
      const total = items.reduce((sum, item) => {
        if (!item) return sum;
        const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
        return sum + (weight || 0);
      }, 0);
      
      setTotalWeight(total);
      setStreak(getConsecutiveDays(items));
      setWeeklyWeight(getWeeklyWeight(items));
    }
  }, [items]);

  const co2Saved = totalWeight * 2.5 || 0;
  const waterSaved = totalWeight * 17 || 0;
  const energySaved = totalWeight * 4.2 || 0;
  const treeEquivalent = co2Saved / 21 || 0;

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Log your first recyclable item',
      icon: <Sparkles size={isDesktop ? 28 : 24} color={Colors.white} />,
      requirement: 1,
      current: items?.length || 0,
      unit: 'items',
      unlocked: (items?.length || 0) >= 1,
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
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
      gradient: ['#059669', '#047857'],
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
      gradient: ['#0EA5E9', '#0284C7'],
    },
    {
      id: '4',
      title: 'Consistency King',
      description: 'Log items for 7 consecutive days',
      icon: <Flame size={isDesktop ? 28 : 24} color={Colors.white} />,
      requirement: 7,
      current: streak,
      unit: 'days',
      unlocked: streak >= 7,
      color: '#F59E0B',
      gradient: ['#F59E0B', '#D97706'],
    },
    {
      id: '5',
      title: 'Community Builder',
      description: 'Complete 5 collections as a collector',
      icon: <Medal size={isDesktop ? 28 : 24} color={Colors.white} />,
      requirement: 5,
      current: collectorStats?.totalCollections || 0,
      unit: 'collections',
      unlocked: (collectorStats?.totalCollections || 0) >= 5,
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#7C3AED'],
    },
    {
      id: '6',
      title: 'Recycling Master',
      description: 'Recycle 100kg of materials',
      icon: <Star size={isDesktop ? 28 : 24} color={Colors.white} />,
      requirement: 100,
      current: totalWeight,
      unit: 'kg',
      unlocked: totalWeight >= 100,
      color: '#EC4899',
      gradient: ['#EC4899', '#DB2777'],
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const getLayoutConfig = () => {
    if (isDesktop) {
      return {
        contentMaxWidth: 1200,
        paddingHorizontal: 40,
        headerPaddingBottom: 30,
      };
    }
    if (isTablet) {
      return {
        contentMaxWidth: 800,
        paddingHorizontal: 32,
        headerPaddingBottom: 24,
      };
    }
    return {
      contentMaxWidth: '100%' as const,
      paddingHorizontal: 20,
      headerPaddingBottom: 20,
    };
  };

  const layout = getLayoutConfig();

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#F0FDF4', '#F5F3FF']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Header - Now with more padding bottom to avoid overlap */}
      <LinearGradient
        colors={['#059669', '#047857']}
        style={[
          styles.header,
          { 
            paddingTop: insets.top + (isDesktop ? 24 : 16),
            paddingBottom: layout.headerPaddingBottom + 20, // Extra padding
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={[styles.headerTitle, isDesktop && { fontSize: 36 }]}>
              Your Impact
            </Text>
            <Text style={[styles.headerSubtitle, isDesktop && { fontSize: 18 }]}>
              Making South Africa greener, one item at a time
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>

      {/* Main Stat Card - Now properly positioned */}
      <Animated.View style={[
        styles.mainStatCardWrapper,
        {
          paddingHorizontal: layout.paddingHorizontal,
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
          width: '100%',
          marginTop: -25, // Reduced negative margin
          marginBottom: isDesktop ? 32 : 24,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}>
        <LinearGradient
          colors={['#FFFFFF', '#F9FAFB']}
          style={[
            styles.mainStatCard,
            isDesktop && { padding: 28, borderRadius: 28 }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[
            styles.mainStatIcon,
            isDesktop && { width: 90, height: 90, borderRadius: 28 }
          ]}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Recycle size={isDesktop ? 48 : 36} color={Colors.white} />
          </View>
          <View style={styles.mainStatContent}>
            <Text style={[styles.mainStatValue, isDesktop && { fontSize: 52 }]}>
              {totalWeight.toFixed(1)} kg
            </Text>
            <Text style={[styles.mainStatLabel, isDesktop && { fontSize: 18 }]}>
              Total Recycled
            </Text>
            
            {/* Quick stats row */}
            <View style={styles.quickStatsRow}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{items?.length || 0}</Text>
                <Text style={styles.quickStatLabel}>Items</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{streak}</Text>
                <Text style={styles.quickStatLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

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
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={[
            styles.impactGrid,
            isDesktop && { gap: 20, marginBottom: 40 }
          ]}>
            <LinearGradient
              colors={['#ECFDF5', '#D1FAE5']}
              style={[styles.impactCard, isDesktop && { padding: 24 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.impactIconContainer, { backgroundColor: '#10B981' }]}>
                <Droplets size={isDesktop ? 24 : 20} color={Colors.white} />
              </View>
              <Text style={[styles.impactValue, isDesktop && { fontSize: 26 }]}>{waterSaved.toFixed(0)}L</Text>
              <Text style={[styles.impactLabel, isDesktop && { fontSize: 14 }]}>Water Saved</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#F0F9FF', '#E0F2FE']}
              style={[styles.impactCard, isDesktop && { padding: 24 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.impactIconContainer, { backgroundColor: '#0EA5E9' }]}>
                <Globe size={isDesktop ? 24 : 20} color={Colors.white} />
              </View>
              <Text style={[styles.impactValue, isDesktop && { fontSize: 26 }]}>{co2Saved.toFixed(1)}kg</Text>
              <Text style={[styles.impactLabel, isDesktop && { fontSize: 14 }]}>CO₂ Prevented</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#FEF3C7', '#FDE68A']}
              style={[styles.impactCard, isDesktop && { padding: 24 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.impactIconContainer, { backgroundColor: '#F59E0B' }]}>
                <Zap size={isDesktop ? 24 : 20} color={Colors.white} />
              </View>
              <Text style={[styles.impactValue, isDesktop && { fontSize: 26 }]}>{energySaved.toFixed(1)}kWh</Text>
              <Text style={[styles.impactLabel, isDesktop && { fontSize: 14 }]}>Energy Saved</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#F0FDF4', '#DCFCE7']}
              style={[styles.impactCard, isDesktop && { padding: 24 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.impactIconContainer, { backgroundColor: '#22C55E' }]}>
                <TreePine size={isDesktop ? 24 : 20} color={Colors.white} />
              </View>
              <Text style={[styles.impactValue, isDesktop && { fontSize: 26 }]}>{treeEquivalent.toFixed(1)}</Text>
              <Text style={[styles.impactLabel, isDesktop && { fontSize: 14 }]}>Trees Equivalent</Text>
            </LinearGradient>
          </View>

          {/* Achievements Section */}
          <View style={[
            styles.section,
            isDesktop && styles.desktopSection
          ]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDesktop && { fontSize: 24 }]}>
                Achievements
              </Text>
              <LinearGradient
                colors={['#E0F2FE', '#BAE6FD']}
                style={[styles.achievementCount, isDesktop && { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Award size={isDesktop ? 16 : 14} color={Colors.primary} />
                <Text style={[styles.achievementCountText, isDesktop && { fontSize: 14 }]}>
                  {unlockedCount}/{achievements.length}
                </Text>
              </LinearGradient>
            </View>

            <View style={[
              styles.achievementsGrid,
              isDesktop && { flexDirection: 'row', flexWrap: 'wrap', gap: 20 }
            ]}>
              {achievements.map((achievement) => (
                <LinearGradient
                  key={achievement.id}
                  colors={achievement.unlocked ? ['#FFFFFF', '#F9FAFB'] : ['#F3F4F6', '#E5E7EB']}
                  style={[
                    styles.achievementCard,
                    isDesktop && { flex: 1, minWidth: 'calc(50% - 10px)' }
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.achievementRow}>
                    <LinearGradient
                      colors={achievement.unlocked ? achievement.gradient : ['#9CA3AF', '#6B7280']}
                      style={[styles.achievementIcon, isDesktop && { width: 56, height: 56, borderRadius: 16 }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {achievement.icon}
                    </LinearGradient>
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
                      <LinearGradient
                        colors={achievement.gradient}
                        style={[styles.unlockedBadge, isDesktop && { width: 28, height: 28, borderRadius: 14 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={[styles.unlockedBadgeText, isDesktop && { fontSize: 16 }]}>✓</Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, isDesktop && { height: 8, borderRadius: 4 }]}>
                      <LinearGradient
                        colors={achievement.unlocked ? achievement.gradient : ['#9CA3AF', '#6B7280']}
                        style={[
                          styles.progressFill,
                          { width: `${Math.min((achievement.current / achievement.requirement) * 100, 100)}%` }
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                    <Text style={[styles.progressText, isDesktop && { fontSize: 13, marginTop: 6 }]}>
                      {achievement.current.toFixed(1)}/{achievement.requirement} {achievement.unit}
                    </Text>
                  </View>
                </LinearGradient>
              ))}
            </View>
          </View>

          {/* Weekly Goal */}
          <View style={[
            styles.section,
            isDesktop && { marginBottom: 48 }
          ]}>
            <Text style={[styles.sectionTitle, isDesktop && { fontSize: 24, marginBottom: 20 }]}>
              Weekly Goal
            </Text>
            <LinearGradient
              colors={['#FFFFFF', '#F9FAFB']}
              style={[styles.goalCard, isDesktop && { padding: 24, borderRadius: 20 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.goalHeader}>
                <Target size={isDesktop ? 28 : 24} color={Colors.primary} />
                <Text style={[styles.goalTitle, isDesktop && { fontSize: 18 }]}>
                  Recycle 5kg this week
                </Text>
              </View>
              <View style={styles.goalProgressContainer}>
                <View style={[styles.goalProgressBar, isDesktop && { height: 12, borderRadius: 6 }]}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.goalProgressFill,
                      { width: `${Math.min((weeklyWeight / 5) * 100, 100)}%` },
                      isDesktop && { borderRadius: 6 }
                    ]}
                  />
                </View>
                <Text style={[styles.goalProgressText, isDesktop && { fontSize: 16, marginTop: 10 }]}>
                  {weeklyWeight.toFixed(1)} / 5 kg
                </Text>
              </View>
              <LinearGradient
                colors={['#FEF3C7', '#FDE68A']}
                style={[styles.goalRewardContainer, isDesktop && { padding: 14, borderRadius: 12 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Sparkles size={16} color="#F59E0B" />
                <Text style={[styles.goalReward, isDesktop && { fontSize: 15 }]}>
                  {weeklyWeight >= 5 ? '🎉 Goal achieved! Great work!' : `${(5 - weeklyWeight).toFixed(1)}kg to go!`}
                </Text>
              </LinearGradient>
            </LinearGradient>
          </View>
        </Animated.View>

        <View style={{ height: isDesktop ? 100 : 80 }} />
      </ScrollView>
    </View>
  );
}

function getConsecutiveDays(items: any[]): number {
  if (!items || items.length === 0) return 0;
  
  try {
    const dates = [...new Set(items.map(i => 
      new Date(i.created_at || i.loggedAt).toDateString()
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
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

function getWeeklyWeight(items: any[]): number {
  if (!items || items.length === 0) return 0;
  
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return items
      .filter(item => item && new Date(item.created_at || item.loggedAt) >= weekAgo)
      .reduce((sum, item) => {
        if (!item) return sum;
        const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
        return sum + (weight || 0);
      }, 0);
  } catch (error) {
    console.error('Error calculating weekly weight:', error);
    return 0;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  mainStatIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
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
  quickStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  quickStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    paddingTop: 0,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  impactCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  impactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  achievementCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  achievementCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  achievementsGrid: {
    gap: 12,
  },
  achievementCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unlockedBadgeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  goalCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
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
    marginBottom: 16,
  },
  goalProgressBar: {
    height: 10,
    backgroundColor: Colors.borderLight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
  },
  goalProgressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  goalRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 12,
  },
  goalReward: {
    fontSize: 13,
    color: '#F59E0B',
    textAlign: 'center',
    fontWeight: '600',
  },
});