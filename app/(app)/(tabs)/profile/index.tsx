import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Alert, Share, StatusBar, Image, ActivityIndicator 
} from 'react-native';
import {
  User, Mail, LogOut, ChevronRight, Clock, CheckCircle,
  Bell, Globe, Award, Smartphone, Camera, Shield, FileText
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { useTheme } from '@/contexts/ThemeContext';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Linking } from 'react-native';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, collectorApplication, signOut, isCollector, refreshProfile } = useAuth();
  const { colors, isDark } = useTheme();

  const { recyclableItems: items = [] } = useRecyclables();

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
              router.replace('/');
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

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user?.id) return;
    setIsUploadingAvatar(true);
    try {
      const ext = uri.split('.').pop() || 'jpg';
      const fileName = `${user.id}/avatar.${ext}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Could not upload profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const statusBadge = (() => {
    if (isCollector) {
      return { icon: <CheckCircle size={14} color="#16A34A" />, text: 'Active Collector', color: '#16A34A', bg: '#DCFCE7' };
    }
    if (collectorApplication?.status === 'pending') {
      return { icon: <Clock size={14} color="#F59E0B" />, text: 'Pending Review', color: '#F59E0B', bg: '#FEF3C7' };
    }
    return null;
  })();

  const totalItemsLogged = items?.length || 0;
  const totalWeight = items?.reduce((sum: number, item: any) => {
    if (!item) return sum;
    const weight = item.estimatedWeightKg || 0;
    return sum + weight;
  }, 0) || 0;

  const avatarUrl = (profile as any)?.avatar_url;
  const initials = profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <User size={20} color={colors.primary} />,
          label: 'Edit Profile',
          onPress: () => router.push('/profile/edit'),
          bg: '#E0F2FE',
        },
        {
          icon: <Mail size={20} color={colors.secondary} />,
          label: 'Email',
          value: user?.email,
          onPress: () => Alert.alert('Info', 'Your email is used for recovery'),
          bg: '#FDF2E9',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Bell size={20} color={colors.accent} />,
          label: 'Notifications',
          onPress: () => router.push('/profile/notifications'),
          bg: '#F7F9E0',
        },
        {
          icon: <Globe size={20} color={colors.info} />,
          label: 'Language',
          value: 'English',
          onPress: () => Alert.alert('Coming Soon', 'More languages soon'),
          bg: '#E0F2FE',
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          icon: <Shield size={20} color="#7C3AED" />,
          label: 'Privacy Policy',
          onPress: () => Linking.openURL('https://recoza.co.za/privacy'),
          bg: '#F3E8FF',
        },
        {
          icon: <FileText size={20} color="#0369A1" />,
          label: 'Terms of Service',
          onPress: () => Linking.openURL('https://recoza.co.za/terms'),
          bg: '#E0F2FE',
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.header, { backgroundColor: colors.background, paddingTop: insets.top + 40, paddingBottom: 40 }]}>
        <TouchableOpacity onPress={handlePickAvatar} disabled={isUploadingAvatar} style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={[styles.avatar, { borderColor: colors.primary }]} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
            </View>
          )}
          
          <View style={[styles.cameraOverlay, { backgroundColor: colors.primary, borderColor: colors.background }]}>
            {isUploadingAvatar 
              ? <ActivityIndicator size="small" color="#fff" /> 
              : <Camera size={14} color="#fff" />
            }
          </View>

          {statusBadge && (
            <View style={[styles.collectorBadge, { backgroundColor: statusBadge.color, borderColor: colors.background }]}>
              {statusBadge.icon}
            </View>
          )}
        </TouchableOpacity>

        <Text style={[styles.userName, { color: colors.primary }]}>{profile?.full_name || 'Recozian'}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>

        {statusBadge && (
          <View style={[styles.statusPill, { backgroundColor: statusBadge.bg }]}>
            <View style={{ transform: [{ scale: 1.2 }] }}>
              {statusBadge.icon}
            </View>
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: '#000000', borderWidth: 3 }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalItemsLogged}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Items Logged</Text>
          </View>

          <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: '#000000', borderWidth: 3 }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalWeight.toFixed(1)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>kg Recycled</Text>
          </View>
        </View>

        {!isCollector && (
          <TouchableOpacity 
            style={[styles.becomeCollectorCard, { backgroundColor: colors.primary, borderColor: '#000000', borderWidth: 3 }]}
            onPress={() => router.push('/collections' as any)}
          >
            <View style={styles.becomeCollectorContent}>
              <Award size={28} color="#fff" />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.becomeCollectorTitle}>Become a Collector</Text>
                <Text style={styles.becomeCollectorSubtitle}>Join the network and earn rewards</Text>
              </View>
              <ChevronRight size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {menuSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>

            <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
              {section.items.map((item, itemIndex) => (
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
          </View>
        ))}

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#FEE2E2' }]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#EF4444" /> : <LogOut size={20} color="#EF4444" />}
          <Text style={styles.logoutText}>Sign Out</Text>
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
  header: { alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#000000' },
  avatarText: { fontSize: 40, fontWeight: '900' },
  cameraOverlay: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  collectorBadge: { position: 'absolute', top: 0, left: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  userName: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  userEmail: { fontSize: 16, marginTop: 4, fontWeight: '600' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginTop: 16, borderWidth: 3, borderColor: '#000000' },
  statusText: { fontSize: 14, fontWeight: '800' },
  scrollView: { flex: 1 },
  contentContainer: { padding: 20 },
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  statsCard: { flex: 1, borderRadius: 24, padding: 20, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, marginTop: 4, fontWeight: '800' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, marginLeft: 4, letterSpacing: -0.5 },
  menuCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 3, borderColor: '#000000' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 3, borderBottomColor: '#E5E7EB' },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 2, borderColor: '#000000' },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '700' },
  menuValue: { fontSize: 14, marginTop: 2, fontWeight: '500' },
  logoutButton: { marginTop: 8, marginBottom: 24, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 20, borderWidth: 3, borderColor: '#000000' },
  logoutText: { fontSize: 18, fontWeight: '900', color: '#EF4444' },
  versionText: { fontSize: 13, textAlign: 'center', fontWeight: '500' },
  becomeCollectorCard: { padding: 24, borderRadius: 24, marginBottom: 32 },
  becomeCollectorContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  becomeCollectorTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  becomeCollectorSubtitle: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 14, fontWeight: '600', marginTop: 4 },
});