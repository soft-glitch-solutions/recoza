import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  isDesktop?: boolean;
  scale?: (size: number) => number;
  layout?: {
    paddingHorizontal: number;
    contentMaxWidth: number | '100%';
  };
}

export const Header: React.FC<HeaderProps> = ({
  isDesktop = false,
  scale = (size) => size,
  layout = { paddingHorizontal: 20, contentMaxWidth: '100%' }
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}>
      <View style={styles.headerContent}>
        <View style={styles.brandWrapper}>
          <View style={[styles.logoDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.brandName, { color: colors.primary }]}>recoza</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => router.push('/profile')}
          >
            <User size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});