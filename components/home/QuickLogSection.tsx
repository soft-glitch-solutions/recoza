import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';

interface QuickLogSectionProps {
  recyclableTypes: Array<{
    type: string;
    label: string;
    emoji: string;
    color: string;
  }>;
  isDesktop?: boolean;
  scale?: (size: number) => number;
}

export const QuickLogSection: React.FC<QuickLogSectionProps> = ({
  recyclableTypes,
  isDesktop = false,
  scale = (size) => size
}) => {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isDesktop && { fontSize: scale(24) }]}>
          What are you recycling?
        </Text>
        <Text style={[styles.quickLogHint, isDesktop && { fontSize: scale(14) }]}>
          Tap to log
        </Text>
      </View>
      
      <View style={styles.quickLogGrid}>
        {recyclableTypes.map((item) => (
          <TouchableOpacity
            key={item.type}
            style={[
              styles.quickLogCard,
              isDesktop && { 
                padding: scale(16),
                borderRadius: scale(20),
              }
            ]}
            onPress={() => router.push({
              pathname: '/(tabs)/(home)/log-item',
              params: { type: item.type }
            })}
          >
            <LinearGradient
              colors={[item.color + '20', item.color + '10']}
              style={[
                styles.quickLogIconLarge,
                { 
                  width: isDesktop ? scale(80) : 64,
                  height: isDesktop ? scale(80) : 64,
                  borderRadius: isDesktop ? scale(24) : 20,
                }
              ]}
            >
              <Text style={[
                styles.quickLogEmojiLarge,
                isDesktop && { fontSize: scale(40) }
              ]}>
                {item.emoji}
              </Text>
            </LinearGradient>
            <Text style={[
              styles.quickLogLabelLarge,
              isDesktop && { fontSize: scale(18), marginTop: scale(12) }
            ]}>
              {item.label}
            </Text>
            <Text style={[
              styles.quickLogTap,
              isDesktop && { fontSize: scale(14) }
            ]}>
              Tap to add →
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  quickLogHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  quickLogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickLogCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickLogIconLarge: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickLogEmojiLarge: {
    fontSize: 36,
  },
  quickLogLabelLarge: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  quickLogTap: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
});