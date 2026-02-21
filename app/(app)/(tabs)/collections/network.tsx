import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, RefreshControl, Linking } from 'react-native';
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

// Types
interface HouseholdConnection {
  id: string;
  householdId: string;
  householdName: string;
  householdEmail: string;
  connectedAt: string;
  totalItemsLogged: number;
  status?: 'active' | 'inactive';
}

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

// Mock data for pending invitations
const mockPendingInvites: PendingInvite[] = [
  {
    id: 'inv1',
    name: 'John Doe',
    inviteCode: 'RCZ-X7K9M2',
    inviteLink: 'https://mobile.recoza.co.za/join/RCZ-X7K9M2',
    status: 'pending',
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'inv2',
    name: 'Jane Smith',
    inviteCode: 'RCZ-PL4Q8N',
    inviteLink: 'https://mobile.recoza.co.za/join/RCZ-PL4Q8N',
    status: 'pending',
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function NetworkScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  
  // Safely get households with default empty array
  const recyclablesContext = useRecyclables() || {};
  const { households = [], scheduleCollection = () => {} } = recyclablesContext;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'connected' | 'pending'>('connected');
  const [customLink, setCustomLink] = useState('');
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(mockPendingInvites);
  const [selectedInvite, setSelectedInvite] = useState<PendingInvite | null>(null);
  const [selectedHousehold, setSelectedHousehold] = useState<HouseholdConnection | null>(null);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  
  // Mock connected households
  const [mockHouseholds] = useState<HouseholdConnection[]>([
    {
      id: '1',
      householdId: 'h1',
      householdName: 'Thabo Mokoena',
      householdEmail: 'thabo@example.com',
      connectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalItemsLogged: 15,
      status: 'active',
    },
    {
      id: '2',
      householdId: 'h2',
      householdName: 'Naledi Sithole',
      householdEmail: 'naledi@example.com',
      connectedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      totalItemsLogged: 23,
      status: 'active',
    },
    {
      id: '3',
      householdId: 'h3',
      householdName: 'Sipho Dlamini',
      householdEmail: 'sipho@example.com',
      connectedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      totalItemsLogged: 8,
      status: 'active',
    },
  ]);

  // Ensure both arrays are iterable
  const allHouseholds = [
    ...(Array.isArray(mockHouseholds) ? mockHouseholds : []),
    ...(Array.isArray(households) ? households : [])
  ];

  const filteredHouseholds = allHouseholds.filter((h: HouseholdConnection) => 
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
    // Simulate fetching data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const generateInviteCode = () => {
    const prefix = 'RCZ';
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${randomPart}`;
  };

  const generateInviteLink = (inviteCode: string) => {
    const baseUrl = 'https://recoza.app/join'; // Replace with your actual app URL
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
    
    // Create new pending invite
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

  const handleResendInvite = (invite: PendingInvite) => {
    setSelectedInvite(invite);
    showConfirm(
      'Resend Invitation',
      `Share the invite link again?`,
      () => {
        handleShareInvite(invite.inviteLink, invite.inviteCode);
        setSelectedInvite(null);
      }
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
        scheduleCollection(household.householdId, household.householdName, tomorrow.toISOString(), []);
        showSuccess(
          'Collection Scheduled! 📅',
          `Collection from ${household.householdName} has been scheduled for tomorrow`
        );
        setSelectedHousehold(null);
      }
    );
  };

  const handleOpenLink = (link: string) => {
    Linking.openURL(link).catch(err => {
      showError('Error', 'Could not open link');
    });
  };

  // Calculate total items safely
  const totalItemsLogged = allHouseholds.reduce((sum: number, h: HouseholdConnection) => {
    return sum + (h?.totalItemsLogged || 0);
  }, 0);

  const collectorInviteCode = profile?.invite_code || generateInviteCode();
  const collectorInviteLink = generateInviteLink(collectorInviteCode);

  // Feedback Modal Component
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
            icon: <CheckCircle size={48} color="#10B981" />,
            gradient: ['#10B981', '#059669'] as const,
            bgColor: '#D1FAE5',
          };
        case 'error':
          return {
            icon: <AlertCircle size={48} color="#EF4444" />,
            gradient: ['#EF4444', '#DC2626'] as const,
            bgColor: '#FEE2E2',
          };
        case 'warning':
          return {
            icon: <AlertCircle size={48} color="#F59E0B" />,
            gradient: ['#F59E0B', '#D97706'] as const,
            bgColor: '#FEF3C7',
          };
        case 'confirm':
          return {
            icon: <Info size={48} color="#3B82F6" />,
            gradient: ['#3B82F6', '#2563EB'] as const,
            bgColor: '#DBEAFE',
          };
        case 'info':
          return {
            icon: <Info size={48} color="#3B82F6" />,
            gradient: ['#3B82F6', '#2563EB'] as const,
            bgColor: '#DBEAFE',
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
          <View style={[styles.feedbackModalContent, { paddingBottom: insets.bottom + 20 }]}>
            <LinearGradient
              colors={config.gradient}
              style={styles.feedbackIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.feedbackIconWrapper, { backgroundColor: config.bgColor }]}>
                {config.icon}
              </View>
            </LinearGradient>
            
            <Text style={styles.feedbackTitle}>{modalTitle}</Text>
            <Text style={styles.feedbackMessage}>{modalMessage}</Text>
            
            {type === 'confirm' ? (
              <View style={styles.confirmButtonRow}>
                <TouchableOpacity
                  style={styles.confirmCancelButton}
                  onPress={onClose}
                >
                  <Text style={styles.confirmCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmOkButton}
                  onPress={() => {
                    onConfirm?.();
                    onClose();
                  }}
                >
                  <LinearGradient
                    colors={config.gradient}
                    style={styles.confirmOkGradient}
                  >
                    <Text style={styles.confirmOkText}>Confirm</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.feedbackButton}
                onPress={onClose}
              >
                <LinearGradient
                  colors={config.gradient}
                  style={styles.feedbackButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.feedbackButtonText}>Got it</Text>
                </LinearGradient>
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
    // Store the confirm action
    const handler = () => {
      onConfirmAction();
      setShowConfirmModal(false);
    };
    return handler;
  };

  if (!user?.isCollector) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.notCollector}>
          <Home size={64} color={Colors.textLight} />
          <Text style={styles.notCollectorTitle}>Collector Network</Text>
          <Text style={styles.notCollectorText}>
            Become a collector to build your household network and invite others to join
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, '#059669']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Network</Text>
          <TouchableOpacity 
            style={styles.qrButton}
            onPress={() => setShowQRModal(true)}
          >
            <QrCode size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.inviteCodeSection}>
          <Text style={styles.inviteCodeLabel}>Your Invite Link</Text>
          <View style={styles.inviteLinkContainer}>
            <Text style={styles.inviteLink} numberOfLines={1}>
              {collectorInviteLink}
            </Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => handleCopyInviteLink(collectorInviteLink)}
            >
              <Copy size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.inviteCodeRow}>
            <Text style={styles.inviteCodeLabelSmall}>Code: {collectorInviteCode}</Text>
            <TouchableOpacity onPress={() => handleCopyInviteCode(collectorInviteCode)}>
              <Copy size={14} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or invite code..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'connected' && styles.activeTab]}
          onPress={() => setActiveTab('connected')}
        >
          <Users size={18} color={activeTab === 'connected' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'connected' && styles.activeTabText]}>
            Connected ({allHouseholds.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Link2 size={18} color={activeTab === 'pending' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Invites ({pendingInvites.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {activeTab === 'connected' ? (
          <>
            <View style={styles.statsRow}>
              <LinearGradient
                colors={['#FFFFFF', '#F9FAFB']}
                style={styles.statCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.statValue}>{allHouseholds.length}</Text>
                <Text style={styles.statLabel}>Households</Text>
              </LinearGradient>
              <LinearGradient
                colors={['#FFFFFF', '#F9FAFB']}
                style={styles.statCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.statValue}>{totalItemsLogged}</Text>
                <Text style={styles.statLabel}>Total Items</Text>
              </LinearGradient>
            </View>

            <Text style={styles.sectionTitle}>Connected Households</Text>
            
            {filteredHouseholds.length > 0 ? (
              filteredHouseholds.map((household: HouseholdConnection) => (
                <TouchableOpacity 
                  key={household.id} 
                  style={styles.householdCard}
                  onPress={() => handleScheduleCollection(household)}
                >
                  <LinearGradient
                    colors={[Colors.primary + '20', Colors.primary + '10']}
                    style={styles.householdAvatar}
                  >
                    <Text style={styles.householdAvatarText}>
                      {household.householdName?.charAt(0) || '?'}
                    </Text>
                  </LinearGradient>
                  <View style={styles.householdInfo}>
                    <Text style={styles.householdName}>{household.householdName || 'Unknown'}</Text>
                    <View style={styles.householdMeta}>
                      <Mail size={12} color={Colors.textSecondary} />
                      <Text style={styles.householdEmail}>{household.householdEmail || 'No email'}</Text>
                    </View>
                    <View style={styles.householdStats}>
                      <Package size={12} color={Colors.primary} />
                      <Text style={styles.householdItemsText}>
                        {household.totalItemsLogged || 0} items logged
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={Colors.textLight} />
                </TouchableOpacity>
              ))
            ) : (
              <LinearGradient
                colors={['#FFFFFF', '#F9FAFB']}
                style={styles.emptyState}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Users size={48} color={Colors.textLight} />
                <Text style={styles.emptyStateText}>No households connected</Text>
                <Text style={styles.emptyStateSubtext}>
                  Share your invite link to grow your network
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Link2 size={20} color={Colors.white} />
                  <Text style={styles.emptyStateButtonText}>Create Invite Link</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Active Invite Links</Text>
            
            {filteredPendingInvites.length > 0 ? (
              filteredPendingInvites.map((invite) => (
                <LinearGradient
                  key={invite.id}
                  colors={['#FFFFFF', '#F9FAFB']}
                  style={styles.inviteCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.inviteHeader}>
                    <View style={styles.inviteInfo}>
                      {invite.name && (
                        <Text style={styles.inviteName}>{invite.name}</Text>
                      )}
                      <View style={styles.inviteMeta}>
                        <Clock size={12} color={Colors.warning} />
                        <Text style={styles.inviteDate}>
                          Created {new Date(invite.sentAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
                      <Clock size={12} color="#F59E0B" />
                      <Text style={[styles.statusText, { color: '#F59E0B' }]}>Active</Text>
                    </View>
                  </View>
                  
                  <View style={styles.inviteLinkRow}>
                    <Link2 size={16} color={Colors.primary} />
                    <Text style={styles.inviteLinkText} numberOfLines={1}>
                      {invite.inviteLink}
                    </Text>
                  </View>

                  <View style={styles.inviteCodeRow}>
                    <Text style={styles.inviteCodeLabel}>Code:</Text>
                    <Text style={styles.inviteCodeValue}>{invite.inviteCode}</Text>
                  </View>

                  <View style={styles.inviteActions}>
                    <TouchableOpacity
                      style={styles.inviteActionButton}
                      onPress={() => handleCopyInviteLink(invite.inviteLink)}
                    >
                      <Copy size={16} color={Colors.primary} />
                      <Text style={styles.inviteActionText}>Copy Link</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.inviteActionButton}
                      onPress={() => handleShareInvite(invite.inviteLink, invite.inviteCode)}
                    >
                      <Share2 size={16} color={Colors.warning} />
                      <Text style={styles.inviteActionText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.inviteActionButton}
                      onPress={() => handleCancelInvite(invite)}
                    >
                      <X size={16} color={Colors.error} />
                      <Text style={styles.inviteActionText}>Deactivate</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              ))
            ) : (
              <LinearGradient
                colors={['#FFFFFF', '#F9FAFB']}
                style={styles.emptyState}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Link2 size={48} color={Colors.textLight} />
                <Text style={styles.emptyStateText}>No active invites</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create an invite link to start growing your network
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Plus size={20} color={Colors.white} />
                  <Text style={styles.emptyStateButtonText}>Create Invite Link</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB for creating new invite */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => setShowAddModal(true)}
      >
        <LinearGradient
          colors={[Colors.primary, '#059669']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Link2 size={24} color={Colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Create Invite Link Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Invite Link</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Create a unique link to share with people who want to join your network
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Label (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Friends, Family, Colleagues"
                placeholderTextColor={Colors.textSecondary}
                value={customLink}
                onChangeText={setCustomLink}
              />
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Preview:</Text>
              <LinearGradient
                colors={['#F9FAFB', '#F3F4F6']}
                style={styles.previewBox}
              >
                <Link2 size={20} color={Colors.primary} />
                <Text style={styles.previewText} numberOfLines={1}>
                  {generateInviteLink(generateInviteCode())}
                </Text>
              </LinearGradient>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleCreateInviteLink}>
              <LinearGradient
                colors={[Colors.primary, '#059669']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Link2 size={20} color={Colors.white} />
                <Text style={styles.submitButtonText}>Create Invite Link</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.98)']}
            style={[styles.qrModalContent, { paddingBottom: insets.bottom + 20 }]}
          >
            <TouchableOpacity
              style={styles.qrCloseButton}
              onPress={() => setShowQRModal(false)}
            >
              <X size={24} color={Colors.white} />
            </TouchableOpacity>

            <Text style={styles.qrTitle}>Scan to Join</Text>
            <Text style={styles.qrSubtitle}>
              Scan this QR code with your phone to join my network
            </Text>

            <View style={styles.qrContainer}>
              <QRCode
                value={collectorInviteLink}
                size={200}
                color={Colors.primary}
                backgroundColor="white"
              />
            </View>

            <Text style={styles.qrCodeText}>{collectorInviteCode}</Text>

            <TouchableOpacity
              style={styles.qrShareButton}
              onPress={() => {
                setShowQRModal(false);
                handleShareInvite(collectorInviteLink, collectorInviteCode);
              }}
            >
              <Share2 size={20} color={Colors.white} />
              <Text style={styles.qrShareText}>Share Invite Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.qrDownloadButton}
              onPress={() => {
                showInfo('Coming Soon', 'QR code download will be available soon');
              }}
            >
              <Download size={20} color={Colors.white} />
              <Text style={styles.qrDownloadText}>Download QR Code</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {/* Feedback Modals */}
      <FeedbackModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
      />
      <FeedbackModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
      />
      <FeedbackModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        type="info"
      />
      <FeedbackModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        type="confirm"
        onConfirm={() => {
          if (selectedInvite) {
            if (modalTitle === 'Resend Invitation') {
              handleShareInvite(selectedInvite.inviteLink, selectedInvite.inviteCode);
            } else if (modalTitle === 'Deactivate Link') {
              setPendingInvites(pendingInvites.filter(inv => inv.id !== selectedInvite.id));
            } else if (modalTitle === 'Schedule Collection' && selectedHousehold) {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              scheduleCollection(selectedHousehold.householdId, selectedHousehold.householdName, tomorrow.toISOString(), []);
            }
          }
          setSelectedInvite(null);
          setSelectedHousehold(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },
  qrButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteCodeSection: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  inviteLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inviteLink: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
  },
  copyButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  inviteCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  inviteCodeLabelSmall: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 30,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 26,
  },
  activeTab: {
    backgroundColor: Colors.primary + '10',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  householdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  householdAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  householdAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  householdInfo: {
    flex: 1,
  },
  householdName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  householdMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  householdEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  householdStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  householdItemsText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  inviteCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  inviteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inviteDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inviteLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  inviteLinkText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
  },
  inviteCodeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 1,
  },
  inviteActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  inviteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inviteActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.white,
    borderRadius: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  notCollector: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notCollectorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
  },
  notCollectorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  qrModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginBottom: 24,
  },
  qrCodeText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 2,
    marginBottom: 32,
  },
  qrShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 12,
  },
  qrShareText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  qrDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
  },
  qrDownloadText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  // Feedback Modal Styles
  feedbackModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 20,
    maxWidth: 400,
    alignSelf: 'center',
  },
  feedbackIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  feedbackIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  feedbackMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  feedbackButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  feedbackButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  confirmButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancelButton: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  confirmCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  confirmOkButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmOkGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmOkText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});