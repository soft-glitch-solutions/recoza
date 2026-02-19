import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Eye, Lock, Fingerprint, History, Bell, Shield, Globe, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [settings, setSettings] = useState({
    biometricLogin: false,
    showEmail: true,
    showPhone: false,
    activityVisible: true,
    marketingEmails: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'A password reset link will be sent to your email',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Link',
          onPress: () => Alert.alert('Success', 'Password reset link sent to your email'),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => Alert.alert('Account Deleted', 'Your account has been scheduled for deletion'),
        },
      ]
    );
  };

  const sections = [
    {
      title: 'Login & Security',
      items: [
        {
          icon: <Lock size={22} color="#3B82F6" />,
          label: 'Change Password',
          value: 'Last changed 30 days ago',
          onPress: handleChangePassword,
          bg: '#EBF5FF',
        },
        {
          icon: <Fingerprint size={22} color="#8B5CF6" />,
          label: 'Biometric Login',
          value: settings.biometricLogin ? 'Enabled' : 'Disabled',
          toggle: true,
          onToggle: () => toggleSetting('biometricLogin'),
          bg: '#F3E8FF',
        },
        {
          icon: <History size={22} color="#F59E0B" />,
          label: 'Login History',
          value: 'Last login: Today',
          onPress: () => Alert.alert('Coming Soon', 'Login history will be available soon'),
          bg: '#FEF3C7',
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          icon: <Eye size={22} color="#10B981" />,
          label: 'Show Email',
          value: settings.showEmail ? 'Public' : 'Private',
          toggle: true,
          onToggle: () => toggleSetting('showEmail'),
          bg: '#E6F7E6',
        },
        {
          icon: <Eye size={22} color="#10B981" />,
          label: 'Show Phone Number',
          value: settings.showPhone ? 'Public' : 'Private',
          toggle: true,
          onToggle: () => toggleSetting('showPhone'),
          bg: '#E6F7E6',
        },
        {
          icon: <Globe size={22} color="#0EA5E9" />,
          label: 'Activity Visibility',
          value: settings.activityVisible ? 'Visible' : 'Hidden',
          toggle: true,
          onToggle: () => toggleSetting('activityVisible'),
          bg: '#E0F2FE',
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          icon: <Bell size={22} color="#EC4899" />,
          label: 'Marketing Emails',
          value: settings.marketingEmails ? 'Subscribed' : 'Unsubscribed',
          toggle: true,
          onToggle: () => toggleSetting('marketingEmails'),
          bg: '#FCE7F3',
        },
        {
          icon: <Shield size={22} color="#6B7280" />,
          label: 'Data Export',
          value: 'Download your data',
          onPress: () => Alert.alert('Coming Soon', 'Data export will be available soon'),
          bg: '#F3F4F6',
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Modern Minimal Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer, 
          { 
            paddingBottom: insets.bottom + 20,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex === section.items.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={item.onPress}
                  disabled={item.toggle}
                  activeOpacity={item.toggle ? 1 : 0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: item.bg }]}>
                    {item.icon}
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuValue}>{item.value}</Text>
                  </View>
                  {item.toggle ? (
                    <Switch
                      value={settings[item.label === 'Biometric Login' ? 'biometricLogin' : 
                             item.label === 'Show Email' ? 'showEmail' :
                             item.label === 'Show Phone Number' ? 'showPhone' :
                             item.label === 'Activity Visibility' ? 'activityVisible' :
                             'marketingEmails']}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#E5E7EB', true: Colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  ) : (
                    <ChevronRight size={20} color={Colors.textLight} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Delete Account Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0 • Updated Feb 2025</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  menuValue: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  deleteButton: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});