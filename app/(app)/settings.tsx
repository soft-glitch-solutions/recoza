import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import {
  ArrowLeft,
  Lock,
  Trash2,
  Smartphone,
  Shield,
  FileText,
  ChevronRight,
  LogOut
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useFeedback } from '@/contexts/FeedbackContext';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { signOut, user } = useAuth();
  const { showAlert } = useFeedback();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleDeleteAccount = () => {
    showAlert({
      type: 'confirm',
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      confirmText: 'Delete',
      onConfirm: () => {
        showAlert({ type: 'success', title: 'Request Sent', message: 'Your account deletion request has been sent for processing.' });
      }
    });
  };

  const handleSignOut = () => {
    showAlert({
      type: 'confirm',
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Sign Out',
      onConfirm: async () => {
        setIsLoggingOut(true);
        try {
          await signOut();
          router.replace('/');
        } catch {
          showAlert({ type: 'error', title: 'Error', message: 'Failed to sign out. Please try again.' });
        } finally {
          setIsLoggingOut(false);
        }
      }
    });
  };

  const LinkItem = ({ icon: Icon, label, onPress, color = colors.primary }: any) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderColor: '#000000' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      <ChevronRight size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>

        {/* Security & Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SECURITY & PRIVACY</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <LinkItem
              icon={Smartphone}
              label="Biometric Login"
              color={colors.primary}
              onPress={() => showAlert({ type: 'info', title: 'Coming Soon', message: 'Biometric login will be available in a future update.' })}
            />
            <LinkItem
              icon={Lock}
              label="Privacy Policy"
              color="#7C3AED"
              onPress={() => Linking.openURL('https://recoza.co.za/privacy')}
            />
            <LinkItem
              icon={Shield}
              label="Terms of Service"
              color="#0369A1"
              onPress={() => Linking.openURL('https://recoza.co.za/terms')}
            />
            <LinkItem
              icon={FileText}
              label="Help Center"
              color={colors.secondary}
              onPress={() => router.push('/support' as any)}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT ACTIONS</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.actionItem, { borderBottomWidth: 3, borderBottomColor: '#000000' }]}
              onPress={handleSignOut}
              disabled={isLoggingOut}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                <LogOut size={20} color="#EF4444" />
              </View>
              <Text style={styles.logoutText}>{isLoggingOut ? 'Signing out…' : 'Sign Out'}</Text>
              <ChevronRight size={20} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionItem, { borderBottomWidth: 0 }]}
              onPress={handleDeleteAccount}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#F3F4F6' }]}>
                <Trash2 size={20} color={colors.textLight} />
              </View>
              <Text style={[styles.deleteText, { color: colors.textSecondary }]}>Delete Account</Text>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textLight }]}>Recoza v1.0.0</Text>
          <Text style={[styles.footerText, { color: colors.textLight }]}>Making South Africa Greener 🌿</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
    paddingLeft: 4,
  },
  sectionCard: {
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#000000',
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 0,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 0,
  },
  deleteText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
