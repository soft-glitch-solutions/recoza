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
  TrendingUp
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, applyAsCollector, approveCollector } = useAuth();
  
  // Safe destructuring with defaults
  const { 
    collectorStats = { totalEarnings: 0, weeklyEarnings: 0, totalCollections: 0, householdsCount: 0 }, 
    items = [] 
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
              await logout();
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

  const handleApplyCollector = () => {
    Alert.alert(
      'Become a Collector',
      'As a collector, you can:\n\n• Build a network of households\n• Plan weekly collections\n• Earn money from recycling\n• Make a difference in your community\n\nWould you like to apply?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply Now', 
          onPress: async () => {
            setIsLoading(true);
            try {
              await applyAsCollector();
              Alert.alert(
                'Application Submitted', 
                'Your collector application is being reviewed. We\'ll notify you within 24-48 hours.'
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to submit application');
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleApproveDemo = async () => {
    setIsLoading(true);
    try {
      await approveCollector();
      Alert.alert('Success!', 'You are now a collector. Start building your network!');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (user?.inviteCode) {
      await Clipboard.setStringAsync(user.inviteCode);
      Alert.alert('Copied!', 'Invite code copied to clipboard');
    }
  };

  const handleShareInvite = async () => {
    if (user?.inviteCode) {
      try {
        await Share.share({
          message: `♻️ Join me on Recoza and let's recycle together!\n\nUse my invite code: ${user.inviteCode}\n\nDownload Recoza to start earning from recycling and make South Africa greener.`,
        });
      } catch (error) {
        console.log('Share error:', error);
      }
    }
  };

  const getCollectorStatusBadge = () => {
    switch (user?.collectorStatus) {
      case 'pending':
        return { icon: <Clock size={14} color="#F59E0B" />, text: 'Pending Review', color: '#F59E0B', bg: '#FEF3C7' };
      case 'approved':
        return { icon: <CheckCircle size={14} color="#10B981" />, text: 'Active Collector', color: '#10B981', bg: '#D1FAE5' };
      default:
        return null;
    }
  };

  const statusBadge = getCollectorStatusBadge();
  
  // Safe calculations
  const totalItemsLogged = items?.length || 0;
  const totalWeight = items?.reduce((sum, item) => {
    if (!item) return sum;
    const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
    return sum + (weight || 0);
  }, 0) || 0;

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <User size={20} color={Colors.primary} />,
          label: 'Edit Profile',
          onPress: () => router.push('../profile/edit'),
          color: Colors.primary,
          bg: '#E0F2FE',
        },
        {
          icon: <Mail size={20} color={Colors.primary} />,
          label: 'Email',
          value: user?.email,
          onPress: () => Alert.alert('Info', 'Your email is used for account recovery and notifications'),
          color: Colors.primary,
          bg: '#E0F2FE',
        },
        {
          icon: <Shield size={20} color={Colors.primary} />,
          label: 'Privacy & Security',
          onPress: () => router.push('../profile/privacy'),
          color: Colors.primary,
          bg: '#E0F2FE',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Bell size={20} color="#F59E0B" />,
          label: 'Notifications',
          value: 'Manage alerts',
          onPress: () => router.push('../profile/notifications'),
          color: '#F59E0B',
          bg: '#FEF3C7',
        },
        {
          icon: <Globe size={20} color="#8B5CF6" />,
          label: 'Language',
          value: 'English',
          onPress: () => Alert.alert('Coming Soon', 'More languages coming soon'),
          color: '#8B5CF6',
          bg: '#EDE9FE',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle size={20} color="#3B82F6" />,
          label: 'Help & Support',
          value: 'FAQs, contact us',
          onPress: () => router.push('../profile/help'),
          color: '#3B82F6',
          bg: '#DBEAFE',
        },
        {
          icon: <Info size={20} color="#22C55E" />,
          label: 'About Recoza',
          value: 'Version 1.0.0',
          onPress: () => Alert.alert(
            'About Recoza',
            'Recoza is a South African green-tech app helping unemployed youth earn income through community recycling.\n\n🌍 Version: 1.0.0\n\nCopyright © 2024 Recoza'
          ),
          color: '#22C55E',
          bg: '#DCFCE7',
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Status Bar - Light content for gradient header */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header with Gradient - Using insets for proper padding */}
      <LinearGradient
        colors={['#059669', '#047857', '#065F46']}
        style={[
          styles.header, 
          { 
            paddingTop: insets.top + 16, // Safe area + extra padding
            paddingBottom: 32,
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </LinearGradient>
          {statusBadge && (
            <LinearGradient
              colors={[statusBadge.color, statusBadge.color]}
              style={styles.collectorBadge}
            >
              {statusBadge.icon}
            </LinearGradient>
          )}
        </View>
        
        <Text style={styles.userName}>{user?.full_name || 'Recoza User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        {statusBadge && (
          <LinearGradient
            colors={[statusBadge.bg, statusBadge.bg]}
            style={styles.statusPill}
          >
            {statusBadge.icon}
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </LinearGradient>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer, 
          { 
            paddingBottom: insets.bottom + 100, // Safe area + extra padding for bottom
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards - With negative margin to overlap header */}
        <View style={styles.statsGrid}>
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.statsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.statIcon, { backgroundColor: '#E0F2FE' }]}>
              <Target size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{totalItemsLogged}</Text>
            <Text style={styles.statLabel}>Items Logged</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.statsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
              <TrendingUp size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{totalWeight.toFixed(1)}</Text>
            <Text style={styles.statLabel}>kg Recycled</Text>
          </LinearGradient>

          {user?.isCollector && (
            <LinearGradient
              colors={['#FFFFFF', '#F9FAFB']}
              style={styles.statsCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                <Star size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>R{collectorStats?.totalEarnings?.toFixed(0) || 0}</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </LinearGradient>
          )}
        </View>

        {/* Invite Code Section for Collectors */}
        {user?.isCollector && user?.inviteCode && (
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.inviteCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.sectionTitle}>Your Invite Code</Text>
            <View style={styles.inviteCodeContainer}>
              <LinearGradient
                colors={['#E0F2FE', '#BAE6FD']}
                style={styles.inviteCodeBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.inviteCode}>{user.inviteCode}</Text>
              </LinearGradient>
              <TouchableOpacity onPress={handleCopyInviteCode} style={styles.copyButton}>
                <Copy size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.inviteHint}>
              Share this code with households to add them to your network
            </Text>
            <TouchableOpacity style={styles.shareButton} onPress={handleShareInvite}>
              <LinearGradient
                colors={[Colors.primary, '#059669']}
                style={styles.shareButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Share2 size={18} color={Colors.white} />
                <Text style={styles.shareButtonText}>Share Invite Link</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Collector Application Section */}
        {!user?.isCollector && (
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.menuCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {user?.collectorStatus === 'none' ? (
              <TouchableOpacity style={styles.collectorCard} onPress={handleApplyCollector}>
                <LinearGradient
                  colors={['#F59E0B20', '#F59E0B10']}
                  style={styles.collectorIconContainer}
                >
                  <Users size={24} color="#F59E0B" />
                </LinearGradient>
                <View style={styles.collectorContent}>
                  <Text style={styles.collectorTitle}>Become a Collector</Text>
                  <Text style={styles.collectorDescription}>
                    Earn money by collecting recyclables from households
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.textLight} />
              </TouchableOpacity>
            ) : user?.collectorStatus === 'pending' ? (
              <View>
                <View style={styles.collectorCard}>
                  <LinearGradient
                    colors={['#F59E0B20', '#F59E0B10']}
                    style={styles.collectorIconContainer}
                  >
                    <Clock size={24} color="#F59E0B" />
                  </LinearGradient>
                  <View style={styles.collectorContent}>
                    <Text style={styles.collectorTitle}>Application Pending</Text>
                    <Text style={styles.collectorDescription}>
                      We are reviewing your application
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.demoApproveButton} onPress={handleApproveDemo}>
                  <Text style={styles.demoApproveText}>Demo: Approve Now</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </LinearGradient>
        )}

        {/* Menu Sections */}
        {menuSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <LinearGradient
              colors={['#FFFFFF', '#F9FAFB']}
              style={styles.menuCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex === section.items.length - 1 && styles.menuItemLast
                  ]}
                  onPress={item.onPress}
                >
                  <LinearGradient
                    colors={[item.bg, item.bg]}
                    style={[styles.menuIconContainer, { backgroundColor: item.bg }]}
                  >
                    {item.icon}
                  </LinearGradient>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                  </View>
                  <ChevronRight size={20} color={Colors.textLight} />
                </TouchableOpacity>
              ))}
            </LinearGradient>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#FEE2E2', '#FEF2F2']}
            style={styles.logoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.versionText}>Recoza v1.0.0 • Making South Africa Greener</Text>
      </ScrollView>

      {/* Bottom safe area spacer for devices with home indicator */}
      {Platform.OS === 'ios' && <View style={{ height: insets.bottom }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
  },
  collectorBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -20,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  inviteCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  inviteCodeBox: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  inviteCode: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 3,
  },
  copyButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  shareButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    fontWeight: '600',
    color: Colors.text,
  },
  menuValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  collectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  collectorIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  collectorContent: {
    flex: 1,
  },
  collectorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  collectorDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  demoApproveButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  demoApproveText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});