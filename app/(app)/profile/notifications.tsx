import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Calendar, TrendingUp, Award, Clock, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isCollector = user?.is_collector;

  const [settings, setSettings] = useState({
    pushEnabled: true,
    collectionReminders: true,
    weeklySummary: true,
    achievementAlerts: true,
    marketingMessages: false,
    collectorRequests: isCollector ? true : false,
    earningsUpdates: isCollector ? true : false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationTypes = [
    {
      title: 'Push Notifications',
      items: [
        {
          icon: <Bell size={22} color="#3B82F6" />,
          label: 'Enable Push Notifications',
          description: 'Receive alerts on your device',
          key: 'pushEnabled',
          bg: '#EBF5FF',
        },
      ],
    },
    {
      title: 'Reminders',
      items: [
        {
          icon: <Calendar size={22} color="#F59E0B" />,
          label: 'Collection Reminders',
          description: 'Get notified before scheduled pickups',
          key: 'collectionReminders',
          bg: '#FEF3C7',
        },
        {
          icon: <TrendingUp size={22} color="#10B981" />,
          label: 'Weekly Summary',
          description: 'Weekly recap of your recycling impact',
          key: 'weeklySummary',
          bg: '#E6F7E6',
        },
      ],
    },
    {
      title: 'Achievements',
      items: [
        {
          icon: <Award size={22} color="#8B5CF6" />,
          label: 'Achievement Alerts',
          description: 'Get notified when you unlock badges',
          key: 'achievementAlerts',
          bg: '#F3E8FF',
        },
      ],
    },
  ];

  if (isCollector) {
    notificationTypes.push({
      title: 'Collector Updates',
      items: [
        {
          icon: <MessageCircle size={22} color="#EC4899" />,
          label: 'Collection Requests',
          description: 'When households request pickups',
          key: 'collectorRequests',
          bg: '#FCE7F3',
        },
        {
          icon: <Clock size={22} color="#0EA5E9" />,
          label: 'Earnings Updates',
          description: 'Daily summaries of your earnings',
          key: 'earningsUpdates',
          bg: '#E0F2FE',
        },
      ],
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Modern Minimal Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
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
        {notificationTypes.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex === section.items.length - 1 && styles.menuItemLast,
                  ]}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: item.bg }]}>
                    {item.icon}
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  </View>
                  <Switch
                    value={settings[item.key as keyof typeof settings]}
                    onValueChange={() => toggleSetting(item.key as keyof typeof settings)}
                    trackColor={{ false: '#E5E7EB', true: Colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔔 About Notifications</Text>
          <Text style={styles.infoText}>
            You'll receive important updates about collections and your recycling impact. You can change these settings anytime.
          </Text>
        </View>

        <Text style={styles.versionText}>Updated February 2025</Text>
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
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});