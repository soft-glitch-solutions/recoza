import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, RefreshControl, Linking, Share, Alert } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Package,
  X,
  Plus,
  ChevronRight,
  Copy,
  Share2,
  Clock,
  CheckCircle,
  QrCode,
  Download,
  Link2,
  Globe,
  MessageCircle,
  AlertCircle,
  Info,
  Home,
  ExternalLink
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { useTheme } from '@/contexts/ThemeContext';

import { HouseholdConnection } from '@/types';

interface PendingInvite {
  id: string;
  email?: string;
  name?: string;
  inviteCode: string;
  inviteLink: string;
  status: 'pending' | 'accepted' | 'expired';
  sentAt: string;
  acceptedAt?: string;
}

export default function NetworkScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const { colors } = useTheme();

  const {
    activeConnections = [],
    pendingConnections = [],
    createCollection,
    refreshData
  } = useRecyclables();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'connected' | 'pending'>('connected');
  const [customLink, setCustomLink] = useState('');

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

  useEffect(() => {
    const formattedPending: PendingInvite[] = pendingConnections.map(c => ({
      id: c.id,
      name: c.householdName,
      inviteCode: profile?.invite_code || '',
      inviteLink: `https://recoza.co.za/join/${profile?.invite_code}`,
      status: 'pending',
      sentAt: c.connectedAt,
    }));
    setPendingInvites(formattedPending);
  }, [pendingConnections]);

  const [selectedInvite, setSelectedInvite] = useState<PendingInvite | null>(null);
  const [selectedHousehold, setSelectedHousehold] = useState<HouseholdConnection | null>(null);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const activeHouseholds = activeConnections;

  const filteredHouseholds = activeHouseholds.filter((h: HouseholdConnection) =>
    h &&
    (h.householdName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.householdEmail?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPendingInvites = pendingInvites.filter(invite =>
    (invite.name && invite.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    invite.inviteCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const generateInviteCode = () => {
    const prefix = 'RCZ';
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${randomPart}`;
  };

  const generateInviteLink = (inviteCode: string) => {
    const baseUrl = 'https://recoza.co.za/join';
    return `${baseUrl}/${inviteCode}`;
  };

  const showSuccess = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowSuccessModal(true);
  };

  const showError = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowErrorModal(true);
  };

  const showInfo = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowInfoModal(true);
  };

  const handleCreateInviteLink = () => {
    const inviteCode = generateInviteCode();
    const inviteLink = generateInviteLink(inviteCode);

    const newInviteObj: PendingInvite = {
      id: `inv${Date.now()}`,
      name: customLink || undefined,
      inviteCode,
      inviteLink,
      status: 'pending',
      sentAt: new Date().toISOString(),
    };

    setPendingInvites([newInviteObj, ...pendingInvites]);
    setShowAddModal(false);
    setCustomLink('');

    showSuccess(
      'Invite Link Created! 🔗',
      'Your invite link has been created. Share it with others to join your network.'
    );
  };

  const handleShareInvite = async (inviteLink: string, inviteCode: string) => {
    try {
      const message = `♻️ Join me on Recoza and let's recycle together!\n\n` +
        `Click this link to join my network: ${inviteLink}\n\n` +
        `Or use invite code: ${inviteCode}\n\n` +
        `Start earning from recycling and help make South Africa greener! 🌍`;

      await Share.share({
        message,
        title: 'Join Recoza',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleCopyInviteLink = (inviteLink: string) => {
    Clipboard.setStringAsync(inviteLink);
    showSuccess(
      'Copied! 📋',
      'Invite link copied to clipboard'
    );
  };

  const handleCopyInviteCode = (inviteCode: string) => {
    Clipboard.setStringAsync(inviteCode);
    showSuccess(
      'Copied! 📋',
      'Invite code copied to clipboard'
    );
  };

  const handleCancelInvite = (invite: PendingInvite) => {
    setSelectedInvite(invite);
    showConfirm(
      'Deactivate Link',
      `Are you sure you want to deactivate this invite link? It will no longer work.`,
      () => {
        setPendingInvites(pendingInvites.filter(inv => inv.id !== invite.id));
        showSuccess(
          'Link Deactivated',
          'The invite link has been deactivated'
        );
        setSelectedInvite(null);
      }
    );
  };

  const handleScheduleCollection = (household: HouseholdConnection) => {
    setSelectedHousehold(household);
    showConfirm(
      'Schedule Collection',
      `Schedule a pickup from ${household.householdName} for tomorrow?`,
      () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (createCollection) {
          createCollection({
            collectorId: user?.id || '',
            householdId: household.householdId,
            householdName: household.householdName,
            scheduledDate: tomorrow.toISOString(),
            status: 'scheduled',
            items: [],
            totalWeight: 0,
            estimatedEarnings: 0
          });
        }
        showSuccess(
          'Collection Scheduled! 📅',
          `Collection from ${household.householdName} has been scheduled for tomorrow`
        );
        setSelectedHousehold(null);
      }
    );
  };

  const collectorInviteCode = profile?.invite_code || '';
  const collectorInviteLink = generateInviteLink(collectorInviteCode);

  const totalItemsLogged = activeHouseholds.reduce((sum, h) => {
    return sum + (h?.totalItemsLogged || 0);
  }, 0);

  const FeedbackModal = ({
    visible,
    onClose,
    type,
    onConfirm
  }: {
    visible: boolean;
    onClose: () => void;
    type: 'success' | 'error' | 'info' | 'warning' | 'confirm';
    onConfirm?: () => void;
  }) => {
    const getConfig = () => {
      switch (type) {
        case 'success':
          return {
            icon: <CheckCircle size={48} color={colors.primary} />,
            color: colors.primary,
            bgColor: '#DCFCE7',
          };
        case 'error':
          return {
            icon: <AlertCircle size={48} color={colors.error} />,
            color: colors.error,
            bgColor: '#FEE2E2',
          };
        case 'warning':
          return {
            icon: <AlertCircle size={48} color={colors.secondary} />,
            color: colors.secondary,
            bgColor: '#FDF2E9',
          };
        case 'confirm':
          return {
            icon: <Info size={48} color={colors.info} />,
            color: colors.info,
            bgColor: '#E0F2FE',
          };
        case 'info':
          return {
            icon: <Info size={48} color={colors.info} />,
            color: colors.info,
            bgColor: '#E0F2FE',
          };
      }
    };

    const config = getConfig();

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.feedbackModalContent, { paddingBottom: insets.bottom + 20, backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000' }]}>
            <View
              style={[styles.feedbackIconContainer, { backgroundColor: config.color, borderWidth: 2, borderColor: '#000000' }]}
            >
              <View style={[styles.feedbackIconWrapper, { backgroundColor: config.bgColor }]}>
                {config.icon}
              </View>
            </View>

            <Text style={[styles.feedbackTitle, { color: colors.text }]}>{modalTitle}</Text>
            <Text style={[styles.feedbackMessage, { color: colors.textSecondary }]}>{modalMessage}</Text>

            {type === 'confirm' ? (
              <View style={styles.confirmButtonRow}>
                <TouchableOpacity
                  style={[styles.confirmCancelButton, { borderColor: '#000000', borderWidth: 3 }]}
                  onPress={onClose}
                >
                  <Text style={[styles.confirmCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmOkButton, { backgroundColor: config.color, borderColor: '#000000', borderWidth: 3 }]}
                  onPress={() => {
                    onConfirm?.();
                    onClose();
                  }}
                >
                  <Text style={styles.confirmOkText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.feedbackButton, { backgroundColor: config.color, borderColor: '#000000', borderWidth: 3 }]}
                onPress={onClose}
              >
                <Text style={styles.feedbackButtonText}>Got it</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const showConfirm = (title: string, message: string, onConfirmAction: () => void) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowConfirmModal(true);
    const handler = () => {
      onConfirmAction();
      setShowConfirmModal(false);
    };
    return handler;
  };

  if (!profile?.is_collector && !profile?.collector_approved) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={styles.notCollector}>
          <Home size={64} color={colors.textLight} />
          <Text style={[styles.notCollectorTitle, { color: colors.text }]}>Collector Network</Text>
          <Text style={[styles.notCollectorText, { color: colors.textSecondary }]}>
            Become a collector to build your household network and invite others to join
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 32, backgroundColor: colors.surface, borderBottomWidth: 3, borderBottomColor: '#000000' }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Network</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Managing {activeHouseholds.length} connections</Text>
          </View>
          <TouchableOpacity
            style={[styles.qrButton, { backgroundColor: colors.accent, borderWidth: 3, borderColor: '#000000' }]}
            onPress={() => setShowQRModal(true)}
          >
            <QrCode size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.inviteLinkCard, { backgroundColor: colors.surfaceSecondary, borderWidth: 3, borderColor: '#000000', marginTop: 24, padding: 16, borderRadius: 20 }]}>
          <View style={styles.inviteLinkHeader}>
            <View style={[styles.inviteLinkIcon, { backgroundColor: colors.primary + '20' }]}>
              <Link2 size={18} color={colors.primary} />
            </View>
            <Text style={[styles.inviteLinkLabel, { color: colors.textSecondary }]}>Your Public Invite Code</Text>
          </View>
          <View style={styles.inviteLinkRow}>
            <View style={[styles.inviteCodeDisplay, { backgroundColor: colors.surface, borderWidth: 2, borderColor: '#000000' }]}>
              <Text style={[styles.inviteCodeValue, { color: colors.primary }]}>{collectorInviteCode}</Text>
            </View>
            <TouchableOpacity
              style={[styles.inviteActionBtn, { backgroundColor: colors.primary, borderWidth: 2, borderColor: '#000000' }]}
              onPress={() => handleCopyInviteCode(collectorInviteCode)}
            >
              <Copy size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.inviteActionBtn, { backgroundColor: colors.secondary, borderWidth: 2, borderColor: '#000000' }]}
              onPress={() => handleShareInvite(collectorInviteLink, collectorInviteCode)}
            >
              <Share2 size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[styles.searchSection, { padding: 20 }]}>
        <View style={[styles.searchContainer, { borderWidth: 3, borderColor: '#000000', borderRadius: 16, paddingHorizontal: 16, height: 56, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, flex: 1, fontSize: 16, fontWeight: '600' }]}
            placeholder="Search households..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabWrapper}>
        <View style={[styles.tabBar, { backgroundColor: colors.surfaceSecondary, borderWidth: 3, borderColor: '#000000', borderRadius: 20, marginHorizontal: 20, flexDirection: 'row', padding: 6, gap: 6 }]}>
          <TouchableOpacity
            style={[styles.tabItem, { flex: 1, height: 44, justifyContent: 'center', alignItems: 'center' }, activeTab === 'connected' && { backgroundColor: colors.primary, borderRadius: 16 }]}
            onPress={() => setActiveTab('connected')}
          >
            <Text style={[styles.tabLabel, { fontSize: 14, fontWeight: '800' }, { color: activeTab === 'connected' ? '#fff' : colors.textSecondary }]}>Connected</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, { flex: 1, height: 44, justifyContent: 'center', alignItems: 'center' }, activeTab === 'pending' && { backgroundColor: colors.primary, borderRadius: 16 }]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabLabel, { fontSize: 14, fontWeight: '800' }, { color: activeTab === 'pending' ? '#fff' : colors.textSecondary }]}>Invites</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {activeTab === 'connected' ? (
          <>
            <View style={styles.statsGrid}>
              <View style={[styles.statPill, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000', flex: 1, padding: 16, borderRadius: 20, alignItems: 'center' }]}>
                <Text style={[styles.statNum, { fontSize: 24, fontWeight: '900', color: colors.text }]}>{activeHouseholds.length}</Text>
                <Text style={[styles.statTitle, { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 2, color: colors.textSecondary }]}>Households</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000', flex: 1, padding: 16, borderRadius: 20, alignItems: 'center' }]}>
                <Text style={[styles.statNum, { fontSize: 24, fontWeight: '900', color: colors.text }]}>{totalItemsLogged}</Text>
                <Text style={[styles.statTitle, { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 2, color: colors.textSecondary }]}>Items</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, color: colors.text, marginBottom: 16 }]}>Connected Households</Text>

            {filteredHouseholds.length > 0 ? (
              filteredHouseholds.map((household: HouseholdConnection) => (
                <TouchableOpacity
                  key={household.id}
                  style={[styles.householdItem, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 16 }]}
                  onPress={() => handleScheduleCollection(household)}
                >
                  <View style={[styles.householdAvatar, { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.accent, borderWidth: 2, borderColor: '#000000' }]}>
                    <Text style={[styles.avatarTxt, { fontSize: 22, fontWeight: '900', color: colors.primary }]}>
                      {household.householdName?.charAt(0) || '?'}
                    </Text>
                  </View>
                  <View style={styles.householdMain}>
                    <Text style={[styles.householdName, { fontSize: 18, fontWeight: '800', color: colors.text }]}>{household.householdName || 'Unknown'}</Text>
                    <Text style={[styles.householdEmail, { fontSize: 13, marginTop: 2, color: colors.textSecondary }]}>{household.householdEmail}</Text>
                    <View style={styles.itemBadge}>
                      <Package size={12} color={colors.primary} />
                      <Text style={[styles.itemCount, { fontSize: 12, fontWeight: '700', color: colors.primary }]}>{household.totalItemsLogged || 0} items</Text>
                    </View>
                  </View>
                  <View style={[styles.actionIndicator, { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary + '15' }]}>
                    <ChevronRight size={20} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyView}>
                <Users size={64} color={colors.textLight} />
                <Text style={[styles.emptyTitle, { fontSize: 20, fontWeight: '900', marginTop: 16, color: colors.text }]}>No connections found</Text>
                <Text style={[styles.emptySub, { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20, color: colors.textSecondary }]}>Start by sharing your code with your neighbors!</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.inviteList}>
            <Text style={[styles.sectionTitle, { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, color: colors.text, marginBottom: 16 }]}>Active Invite Links</Text>

            {filteredPendingInvites.length > 0 ? (
              filteredPendingInvites.map((invite) => (
                <View
                  key={invite.id}
                  style={[styles.inviteItem, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000', borderRadius: 24, padding: 20, marginBottom: 16 }]}
                >
                  <View style={styles.inviteTop}>
                    <View style={[styles.inviteIconBox, { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.secondary + '15', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000000' }]}>
                      <Clock size={20} color={colors.secondary} />
                    </View>
                    <View style={styles.inviteInfoMain}>
                      <Text style={[styles.inviteLabel, { fontSize: 16, fontWeight: '800', color: colors.text }]}>{invite.name || 'Public Shared Link'}</Text>
                      <Text style={[styles.inviteDate, { fontSize: 12, marginTop: 2, color: colors.textSecondary }]}>Created {new Date(invite.sentAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={[styles.statusTag, { backgroundColor: colors.secondary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }]}>
                      <Text style={[styles.statusTagTxt, { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: colors.secondary }]}>Active</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.linkPreview, { backgroundColor: colors.surfaceSecondary, borderWidth: 2, borderColor: '#000000', padding: 14, borderRadius: 12, marginBottom: 16 }]}>
                    <Text style={[styles.linkTxt, { fontSize: 13, fontWeight: '600', color: colors.textSecondary }]} numberOfLines={1}>{invite.inviteLink}</Text>
                  </View>

                  <View style={styles.inviteActionsRow}>
                    <TouchableOpacity 
                      style={[styles.inviteActionPill, { flex: 1, height: 48, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: colors.primary, borderWidth: 2, borderColor: '#000000' }]}
                      onPress={() => handleShareInvite(invite.inviteLink, invite.inviteCode)}
                    >
                      <Share2 size={16} color="#fff" />
                      <Text style={[styles.inviteActionPillTxt, { color: '#fff', fontSize: 14, fontWeight: '800' }]}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.inviteActionPill, { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 2, borderColor: '#000000' }]}
                      onPress={() => handleCopyInviteLink(invite.inviteLink)}
                    >
                      <Copy size={16} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.inviteActionPill, { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.error + '15', borderWidth: 2, borderColor: colors.error }]}
                      onPress={() => handleCancelInvite(invite)}
                    >
                      <X size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyView}>
                <Link2 size={64} color={colors.textLight} />
                <Text style={[styles.emptyTitle, { fontSize: 20, fontWeight: '900', marginTop: 16, color: colors.text }]}>No active invites</Text>
                <Text style={[styles.emptySub, { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20, color: colors.textSecondary }]}>Create a custom link for specific groups or events.</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals with Premium Styling */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.premiumModal, { backgroundColor: colors.surface, borderWidth: 3, borderColor: '#000000', paddingBottom: insets.bottom + 20, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, width: '100%' }]}>
            <View style={styles.premiumModalHeader}>
              <Text style={[styles.premiumModalTitle, { fontSize: 22, fontWeight: '900', color: colors.text }]}>Create Custom Link</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.premiumInput, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderWidth: 3, borderColor: '#000000', height: 64, borderRadius: 18, paddingHorizontal: 20, fontSize: 16, fontWeight: '600', marginBottom: 20 }]}
              placeholder="Give this link a name (e.g. Church Group)"
              placeholderTextColor={colors.textSecondary}
              value={customLink}
              onChangeText={setCustomLink}
            />
            <TouchableOpacity 
              style={[styles.premiumSubmit, { backgroundColor: colors.primary, borderWidth: 3, borderColor: '#000000', height: 64, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 }]}
              onPress={handleCreateInviteLink}
            >
              <Text style={[styles.premiumSubmitText, { color: '#fff', fontSize: 18, fontWeight: '900' }]}>Create Invite Link</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showQRModal} animationType="fade" transparent={true}>
        <View style={[styles.qrBackdrop, { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
          <View style={[styles.qrPaper, { backgroundColor: '#fff', borderWidth: 3, borderColor: '#000000', width: '100%', borderRadius: 32, padding: 32, alignItems: 'center' }]}>
            <View style={styles.qrPaperHeader}>
              <Text style={[styles.qrPaperTitle, { fontSize: 20, fontWeight: '900', color: '#000' }]}>Scan to Connect</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={[styles.qrBox, { padding: 20, backgroundColor: '#fff', borderRadius: 24, marginBottom: 16 }]}>
              <QRCode value={collectorInviteLink} size={220} color="#000" backgroundColor="#fff" />
            </View>
            <Text style={[styles.qrCodeLabelText, { fontSize: 18, fontWeight: '900', letterSpacing: 2, marginBottom: 32, color: '#000' }]}>Code: {collectorInviteCode}</Text>
            <TouchableOpacity 
              style={[styles.qrShareBtn, { width: '100%', height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: colors.primary, borderWidth: 3, borderColor: '#000000' }]}
              onPress={() => {
                setShowQRModal(false);
                handleShareInvite(collectorInviteLink, collectorInviteCode);
              }}
            >
              <Share2 size={20} color="#fff" />
              <Text style={[styles.qrShareBtnText, { color: '#fff', fontSize: 16, fontWeight: '900' }]}>Share Network Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FeedbackModal visible={showSuccessModal} onClose={() => setShowSuccessModal(false)} type="success" />
      <FeedbackModal visible={showErrorModal} onClose={() => setShowErrorModal(false)} type="error" />
      <FeedbackModal visible={showInfoModal} onClose={() => setShowInfoModal(false)} type="info" />
      <FeedbackModal 
        visible={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)} 
        type="confirm" 
        onConfirm={() => {
          if (selectedInvite) {
            setPendingInvites(pendingInvites.filter(inv => inv.id !== selectedInvite.id));
          } else if (selectedHousehold && modalTitle === 'Schedule Collection') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (createCollection) {
              createCollection({
                collectorId: user?.id || '',
                householdId: selectedHousehold.householdId,
                householdName: selectedHousehold.householdName,
                scheduledDate: tomorrow.toISOString(),
                status: 'scheduled',
                items: [],
                totalWeight: 0,
                estimatedEarnings: 0
              });
            }
          }
          setSelectedInvite(null);
          setSelectedHousehold(null);
        }} 
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fabBtn, { bottom: insets.bottom + 20, backgroundColor: colors.primary, borderWidth: 3, borderColor: '#000000' }]}
        onPress={() => setShowAddModal(true)}
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, fontWeight: '600' },
  qrButton: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  inviteLinkCard: { },
  inviteLinkHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  inviteLinkIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  inviteLinkLabel: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  inviteLinkRow: { flexDirection: 'row', gap: 10 },
  inviteCodeDisplay: { flex: 1, height: 52, borderRadius: 14, justifyContent: 'center', paddingHorizontal: 16 },
  inviteCodeValue: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  inviteActionBtn: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  searchSection: { },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '600' },
  tabWrapper: { marginBottom: 20 },
  tabBar: { flexDirection: 'row', padding: 6, gap: 6 },
  tabItem: { flex: 1, height: 44, justifyContent: 'center', alignItems: 'center' },
  tabLabel: { fontSize: 14, fontWeight: '800' },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 20 },
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statPill: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '900' },
  statTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  householdItem: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 16, gap: 16 },
  householdAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 22, fontWeight: '900' },
  householdMain: { flex: 1 },
  householdName: { fontSize: 18, fontWeight: '800' },
  householdEmail: { fontSize: 13, marginTop: 2 },
  itemBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  itemCount: { fontSize: 12, fontWeight: '700' },
  actionIndicator: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  emptyView: { padding: 60, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '900', marginTop: 16 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  inviteList: { gap: 16 },
  inviteItem: { padding: 20 },
  inviteTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  inviteIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  inviteInfoMain: { flex: 1 },
  inviteLabel: { fontSize: 16, fontWeight: '800' },
  inviteDate: { fontSize: 12, marginTop: 2 },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusTagTxt: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  linkPreview: { padding: 14, borderRadius: 12, marginBottom: 16 },
  linkTxt: { fontSize: 13, fontWeight: '600' },
  inviteActionsRow: { flexDirection: 'row', gap: 12 },
  inviteActionPill: { flex: 1, height: 48, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  inviteActionPillTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
  fabBtn: { position: 'absolute', right: 20, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  premiumModal: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  premiumModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  premiumModalTitle: { fontSize: 22, fontWeight: '900' },
  premiumInput: { height: 64, borderRadius: 18, paddingHorizontal: 20, fontSize: 16, fontWeight: '600', marginBottom: 20 },
  premiumSubmit: { height: 64, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  premiumSubmitText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  qrBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  qrPaper: { width: '100%', borderRadius: 32, padding: 32, alignItems: 'center' },
  qrPaperHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 },
  qrPaperTitle: { fontSize: 20, fontWeight: '900' },
  qrBox: { padding: 20, backgroundColor: '#fff', borderRadius: 24, marginBottom: 16 },
  qrCodeLabelText: { fontSize: 18, fontWeight: '900', letterSpacing: 2, marginBottom: 32 },
  qrShareBtn: { width: '100%', height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  qrShareBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  feedbackModalContent: { borderRadius: 32, padding: 32, alignItems: 'center' },
  feedbackIconContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  feedbackIconWrapper: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  feedbackTitle: { fontSize: 24, fontWeight: '900', marginBottom: 12 },
  feedbackMessage: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  confirmButtonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmCancelButton: { flex: 1, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  confirmCancelText: { fontSize: 16, fontWeight: '800' },
  confirmOkButton: { flex: 1, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  confirmOkText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  feedbackButton: { width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  feedbackButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  notCollector: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  notCollectorTitle: { fontSize: 24, fontWeight: '900', marginTop: 24 },
  notCollectorText: { fontSize: 16, textAlign: 'center', marginTop: 12, lineHeight: 24 },
});