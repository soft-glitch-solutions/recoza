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
  Package
} from 'lucide-react-native';
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
        <View style={[styles.feedbackModalContent, { backgroundColor: colors.surface }]}>
          {config.icon}
          <Text style={[styles.feedbackTitle, { color: config.color }]}>{title || config.title}</Text>
          <Text style={[styles.feedbackMessage, { color: colors.textSecondary }]}>{message}</Text>
          <TouchableOpacity style={[styles.feedbackButton, { backgroundColor: colors.primary }]} onPress={onClose}>
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
    collectorApplication 
  } = useAuth();
  
  const { 
    collections = [], 
    collectorStats,
    recyclableItems = [], 
    refreshData
  } = useRecyclables();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showCollectorModal, setShowCollectorModal] = useState(false);
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

  const isCollector = profile?.is_collector || profile?.collector_approved || false;
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
            style={[styles.networkCircle, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/collections/network' as any)}
          >
            <Users size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {/* Your Impact Pill Row */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Impact Summary</Text>
        <View style={[styles.statsRowSimple, { backgroundColor: colors.surface }]}>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Tasks</Text>
              <View style={[styles.badgeCount, { backgroundColor: colors.primary }]}>
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
                  style={[styles.taskCard, { backgroundColor: colors.surface }]}
                  onPress={() => router.push(`/collections/${collection.id}` as any)}
                >
                  <View style={[styles.taskIconContainer, { backgroundColor: isDark ? '#1E3A8A' : '#F0F9FF' }]}>
                    <Package size={20} color={colors.primary} />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskName, { color: colors.text }]}>Household ID: {collection.householdId.slice(0,8)}</Text>
                    <Text style={[styles.taskDate, { color: colors.textSecondary }]}>{new Date(collection.scheduledDate).toLocaleDateString()}</Text>
                  </View>
                  <ChevronRight size={20} color={colors.border} />
                </TouchableOpacity>
              ))
            )}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Collector Earnings</Text>
            <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
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

        {!isCollector && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Next Pickup</Text>
            <View style={[styles.pickupCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.pickupIconWrapper, { backgroundColor: isDark ? '#064E3B' : '#F0FDF4' }]}>
                <Calendar size={24} color={colors.primary} />
              </View>
              <View style={styles.pickupInfo}>
                <Text style={[styles.pickupTitle, { color: colors.text }]}>Scheduled soon</Text>
                <Text style={[styles.pickupSubtitle, { color: colors.textSecondary }]}>Your collector will arrive shortly</Text>
              </View>
            </View>

            {!profile?.is_collector && !collectorApplication && (
              <TouchableOpacity style={[styles.becomeCollectorCard, { backgroundColor: colors.primary }]} onPress={handleApplyPress}>
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
          style={[styles.historyLinkMain, { backgroundColor: colors.surface }]}
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
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeaderClose}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Join as Collector</Text>
              <TouchableOpacity onPress={() => setShowCollectorModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>Help your community and earn rewards.</Text>
            <TextInput 
              style={[styles.textArea, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.borderLight }]} 
              placeholder="Why do you want to be a collector?" 
              placeholderTextColor={colors.textLight}
              multiline 
              value={motivation} 
              onChangeText={setMotivation} 
            />
            <TextInput 
              style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.borderLight }]} 
              placeholder="Your collection area (e.g. Cape Town)" 
              placeholderTextColor={colors.textLight}
              value={area} 
              onChangeText={setArea} 
            />
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleApplyAsCollector} disabled={isApplying}>
              {isApplying ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Apply Now</Text>}
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
  statsRowSimple: { flexDirection: 'row', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  statPillSimple: { alignItems: 'center', flex: 1 },
  statLabelSimple: { fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
  statValueSimple: { fontSize: 16, fontWeight: '700' },
  statDivider: { width: 1, height: '60%' },
  taskCard: { flexDirection: 'row', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  taskIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  taskInfo: { flex: 1, marginLeft: 12 },
  taskName: { fontSize: 14, fontWeight: '600' },
  taskDate: { fontSize: 12, marginTop: 2 },
  earningsCard: { flexDirection: 'row', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  earningItem: { flex: 1, alignItems: 'center' },
  earningValue: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  earningLabel: { fontSize: 10, marginTop: 2 },
  vDivider: { width: 1, height: '80%' },
  pickupCard: { flexDirection: 'row', padding: 20, borderRadius: 16, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  pickupIconWrapper: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  pickupInfo: { flex: 1 },
  pickupTitle: { fontSize: 16, fontWeight: '600' },
  pickupSubtitle: { fontSize: 13, marginTop: 2 },
  becomeCollectorCard: { borderRadius: 16, overflow: 'hidden', marginTop: 16 },
  becomeCollectorContent: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  becomeCollectorTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  becomeCollectorSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2, fontWeight: '500' },
  historyLinkMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 24, borderRadius: 20 },
  historyLinkText: { fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { borderRadius: 24, padding: 24 },
  modalHeaderClose: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  modalSub: { fontSize: 14, marginBottom: 20 },
  textArea: { borderRadius: 16, padding: 16, minHeight: 100, textAlignVertical: 'top', marginBottom: 12, borderWidth: 1 },
  input: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1 },
  submitBtn: { padding: 18, borderRadius: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  feedbackModalContent: { borderRadius: 24, padding: 32, alignItems: 'center', width: '90%', alignSelf: 'center' },
  feedbackTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  feedbackMessage: { fontSize: 14, textAlign: 'center', marginVertical: 16 },
  feedbackButton: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  feedbackButtonText: { color: '#fff', fontWeight: '700' },
  emptyState: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  emptyStateText: { fontSize: 14, marginTop: 8 }
});