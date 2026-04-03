import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Mail, 
  Shield, 
  Share2, 
  LogOut, 
  ChevronRight,
  Award,
  Clock,
  CheckCircle,
  Copy,
  Users,
  Bell,
  HelpCircle,
  Info,
  Globe,
  Star,
  Target,
  TrendingUp,
  Moon,
  Sun,
  Smartphone
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { useTheme } from '@/contexts/ThemeContext';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, collectorApplication, signOut, applyAsCollector } = useAuth();
  const { colors, themeMode, setThemeMode, isDark } = useTheme();
  
  const { 
    collectorStats = { totalEarnings: 0, weeklyEarnings: 0, totalCollections: 0, householdsCount: 0, totalWeight: 0 }, 
    recyclableItems: items = [] 
  } = useRecyclables();

  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOut();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleCopyInviteCode = async () => {
    if (profile?.invite_code) {
      await Clipboard.setStringAsync(profile.invite_code);
      Alert.alert('Copied!', 'Invite code copied to clipboard');
    }
  };

  const handleShareInvite = async () => {
    if (profile?.invite_code) {
      try {
        await Share.share({
          message: `♻️ Join me on Recoza and let's recycle together!\n\nUse my invite code: ${profile.invite_code}\n\nDownload Recoza to start earning from recycling and make South Africa greener.`,
        });
      } catch (error) {
        console.log('Share error:', error);
      }
    }
  };

  const statusBadge = (() => {
    if (profile?.is_collector || profile?.collector_approved) {
      return { icon: <CheckCircle size={14} color="#10B981" />, text: 'Active Collector', color: '#10B981', bg: isDark ? '#064E3B' : '#D1FAE5' };
    }
    if (collectorApplication?.status === 'pending') {
      return { icon: <Clock size={14} color="#F59E0B" />, text: 'Pending Review', color: '#F59E0B', bg: isDark ? '#78350F' : '#FEF3C7' };
    }
    return null;
  })();
  
  const totalItemsLogged = items?.length || 0;
  const totalWeight = items?.reduce((sum: number, item: any) => {
    if (!item) return sum;
    const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
    return sum + (weight || 0);
  }, 0) || 0;

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <User size={20} color={colors.primary} />,
          label: 'Edit Profile',
          onPress: () => router.push('/profile/edit'),
          color: colors.primary,
          bg: isDark ? '#1E3A8A' : '#E0F2FE',
        },
        {
          icon: <Mail size={20} color={colors.primary} />,
          label: 'Email',
          value: user?.email,
          onPress: () => Alert.alert('Info', 'Your email is used for recovery'),
          color: colors.primary,
          bg: isDark ? '#1E3A8A' : '#E0F2FE',
        },
      ],
    },
    {
      title: 'Appearance',
      isTheme: true,
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Bell size={20} color="#F59E0B" />,
          label: 'Notifications',
          onPress: () => router.push('/profile/notifications'),
          color: '#F59E0B',
          bg: isDark ? '#78350F' : '#FEF3C7',
        },
        {
          icon: <Globe size={20} color="#8B5CF6" />,
          label: 'Language',
          value: 'English',
          onPress: () => Alert.alert('Coming Soon', 'More languages soon'),
          color: '#8B5CF6',
          bg: isDark ? '#4C1D95' : '#EDE9FE',
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={colors.headerGradient}
        style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 32 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </LinearGradient>
          {statusBadge && (
            <View style={[styles.collectorBadge, { backgroundColor: statusBadge.color }]}>
              {statusBadge.icon}
            </View>
          )}
        </View>
        
        <Text style={styles.userName}>{profile?.full_name || 'Recoza User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        {statusBadge && (
          <View style={[styles.statusPill, { backgroundColor: statusBadge.bg }]}>
            {statusBadge.icon}
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: isDark ? '#1E3A8A' : '#E0F2FE' }]}>
              <Target size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalItemsLogged}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Items Logged</Text>
          </View>

          <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: isDark ? '#064E3B' : '#D1FAE5' }]}>
              <TrendingUp size={20} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalWeight.toFixed(1)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>kg Recycled</Text>
          </View>
        </View>

        {menuSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            
            {section.isTheme ? (
              <View style={[styles.themeCard, { backgroundColor: colors.surface }]}>
                {[
                  { id: 'light', icon: Sun, label: 'Light' },
                  { id: 'dark', icon: Moon, label: 'Dark' },
                  { id: 'system', icon: Smartphone, label: 'System' }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.themeOption,
                      themeMode === item.id && { backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' }
                    ]}
                    onPress={() => setThemeMode(item.id as any)}
                  >
                    <item.icon 
                      size={20} 
                      color={themeMode === item.id ? colors.primary : colors.textSecondary} 
                    />
                    <Text style={[
                      styles.themeLabel, 
                      { color: themeMode === item.id ? colors.primary : colors.textSecondary }
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
                {section.items?.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex === section.items.length - 1 && styles.menuItemLast,
                      { borderBottomColor: colors.borderLight }
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: item.bg }]}>
                      {item.icon}
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                      {item.value && <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{item.value}</Text>}
                    </View>
                    <ChevronRight size={20} color={colors.textLight} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <LinearGradient
            colors={isDark ? ['#7F1D1D', '#450A0A'] : ['#FEE2E2', '#FEF2F2']}
            style={styles.logoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.textLight }]}>
          Recoza v1.0.0 • Making South Africa Greener
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 8 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#fff' },
  collectorBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  userName: { fontSize: 24, fontWeight: '700', color: '#fff' },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginTop: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  scrollView: { flex: 1 },
  contentContainer: { padding: 16 },
  statsGrid: { flexDirection: 'row', gap: 12, marginTop: -20, marginBottom: 24 },
  statsCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 4 },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginLeft: 4 },
  menuCard: { borderRadius: 20, overflow: 'hidden', elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600' },
  menuValue: { fontSize: 13, marginTop: 2 },
  themeCard: { flexDirection: 'row', borderRadius: 20, padding: 8, gap: 8, elevation: 2 },
  themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  themeLabel: { fontSize: 14, fontWeight: '600' },
  logoutButton: { marginTop: 8, marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  logoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },
  versionText: { fontSize: 12, textAlign: 'center' },
});