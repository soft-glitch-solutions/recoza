import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  X,
  Award,
  Wallet,
  TrendingUp,
  ChevronRight,
  Info,
  Package,
  Copy,
  Share2
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { useTheme } from '@/contexts/ThemeContext';

// 1. Extracted FeedbackModal Component
interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'info';
  title?: string;
  message?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose, type, title, message }) => {
  const { colors, isDark } = useTheme();
  const config = {
    success: { icon: <CheckCircle size={48} color="#10B981" />, title: 'Success', color: '#10B981' },
    error: { icon: <AlertCircle size={48} color="#EF4444" />, title: 'Error', color: '#EF4444' },
    info: { icon: <Info size={48} color="#3B82F6" />, title: 'Info', color: '#3B82F6' }
  }[type];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <View style={[styles.feedbackModalContent, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000' }]}>
          {config.icon}
          <Text style={[styles.feedbackTitle, { color: config.color }]}>{title || config.title}</Text>
          <Text style={[styles.feedbackMessage, { color: colors.textSecondary }]}>{message}</Text>
          <TouchableOpacity style={[styles.feedbackButton, { backgroundColor: colors.primary, borderWidth: 2, borderColor: '#000000' }]} onPress={onClose}>
            <Text style={styles.feedbackButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function CollectionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { 
    profile,
    applyAsCollector, 
    refreshProfile,
    collectorApplication,
    isCollector,
    isHousehold,
    isLoading: authLoading
  } = useAuth();
  
  const { 
    collections = [], 
    collectorStats,
    recyclableItems = [], 
    activeConnections = [],
    refreshData,
    createCollection
  } = useRecyclables();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showCollectorModal, setShowCollectorModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [feedbackConfig, setFeedbackConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: ''
  });

  const [isApplying, setIsApplying] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [area, setArea] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshData()]);
    setRefreshing(false);
  }, [refreshProfile, refreshData]);

  const statusDisplay = isCollector ? { text: 'Active Collector', color: colors.success } : { text: 'Household', color: colors.primary };

  const handleApplyPress = () => {
    if (profile?.is_collector) return;
    if (collectorApplication?.status === 'pending') {
      setFeedbackConfig({
        visible: true,
        type: 'info',
        title: 'Application Pending',
        message: 'Your collector application is currently being reviewed.'
      });
      return;
    }
    setShowCollectorModal(true);
  };

  const handleApplyAsCollector = async () => {
    if (!motivation.trim() || !area.trim()) return;
    setIsApplying(true);
    try {
      const result = await applyAsCollector(motivation, area);
      if (result.success) {
        setShowCollectorModal(false);
        setFeedbackConfig({
          visible: true,
          type: 'success',
          title: 'Success! 🎉',
          message: 'Your application has been submitted correctly.'
        });
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleShareInvite = async () => {
    try {
      const shareUrl = `https://recoza.co.za/join/${profile?.invite_code}`;
      await Share.share({
        message: `♻️ Join my recycling network on Recoza! Use my code: ${profile?.invite_code}\n\nDownload the app and help me make South Africa greener: ${shareUrl}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCode = async () => {
    if (profile?.invite_code) {
      await Clipboard.setStringAsync(profile.invite_code);
      Alert.alert('Copied', 'Invite code copied to clipboard!');
    }
  };

  const handleScheduleForHousehold = (household: any) => {
    setSelectedHousehold(household);
    setShowScheduleModal(true);
  };

  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Collections</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {isCollector ? 'Managing your network and impact' : 'Track your impact and schedule pickups'}
          </Text>
        </View>
        {isCollector && (
          <TouchableOpacity 
            style={[styles.networkCircle, { backgroundColor: colors.primary, borderWidth: 3, borderColor: '#000000' }]}
            onPress={() => router.push('/collections/network' as any)}
          >
            <Users size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {/* Your Impact Pill Row */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Impact Summary</Text>
        <View style={[styles.statsRowSimple, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000' }]}>
          <View style={styles.statPillSimple}>
            <Text style={[styles.statLabelSimple, { color: colors.textSecondary }]}>Logged</Text>
            <Text style={[styles.statValueSimple, { color: colors.text }]}>{recyclableItems.length}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.statPillSimple}>
            <Text style={[styles.statLabelSimple, { color: colors.textSecondary }]}>Weight</Text>
            <Text style={[styles.statValueSimple, { color: colors.text }]}>
              {recyclableItems.reduce((acc, item) => acc + (item.estimatedWeightKg || 0), 0).toFixed(1)} kg
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.statPillSimple}>
            <Text style={[styles.statLabelSimple, { color: colors.textSecondary }]}>Mode</Text>
            <Text style={[styles.statValueSimple, { color: statusDisplay.color }]}>
              {isCollector ? 'Collector' : 'Household'}
            </Text>
          </View>
        </View>

        {isCollector && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>My Network</Text>
              <TouchableOpacity onPress={() => router.push('/collections/network' as any)}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
              {activeConnections.length === 0 ? (
                <TouchableOpacity 
                  style={[styles.emptyHouseholdCard, { borderColor: colors.borderLight, borderStyle: 'dashed', borderWidth: 2 }]}
                  onPress={handleCopyCode}
                >
                  <Plus size={24} color={colors.textLight} />
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>Invite Households</Text>
                </TouchableOpacity>
              ) : (
                activeConnections.slice(0, 5).map((conn) => (
                  <TouchableOpacity 
                    key={conn.id} 
                    style={[styles.householdMiniCard, { backgroundColor: colors.surface, borderColor: '#000000', borderWidth: 3 }]}
                    onPress={() => handleScheduleForHousehold(conn)}
                  >
                    <View style={[styles.miniAvatar, { backgroundColor: colors.accent, borderWidth: 2, borderColor: '#000000' }]}>
                      <Text style={{ fontWeight: '900', color: colors.primary }}>{conn.householdName?.charAt(0) || 'H'}</Text>
                    </View>
                    <Text style={[styles.miniName, { color: colors.text }]} numberOfLines={1}>{conn.householdName}</Text>
                    <TouchableOpacity 
                      style={[styles.miniScheduleBtn, { backgroundColor: colors.primary, borderWidth: 2, borderColor: '#000000' }]}
                      onPress={() => handleScheduleForHousehold(conn)}
                    >
                      <Calendar size={12} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </>
        )}

        {isCollector && (
          <View style={[styles.inviteCard, { backgroundColor: colors.surface, borderColor: '#000000', borderWidth: 3, marginTop: 24 }]}>
            <View style={[styles.inviteIconContainer, { backgroundColor: colors.secondary + '20', borderWidth: 2, borderColor: '#000000' }]}>
              <Users size={24} color={colors.secondary} />
            </View>
            <View style={styles.inviteContent}>
              <Text style={styles.inviteTitle}>Grow Your Network</Text>
              <Text style={styles.inviteSubtitle}>
                Invite households to join your collection route.
              </Text>
              <View style={styles.inviteCodeRow}>
                <TouchableOpacity 
                  style={[styles.inviteCodeBox, { backgroundColor: colors.surfaceSecondary, borderWidth: 3, borderColor: '#000000' }]}
                  onPress={handleCopyCode}
                >
                  <Text style={[styles.inviteCodeText, { color: colors.primary }]}>{profile?.invite_code}</Text>
                  <Copy size={16} color={colors.textLight} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.inviteShareButton, { backgroundColor: colors.primary, borderWidth: 3, borderColor: '#000000' }]}
                  onPress={handleShareInvite}
                >
                  <Share2 size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {isCollector && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Tasks</Text>
              <View style={[styles.badgeCount, { backgroundColor: colors.primary, borderWidth: 2, borderColor: '#000000' }]}>
                <Text style={styles.badgeText}>{collections.filter(c => c.status === 'scheduled').length}</Text>
              </View>
            </View>
            {collections.filter(c => c.status === 'scheduled').length === 0 ? (
              <View style={styles.emptyState}>
                <Clock size={32} color={colors.border} />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No pending tasks</Text>
              </View>
            ) : (
              collections.filter(c => c.status === 'scheduled').map((collection) => (
                <TouchableOpacity 
                  key={collection.id} 
                  style={[styles.taskCard, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000' }]}
                  onPress={() => router.push(`/collections/${collection.id}` as any)}
                >
                  <View style={[styles.taskIconContainer, { backgroundColor: isDark ? '#1E3A8A' : '#F0F9FF', borderWidth: 2, borderColor: '#000000' }]}>
                    <Package size={20} color={colors.primary} />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskName, { color: colors.text }]}>{collection.householdName || 'Unknown Household'}</Text>
                    <Text style={[styles.taskDate, { color: colors.textSecondary }]}>{new Date(collection.scheduledDate).toLocaleDateString()}</Text>
                  </View>
                  <ChevronRight size={20} color={colors.border} />
                </TouchableOpacity>
              ))
            )}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Collector Earnings</Text>
            <View style={[styles.earningsCard, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000' }]}>
              <View style={styles.earningItem}>
                <TrendingUp size={20} color={colors.success} />
                <Text style={[styles.earningValue, { color: colors.text }]}>R{(collectorStats?.totalEarnings || 0).toFixed(2)}</Text>
                <Text style={[styles.earningLabel, { color: colors.textSecondary }]}>Total Earned</Text>
              </View>
              <View style={[styles.vDivider, { backgroundColor: colors.borderLight }]} />
              <View style={styles.earningItem}>
                <Package size={20} color={colors.primary} />
                <Text style={[styles.earningValue, { color: colors.text }]}>{(collectorStats?.totalWeight || 0).toFixed(1)} kg</Text>
                <Text style={[styles.earningLabel, { color: colors.textSecondary }]}>Collected</Text>
              </View>
            </View>
          </>
        )}

        {isHousehold && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Next Pickup</Text>
            <View style={[styles.pickupCard, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000' }]}>
              <View style={[styles.pickupIconWrapper, { backgroundColor: isDark ? '#064E3B' : '#F0FDF4', borderWidth: 2, borderColor: '#000000' }]}>
                <Calendar size={24} color={colors.primary} />
              </View>
              <View style={styles.pickupInfo}>
                <Text style={[styles.pickupTitle, { color: colors.text }]}>Scheduled soon</Text>
                <Text style={[styles.pickupSubtitle, { color: colors.textSecondary }]}>Your collector will arrive shortly</Text>
              </View>
            </View>

            {!collectorApplication && (
              <TouchableOpacity style={[styles.becomeCollectorCard, { backgroundColor: colors.primary, borderWidth: 3, borderColor: '#000000' }]} onPress={handleApplyPress}>
                <View style={styles.becomeCollectorContent}>
                  <Award size={24} color="#fff" />
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.becomeCollectorTitle}>Become a Collector</Text>
                    <Text style={styles.becomeCollectorSubtitle}>Earn rewards for every kg</Text>
                  </View>
                  <Plus size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            )}
          </>
        )}

        <TouchableOpacity 
          style={[styles.historyLinkMain, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000' }]}
          onPress={() => router.push('/history' as any)}
        >
          <Text style={[styles.historyLinkText, { color: colors.textSecondary }]}>Activity History</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FeedbackModal 
        visible={feedbackConfig.visible} 
        onClose={() => setFeedbackConfig(prev => ({ ...prev, visible: false }))} 
        type={feedbackConfig.type}
        title={feedbackConfig.title}
        message={feedbackConfig.message}
      />
      
      <Modal visible={showCollectorModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000' }]}>
            <View style={styles.modalHeaderClose}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Join as Collector</Text>
              <TouchableOpacity onPress={() => setShowCollectorModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>Help your community and earn rewards.</Text>
            <TextInput 
              style={[styles.textArea, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: '#000000', borderWidth: 2 }]} 
              placeholder="Why do you want to be a collector?" 
              placeholderTextColor={colors.textLight}
              multiline 
              value={motivation} 
              onChangeText={setMotivation} 
            />
            <TextInput 
              style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: '#000000', borderWidth: 2 }]} 
              placeholder="Your collection area (e.g. Cape Town)" 
              placeholderTextColor={colors.textLight}
              value={area} 
              onChangeText={setArea} 
            />
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary, borderWidth: 3, borderColor: '#000000' }]} onPress={handleApplyAsCollector} disabled={isApplying}>
              {isApplying ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Apply Now</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showScheduleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000' }]}>
            <View style={styles.modalHeaderClose}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Schedule Collection</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>Pick a day this week to collect from {selectedHousehold?.householdName}.</Text>
            
            <View style={styles.daysRow}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const date = new Date();
                const currentDay = date.getDay(); // 0 is Sun
                const diff = (idx + 1) - (currentDay === 0 ? 7 : currentDay);
                const targetDate = new Date();
                targetDate.setDate(date.getDate() + diff);
                
                const isSelected = selectedDate.toDateString() === targetDate.toDateString();

                return (
                  <TouchableOpacity 
                    key={day} 
                    style={[
                      styles.dayPill, 
                      { backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary, borderWidth: 2, borderColor: '#000000' }
                    ]}
                    onPress={() => setSelectedDate(targetDate)}
                  >
                    <Text style={[styles.dayText, { color: isSelected ? '#fff' : colors.text }]}>{day}</Text>
                    <Text style={[styles.dateText, { color: isSelected ? '#fff' : colors.textSecondary }]}>{targetDate.getDate()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: colors.primary, marginTop: 24, borderWidth: 3, borderColor: '#000000' }]} 
              onPress={async () => {
                if (createCollection && selectedHousehold) {
                  await createCollection({
                    collectorId: profile?.id || '',
                    householdId: selectedHousehold.householdId,
                    householdName: selectedHousehold.householdName,
                    scheduledDate: selectedDate.toISOString(),
                    status: 'scheduled',
                    items: [],
                    totalWeight: 0,
                    estimatedEarnings: 0
                  });
                  setShowScheduleModal(false);
                  setFeedbackConfig({
                    visible: true,
                    type: 'success',
                    title: 'Scheduled! 📅',
                    message: `Collection for ${selectedHousehold.householdName} set for ${selectedDate.toLocaleDateString()}`
                  });
                }
              }}
            >
              <Text style={styles.submitBtnText}>Confirm Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  networkCircle: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 24 },
  badgeCount: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  statsRowSimple: { flexDirection: 'row', padding: 20, borderRadius: 24, alignItems: 'center' },
  statPillSimple: { alignItems: 'center', flex: 1 },
  statLabelSimple: { fontSize: 10, textTransform: 'uppercase', marginBottom: 4, fontWeight: '800' },
  statValueSimple: { fontSize: 16, fontWeight: '900' },
  statDivider: { width: 1, height: '60%' },
  taskCard: { flexDirection: 'row', padding: 16, borderRadius: 24, alignItems: 'center', marginBottom: 12 },
  taskIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  taskInfo: { flex: 1, marginLeft: 12 },
  taskName: { fontSize: 14, fontWeight: '800' },
  taskDate: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  earningsCard: { flexDirection: 'row', padding: 20, borderRadius: 24 },
  earningItem: { flex: 1, alignItems: 'center' },
  earningValue: { fontSize: 18, fontWeight: '900', marginTop: 8 },
  earningLabel: { fontSize: 10, marginTop: 2, fontWeight: '700', textTransform: 'uppercase' },
  vDivider: { width: 1, height: '80%' },
  pickupCard: { flexDirection: 'row', padding: 20, borderRadius: 24, alignItems: 'center', gap: 16 },
  pickupIconWrapper: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  pickupInfo: { flex: 1 },
  pickupTitle: { fontSize: 16, fontWeight: '800' },
  pickupSubtitle: { fontSize: 13, marginTop: 2, fontWeight: '500' },
  becomeCollectorCard: { borderRadius: 24, overflow: 'hidden', marginTop: 16 },
  becomeCollectorContent: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  becomeCollectorTitle: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  becomeCollectorSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2, fontWeight: '600' },
  historyLinkMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 24, borderRadius: 24 },
  historyLinkText: { fontSize: 15, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { borderRadius: 32, padding: 24 },
  modalHeaderClose: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  modalSub: { fontSize: 14, marginBottom: 24, fontWeight: '500' },
  textArea: { borderRadius: 16, padding: 16, minHeight: 100, textAlignVertical: 'top', marginBottom: 12 },
  input: { borderRadius: 16, padding: 16, marginBottom: 20 },
  submitBtn: { padding: 18, borderRadius: 18, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  feedbackModalContent: { borderRadius: 32, padding: 32, alignItems: 'center', width: '90%', alignSelf: 'center' },
  feedbackTitle: { fontSize: 22, fontWeight: '900', marginTop: 16 },
  feedbackMessage: { fontSize: 15, textAlign: 'center', marginVertical: 16, lineHeight: 22, fontWeight: '500' },
  feedbackButton: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  feedbackButtonText: { color: '#fff', fontWeight: '900' },
  emptyState: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  emptyStateText: { fontSize: 14, marginTop: 8, fontWeight: '600' },
  inviteCard: {
    padding: 24,
    borderRadius: 32,
    flexDirection: 'row',
    gap: 16,
  },
  inviteIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteContent: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  inviteSubtitle: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
    fontWeight: '500',
  },
  inviteCodeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  inviteCodeBox: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  inviteCodeText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  inviteShareButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHouseholdCard: {
    width: 130,
    height: 160,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  householdMiniCard: {
    width: 130,
    height: 160,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  miniAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  miniName: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
  },
  miniScheduleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayPill: {
    width: 44,
    height: 64,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
});