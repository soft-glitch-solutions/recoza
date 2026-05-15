import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import {
  ArrowLeft,
  Bell,
  Lock,
  Eye,
  Trash2,
  Smartphone,
  Moon,
  Globe,
  Shield,
  ChevronRight
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Request Sent', 'Your account deletion request has been sent for processing.') }
      ]
    );
  };

  const SettingItem = ({ icon: Icon, label, value, onValueChange, type = 'toggle', color = colors.primary }: any) => (
    <View style={[styles.settingItem, { borderColor: colors.borderLight }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>

      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={Platform.OS === 'ios' ? undefined : (value ? colors.white : '#f4f3f4')}
        />
      ) : (
        <ChevronRight size={20} color={colors.textLight} />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APP PREFERENCES</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <SettingItem
              icon={Moon}
              label="Dark Mode"
              value={isDark}
              onValueChange={toggleTheme}
              color={colors.secondary}
            />
            <SettingItem
              icon={Bell}
              label="Push Notifications"
              value={notifications}
              onValueChange={setNotifications}
              color={colors.primary}
            />
            <SettingItem
              icon={Globe}
              label="Language"
              type="link"
              color={colors.info}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SECURITY & PRIVACY</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <SettingItem
              icon={Smartphone}
              label="Biometric Login"
              value={biometrics}
              onValueChange={setBiometrics}
              color={colors.primary}
            />
            <SettingItem
              icon={Lock}
              label="Privacy Settings"
              type="link"
              color={colors.accent}
            />
            <SettingItem
              icon={Shield}
              label="Terms of Service"
              type="link"
              color={colors.textLight}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT ACTIONS</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <TouchableOpacity
              style={[styles.actionItem, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={signOut}
            >
              <Trash2 size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleDeleteAccount}
            >
              <Trash2 size={20} color={colors.textLight} />
              <Text style={[styles.deleteText, { color: colors.textSecondary }]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textLight }]}>Recoza v1.0.0 Premium Edition</Text>
          <Text style={[styles.footerText, { color: colors.textLight }]}>User ID: {user?.id.substring(0, 12)}...</Text>
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
    borderColor: '#000000',
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
    padding: 18,
    gap: 16,
    borderBottomWidth: 3,
    borderColor: '#000000',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
