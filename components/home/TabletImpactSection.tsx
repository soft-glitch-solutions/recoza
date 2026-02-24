import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, Award, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface TabletImpactSectionProps {
  impactStats: { co2Saved: number; treesSaved: number; waterSaved: number };
}

export const TabletImpactSection: React.FC<TabletImpactSectionProps> = ({
  impactStats
}) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
});
