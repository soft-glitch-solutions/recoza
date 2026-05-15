import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sparkles } from 'lucide-react-native';

export const WelcomeSection: React.FC = () => {
  const { profile } = useAuth();
  const { colors } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Recozian';

  return (
    <View style={styles.container}>
      <View style={styles.greetingRow}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
          {getGreeting()},
        </Text>
      </View>
      <Text style={[styles.userName, { color: colors.text }]}>
        {firstName}
      </Text>

      <View style={[styles.subheadingContainer, { backgroundColor: colors.primary }]}>
        <Text style={styles.subheadingText}>Recycle. Earn. Sustain.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    marginBottom: 24,
    marginTop: 8,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  icon: {
    marginBottom: 2,
  },
  userName: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: -2,
  },
  subheadingContainer: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#000000',
  },
  subheadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
