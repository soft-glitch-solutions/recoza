import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Recycle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useRecyclables } from '@/contexts/RecyclablesContext';

interface QuickLogSectionProps {
  isDesktop?: boolean;
  scale?: (size: number) => number;
}

export const QuickLogSection: React.FC<QuickLogSectionProps> = ({
  isDesktop = false,
  scale = (size) => size
}) => {
  const { addRecyclableItem } = useRecyclables();
  const [loading, setLoading] = useState(false);

  const handleQuickLog = async () => {
    setLoading(true);
    try {
      const result = await addRecyclableItem({
        type: 'plastic', 
        quantity: 1,
        unit: 'items',
        userId: 'temp', // Addressed behind the scenes in context
        loggedAt: new Date().toISOString(),
        collected: false,
      });

      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to log item');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, isDesktop && { fontSize: scale(20) }]}>
        Quick Log
      </Text>
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleQuickLog}
        disabled={loading}
        style={styles.buttonWrapper}
      >
        <LinearGradient
          colors={['#10B981', '#059669']} // Beautiful emerald green
          style={[styles.giantButton, isDesktop && { paddingVertical: 32 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="large" />
          ) : (
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <Recycle size={isDesktop ? scale(48) : 36} color="#059669" />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.buttonPrimaryText, isDesktop && { fontSize: scale(24) }]}>
                  Log 1 Item
                </Text>
                <Text style={[styles.buttonSecondaryText, isDesktop && { fontSize: scale(16) }]}>
                  Tap to securely log an item
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  buttonWrapper: {
    width: '100%',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  giantButton: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    minHeight: 120,
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  textContainer: {
    flex: 1,
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  buttonSecondaryText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
});