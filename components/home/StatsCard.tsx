import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, Award, Users, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface StatsCardProps {
  weeklyStats: { totalWeight: number; itemCount: number };
  impactStats: { co2Saved: number; treesSaved: number; waterSaved: number };
  isCollector: boolean;
  isDesktop?: boolean;
  scale?: (size: number) => number;
  layout?: {
    paddingHorizontal: number;
    contentMaxWidth: number | '100%';
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  weeklyStats,
  impactStats,
  isCollector,
  isDesktop = false,
  scale = (size) => size,
  layout = { paddingHorizontal: 20, contentMaxWidth: '100%' }
}) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
});