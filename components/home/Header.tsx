import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu } from 'lucide-react-native';
import { SideMenu } from '../SideMenu';
import { useState } from 'react';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}>
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => setIsMenuOpen(true)}
          >
            <Menu size={20} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.brandWrapper}>
            <View>
              <Text style={[styles.brandName, { color: colors.primary }]}>Recoza</Text>
              <Text style={[styles.subheading, { color: colors.textSecondary }]}>Recycling That Pays</Text>
            </View>
          </View>
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
    borderBottomWidth: 3,
    borderColor: '#000000',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
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
    borderWidth: 3,
    borderColor: '#000000',
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  subheading: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: -0.3,
    marginTop: 2,
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
    borderWidth: 3,
    borderColor: '#000000',
  },
});