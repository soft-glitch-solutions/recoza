import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { User, Menu, Bug, RefreshCw, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SideMenu } from '../SideMenu';

interface HeaderProps {
  isDesktop?: boolean;
  scale?: (size: number) => number;
  layout?: {
    paddingHorizontal: number;
    contentMaxWidth: number | '100%';
  };
  onResetTutorial?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDesktop = false,
  scale = (size) => size,
  layout = { paddingHorizontal: 20, contentMaxWidth: '100%' },
  onResetTutorial,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDebugMenu, setShowDebugMenu] = useState(false);

  const handleResetTutorial = async () => {
    setShowDebugMenu(false);
    if (onResetTutorial) {
      await onResetTutorial();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, backgroundColor: colors.background }]}>
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Debug Menu Modal */}
      <Modal visible={showDebugMenu} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.debugOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDebugMenu(false)}
        >
          <View style={[styles.debugMenu, { backgroundColor: colors.surface, borderColor: '#000000' }]}>
            <View style={styles.debugHeader}>
              <Bug size={18} color="#F59E0B" />
              <Text style={[styles.debugTitle, { color: colors.text }]}>Debug Menu</Text>
              <TouchableOpacity onPress={() => setShowDebugMenu(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.debugItem, { borderColor: colors.borderLight }]}
              onPress={handleResetTutorial}
            >
              <RefreshCw size={16} color={colors.primary} />
              <Text style={[styles.debugItemText, { color: colors.text }]}>Re-trigger Tutorial</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.debugItem, { borderColor: 'transparent' }]}
              onPress={() => {
                setShowDebugMenu(false);
                router.push('/profile');
              }}
            >
              <User size={16} color={colors.primary} />
              <Text style={[styles.debugItemText, { color: colors.text }]}>Go to Profile</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
            onLongPress={() => setShowDebugMenu(true)}
            delayLongPress={600}
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
  debugOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  debugMenu: {
    width: 240,
    borderRadius: 20,
    borderWidth: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  debugHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  debugTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  debugItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  debugItemText: {
    fontSize: 14,
    fontWeight: '700',
  },
});