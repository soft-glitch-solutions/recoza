import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Package, 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  X,
  Award,
  Wallet,
  MapPin,
  Shield,
  ChevronRight,
  Info,
  Briefcase,
  Home,
  Ban
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRecyclables } from '@/contexts/RecyclablesContext';

export default function CollectionsScreen() {
  // Initialize all hooks at the top
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    user, 
    profile,
    applyAsCollector, 
    checkCollectorStatus, 
    refreshUser,
    collectorApplication 
  } = useAuth();
  
  // Safely use useRecyclables with default values
  const recyclablesContext = useRecyclables() || {};
  const { 
    collections = [], 
    collectorStats = { weeklyEarnings: 0, householdsCount: 0 }, 
    completeCollection = () => {}, 
    scheduleCollection = () => {}, 
    uncollectedItems = [], 
    prices = [] 
  } = recyclablesContext;

  const [refreshing, setRefreshing] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCollectorModal, setShowCollectorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAlreadyAppliedModal, setShowAlreadyAppliedModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [area, setArea] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (checkCollectorStatus) {
      const { status } = await checkCollectorStatus();
      setApplicationStatus(status);
    }
    if (refreshUser) {
      await refreshUser();
    }
    setTimeout(() => setRefreshing(false), 1000);
  }, [checkCollectorStatus, refreshUser]);

  useEffect(() => {
    const checkStatus = async () => {
      if (checkCollectorStatus) {
        const { status } = await checkCollectorStatus();
        setApplicationStatus(status);
      }
    };
    checkStatus();
  }, [user, profile, checkCollectorStatus]);

  // Determine if user can apply
  const canApply = () => {
    if (!user) return false;
    
    // Already a collector
    if (profile?.is_collector) return false;
    
    // Already approved
    if (profile?.collector_approved) return false;
    
    // Has pending application
    if (collectorApplication?.status === 'pending') return false;
    
    // Has approved application
    if (collectorApplication?.status === 'approved') return false;
    
    // Has rejected application (allow reapply after 30 days)
    if (collectorApplication?.status === 'rejected') {
      // Check if 30 days have passed since rejection
      const rejectedDate = new Date(collectorApplication.reviewed_at || collectorApplication.applied_at);
      const thirtyDaysLater = new Date(rejectedDate);
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      
      if (new Date() < thirtyDaysLater) {
        return false; // Can't reapply yet
      }
    }
    
    return true;
  };

  const getApplicationStatusDisplay = () => {
    if (!user) return null;
    
    // Check profile first
    if (profile?.is_collector) {
      return {
        icon: <CheckCircle size={20} color="#10B981" />,
        text: 'Active Collector',
        color: '#10B981',
        bg: '#D1FAE5'
      };
    }
    
    if (profile?.collector_approved) {
      return {
        icon: <CheckCircle size={20} color="#10B981" />,
        text: 'Approved Collector',
        color: '#10B981',
        bg: '#D1FAE5'
      };
    }
    
    // Check application
    if (collectorApplication) {
      switch (collectorApplication.status) {
        case 'pending':
          return {
            icon: <Clock size={20} color="#F59E0B" />,
            text: 'Application Pending',
            color: '#F59E0B',
            bg: '#FEF3C7'
          };
        case 'approved':
          return {
            icon: <CheckCircle size={20} color="#10B981" />,
            text: 'Application Approved',
            color: '#10B981',
            bg: '#D1FAE5'
          };
        case 'rejected':
          return {
            icon: <Ban size={20} color="#EF4444" />,
            text: 'Application Rejected',
            color: '#EF4444',
            bg: '#FEE2E2'
          };
      }
    }
    
    return null;
  };

  const statusDisplay = getApplicationStatusDisplay();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'scheduled':
        return <Clock size={16} color={Colors.warning} />;
      default:
        return <AlertCircle size={16} color={Colors.error} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'scheduled':
        return Colors.warning;
      default:
        return Colors.error;
    }
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

  const showAlreadyApplied = () => {
    let message = '';
    if (collectorApplication?.status === 'pending') {
      message = 'You already have a pending application. We\'ll notify you once it\'s reviewed.';
    } else if (collectorApplication?.status === 'approved') {
      message = 'Your collector application has already been approved! You can now start collecting.';
    } else if (collectorApplication?.status === 'rejected') {
      const rejectedDate = new Date(collectorApplication.reviewed_at || collectorApplication.applied_at);
      const thirtyDaysLater = new Date(rejectedDate);
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      
      message = `Your previous application was rejected. You can reapply after ${thirtyDaysLater.toLocaleDateString()}.`;
    } else if (profile?.is_collector || profile?.collector_approved) {
      message = 'You are already a collector! You can start managing collections.';
    }
    
    setModalTitle('Already Applied');
    setModalMessage(message);
    setShowAlreadyAppliedModal(true);
  };

  const handleApplyPress = () => {
    if (!canApply()) {
      showAlreadyApplied();
      return;
    }
    setShowCollectorModal(true);
  };

  const handleApplyAsCollector = async () => {
    if (!motivation.trim() || !area.trim()) {
      showError(
        'Missing Information',
        'Please tell us why you want to become a collector and your area'
      );
      return;
    }

    // Double-check before submitting
    if (!canApply()) {
      setShowCollectorModal(false);
      showAlreadyApplied();
      return;
    }

    setIsApplying(true);
    try {
      if (applyAsCollector) {
        const result = await applyAsCollector(motivation, area);
        
        if (result.success) {
          setShowCollectorModal(false);
          setMotivation('');
          setArea('');
          setCurrentStep(1);
          
          // Refresh status
          if (checkCollectorStatus) {
            const { status } = await checkCollectorStatus();
            setApplicationStatus(status);
          }
          
          showSuccess(
            'Application Submitted! 🎉',
            'Your collector application is being reviewed. We\'ll notify you within 24-48 hours.'
          );
        } else {
          showError(
            'Application Failed',
            result.error || 'Failed to submit application. Please try again.'
          );
        }
      } else {
        throw new Error('Apply function not available');
      }
    } catch (error: any) {
      showError(
        'Application Failed',
        error.message || 'Failed to submit application. Please try again.'
      );
    } finally {
      setIsApplying(false);
    }
  };

  const handleScheduleCollection = () => {
    if (uncollectedItems.length === 0) {
      showInfo(
        'No Items Available',
        'There are no uncollected items to schedule. Start by logging some recyclables first!'
      );
      return;
    }
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    scheduleCollection('self', 'My Collection', tomorrow.toISOString(), uncollectedItems);
    setShowScheduleModal(false);
    showSuccess(
      'Collection Scheduled! 📅',
      'Your collection has been scheduled for tomorrow. We\'ll send you a reminder.'
    );
  };

  const isCollector = profile?.is_collector || false;
  const pendingCollections = collections.filter((c: any) => c?.status === 'scheduled');
  const completedCollections = collections.filter((c: any) => c?.status === 'completed');

  // Feedback Modal Component
  const FeedbackModal = ({ 
    visible, 
    onClose, 
    type 
  }: { 
    visible: boolean; 
    onClose: () => void; 
    type: 'success' | 'error' | 'info' | 'warning';
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
            icon: <Ban size={48} color="#F59E0B" />,
            gradient: ['#F59E0B', '#D97706'] as const,
            bgColor: '#FEF3C7',
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
          </View>
        </View>
      </Modal>
    );
  };

  if (!isCollector) {
    return (
      <View style={styles.container}>
        <View style={[styles.notCollectorHeader, { paddingTop: insets.top + 16 }]}>
          <LinearGradient
            colors={['#E0F2FE', '#BAE6FD']}
            style={styles.welcomeIconContainer}
          >
            <Home size={48} color={Colors.primary} />
          </LinearGradient>
          <Text style={styles.notCollectorTitle}>Welcome to Collections</Text>
          <Text style={styles.notCollectorText}>
            As a collector, you can plan weekly collections from households in your network and earn money for recycling.
          </Text>
          
          {statusDisplay && (
            <View style={[styles.statusPill, { backgroundColor: statusDisplay.bg }]}>
              {statusDisplay.icon}
              <Text style={[styles.statusPillText, { color: statusDisplay.color }]}>
                {statusDisplay.text}
              </Text>
            </View>
          )}
          
          {canApply() && (
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApplyPress}
            >
              <LinearGradient
                colors={[Colors.primary, '#059669']}
                style={styles.applyButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Award size={20} color={Colors.white} />
                <Text style={styles.applyButtonText}>Apply to Become a Collector</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {collectorApplication?.status === 'rejected' && (
            <TouchableOpacity 
              style={[styles.applyButton, { marginTop: 12 }]}
              onPress={() => {
                showInfo(
                  'Reapplication Info',
                  'Rejected applications can be resubmitted after 30 days. Please contact support if you have questions.'
                );
              }}
            >
              <LinearGradient
                colors={['#9CA3AF', '#6B7280']}
                style={styles.applyButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Info size={20} color={Colors.white} />
                <Text style={styles.applyButtonText}>Application Status</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.householdSection}>
          <Text style={styles.sectionTitle}>Your Collection Status</Text>
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.householdCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.householdIcon}>
              <Calendar size={24} color={Colors.primary} />
            </View>
            <View style={styles.householdInfo}>
              <Text style={styles.householdLabel}>Next Pickup</Text>
              <Text style={styles.householdValue}>No collection scheduled</Text>
            </View>
          </LinearGradient>
          <Text style={styles.householdHint}>
            Your collector will notify you when they plan a pickup
          </Text>
        </View>

        {/* Collector Application Modal */}
        <Modal
          visible={showCollectorModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowCollectorModal(false);
            setCurrentStep(1);
            setMotivation('');
            setArea('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <LinearGradient
                    colors={['#F59E0B20', '#F59E0B10']}
                    style={styles.modalIcon}
                  >
                    <Award size={24} color="#F59E0B" />
                  </LinearGradient>
                  <Text style={styles.modalTitle}>Become a Collector</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    setShowCollectorModal(false);
                    setCurrentStep(1);
                    setMotivation('');
                    setArea('');
                  }}
                  style={styles.closeButton}
                >
                  <X size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Step Indicator */}
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]}>
                  <Text style={[styles.stepDotText, currentStep >= 1 && styles.stepDotTextActive]}>1</Text>
                </View>
                <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
                <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]}>
                  <Text style={[styles.stepDotText, currentStep >= 2 && styles.stepDotTextActive]}>2</Text>
                </View>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                style={styles.modalScrollView}
              >
                {currentStep === 1 ? (
                  // Step 1: Information
                  <>
                    <View style={styles.benefitsSection}>
                      <Text style={styles.benefitsTitle}>What you'll get:</Text>
                      
                      <View style={styles.benefitItem}>
                        <View style={[styles.benefitIcon, { backgroundColor: '#D1FAE5' }]}>
                          <Wallet size={20} color="#10B981" />
                        </View>
                        <View style={styles.benefitContent}>
                          <Text style={styles.benefitTitle}>Earn Money</Text>
                          <Text style={styles.benefitDescription}>
                            Get paid for every collection. Average collectors earn R500-1500 per week.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.benefitItem}>
                        <View style={[styles.benefitIcon, { backgroundColor: '#DBEAFE' }]}>
                          <Users size={20} color="#3B82F6" />
                        </View>
                        <View style={styles.benefitContent}>
                          <Text style={styles.benefitTitle}>Build Your Network</Text>
                          <Text style={styles.benefitDescription}>
                            Create a network of households in your area and build recurring collections.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.benefitItem}>
                        <View style={[styles.benefitIcon, { backgroundColor: '#FEF3C7' }]}>
                          <Calendar size={20} color="#F59E0B" />
                        </View>
                        <View style={styles.benefitContent}>
                          <Text style={styles.benefitTitle}>Flexible Schedule</Text>
                          <Text style={styles.benefitDescription}>
                            Plan your collections on your own time. Work around your existing commitments.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.benefitItem}>
                        <View style={[styles.benefitIcon, { backgroundColor: '#E0F2FE' }]}>
                          <Shield size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.benefitContent}>
                          <Text style={styles.benefitTitle}>Verified Status</Text>
                          <Text style={styles.benefitDescription}>
                            Get a verified collector badge and build trust with households in your network.
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.requirementsSection}>
                      <Text style={styles.requirementsTitle}>Requirements:</Text>
                      
                      <View style={styles.requirementItem}>
                        <CheckCircle size={16} color="#10B981" />
                        <Text style={styles.requirementText}>18 years or older</Text>
                      </View>
                      
                      <View style={styles.requirementItem}>
                        <CheckCircle size={16} color="#10B981" />
                        <Text style={styles.requirementText}>Valid South African ID</Text>
                      </View>
                      
                      <View style={styles.requirementItem}>
                        <CheckCircle size={16} color="#10B981" />
                        <Text style={styles.requirementText}>Access to a smartphone</Text>
                      </View>
                    </View>

                    <View style={styles.howItWorksSection}>
                      <Text style={styles.howItWorksTitle}>How it works:</Text>
                      
                      <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <View style={styles.stepContent}>
                          <Text style={styles.stepTitle}>Apply & Get Verified</Text>
                          <Text style={styles.stepDescription}>
                            Submit your application. We'll review and verify your details within 24-48 hours.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <View style={styles.stepContent}>
                          <Text style={styles.stepTitle}>Build Your Network</Text>
                          <Text style={styles.stepDescription}>
                            Share your unique invite code with households to add them to your collection network.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <View style={styles.stepContent}>
                          <Text style={styles.stepTitle}>Schedule Collections</Text>
                          <Text style={styles.stepDescription}>
                            Plan weekly pickups, track recyclables, and earn money for every collection.
                          </Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={() => setCurrentStep(2)}
                    >
                      <LinearGradient
                        colors={[Colors.primary, '#059669']}
                        style={styles.nextButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.nextButtonText}>Continue</Text>
                        <ChevronRight size={20} color={Colors.white} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : (
                  // Step 2: Application Form
                  <>
                    <View style={styles.formSection}>
                      <Text style={styles.formLabel}>Your Area *</Text>
                      <View style={styles.inputContainer}>
                        <MapPin size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="e.g., Soweto, Johannesburg"
                          placeholderTextColor={Colors.textLight}
                          value={area}
                          onChangeText={setArea}
                        />
                      </View>
                      <Text style={styles.inputHint}>Tell us where you'll be collecting</Text>

                      <Text style={[styles.formLabel, { marginTop: 20 }]}>Why do you want to become a collector? *</Text>
                      <View style={styles.textAreaContainer}>
                        <Briefcase size={20} color={Colors.textSecondary} style={styles.textAreaIcon} />
                        <TextInput
                          style={styles.textArea}
                          placeholder="Tell us about your motivation..."
                          placeholderTextColor={Colors.textLight}
                          value={motivation}
                          onChangeText={setMotivation}
                          multiline
                          numberOfLines={4}
                          textAlignVertical="top"
                        />
                      </View>
                      <Text style={styles.inputHint}>
                        Share your experience with recycling and why you'd be a great collector
                      </Text>
                    </View>

                    <View style={styles.notesSection}>
                      <Info size={16} color={Colors.textSecondary} />
                      <Text style={styles.notesText}>
                        By applying, you agree to follow Recoza's collector guidelines and code of conduct.
                        Your application will be reviewed within 24-48 hours.
                      </Text>
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setCurrentStep(1)}
                      >
                        <Text style={styles.backButtonText}>Back</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.applyNowButton}
                        onPress={handleApplyAsCollector}
                        disabled={isApplying || !motivation.trim() || !area.trim()}
                      >
                        <LinearGradient
                          colors={isApplying ? ['#9CA3AF', '#6B7280'] : ['#F59E0B', '#D97706']}
                          style={[
                            styles.applyNowGradient,
                            (isApplying || !motivation.trim() || !area.trim()) && styles.disabledButton
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          {isApplying ? (
                            <>
                              <Clock size={20} color={Colors.white} />
                              <Text style={styles.applyNowText}>Submitting...</Text>
                            </>
                          ) : (
                            <Text style={styles.applyNowText}>Submit Application</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
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
          visible={showAlreadyAppliedModal}
          onClose={() => setShowAlreadyAppliedModal(false)}
          type="warning"
        />
      </View>
    );
  }

  // Collector View
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, '#059669']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.headerTitle}>Collections</Text>
        <View style={styles.headerActions}>
          <Text style={styles.headerSubtitle}>Manage your pickups</Text>
          <TouchableOpacity 
            style={styles.networkButton}
            onPress={() => router.push('/(tabs)/collections/network')}
          >
            <Users size={18} color={Colors.white} />
            <Text style={styles.networkButtonText}>Network</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.statValue}>R{collectorStats?.weeklyEarnings?.toFixed(0) || '0'}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Package size={20} color={Colors.warning} />
            <Text style={styles.statValue}>{pendingCollections.length}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Users size={20} color={Colors.success} />
            <Text style={styles.statValue}>{collectorStats?.householdsCount || 0}</Text>
            <Text style={styles.statLabel}>Households</Text>
          </LinearGradient>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {pendingCollections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Collections</Text>
            {pendingCollections.map((collection: any) => (
              <LinearGradient
                key={collection.id}
                colors={['#FFFFFF', '#F9FAFB']}
                style={styles.collectionCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.collectionHeader}>
                  <View style={styles.collectionInfo}>
                    <Text style={styles.collectionName}>{collection.householdName}</Text>
                    <View style={styles.collectionDate}>
                      <Calendar size={14} color={Colors.textSecondary} />
                      <Text style={styles.collectionDateText}>
                        {new Date(collection.scheduledDate).toLocaleDateString('en-ZA', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(collection.status) + '20' }]}>
                    {getStatusIcon(collection.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(collection.status), marginLeft: 4 }]}>
                      {collection.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.collectionDetails}>
                  <View style={styles.collectionStat}>
                    <Text style={styles.collectionStatLabel}>Weight</Text>
                    <Text style={styles.collectionStatValue}>{collection.totalWeight?.toFixed(1) || '0'} kg</Text>
                  </View>
                  <View style={styles.collectionStat}>
                    <Text style={styles.collectionStatLabel}>Est. Value</Text>
                    <Text style={[styles.collectionStatValue, { color: Colors.primary }]}>
                      R{collection.estimatedEarnings?.toFixed(2) || '0.00'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => completeCollection(collection.id)}
                >
                  <LinearGradient
                    colors={[Colors.success, '#059669']}
                    style={styles.completeButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <CheckCircle size={18} color={Colors.white} />
                    <Text style={styles.completeButtonText}>Mark Complete</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection History</Text>
          {completedCollections.length > 0 ? (
            completedCollections.slice(0, 10).map((collection: any) => (
              <LinearGradient
                key={collection.id}
                colors={['#FFFFFF', '#F9FAFB']}
                style={styles.historyCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName}>{collection.householdName}</Text>
                  <Text style={styles.historyDate}>
                    {collection.completedAt && new Date(collection.completedAt).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={styles.historyStats}>
                  <Text style={styles.historyWeight}>{collection.totalWeight?.toFixed(1) || '0'} kg</Text>
                  <Text style={styles.historyEarnings}>R{collection.estimatedEarnings?.toFixed(2) || '0.00'}</Text>
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
              <Package size={48} color={Colors.textLight} />
              <Text style={styles.emptyStateText}>No collections yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start by connecting with households in your network
              </Text>
            </LinearGradient>
          )}
        </View>

        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={handleScheduleCollection}
        >
          <LinearGradient
            colors={[Colors.primary, '#059669']}
            style={styles.scheduleButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Plus size={20} color={Colors.white} />
            <Text style={styles.scheduleButtonText}>Schedule Collection</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Schedule Collection Modal */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Collection</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Items ready for collection:</Text>
            
            <LinearGradient
              colors={['#F9FAFB', '#F3F4F6']}
              style={styles.itemsSummary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {Object.entries(
                uncollectedItems.reduce((acc: any, item: any) => {
                  const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
                  acc[item.type] = (acc[item.type] || 0) + weight;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, weight]) => (
                <View key={type} style={styles.itemSummaryRow}>
                  <Text style={styles.itemSummaryType}>
                    {prices.find((p: any) => p.type === type)?.label || type}
                  </Text>
                  <Text style={styles.itemSummaryWeight}>{(weight as number).toFixed(1)} kg</Text>
                </View>
              ))}
            </LinearGradient>

            <TouchableOpacity
              style={styles.confirmScheduleButton}
              onPress={handleConfirmSchedule}
            >
              <LinearGradient
                colors={[Colors.success, '#059669']}
                style={styles.confirmScheduleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Calendar size={20} color={Colors.white} />
                <Text style={styles.confirmScheduleText}>Schedule for Tomorrow</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
        visible={showAlreadyAppliedModal}
        onClose={() => setShowAlreadyAppliedModal(false)}
        type="warning"
      />
    </View>
  );
}

// All the styles remain exactly the same as before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  networkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  networkButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -40,
    left: 20,
    right: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    marginTop: 50,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  collectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  collectionDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  collectionDateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  collectionDetails: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  collectionStat: {},
  collectionStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  collectionStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  completeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyStats: {
    alignItems: 'flex-end',
  },
  historyWeight: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  historyEarnings: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.white,
    borderRadius: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  notCollectorHeader: {
    alignItems: 'center',
    padding: 40,
    paddingBottom: 32,
  },
  welcomeIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  notCollectorTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  notCollectorText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginBottom: 20,
  },
  statusPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    borderRadius: 30,
    overflow: 'hidden',
    width: '100%',
  },
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  householdSection: {
    padding: 20,
  },
  householdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  householdIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  householdInfo: {
    flex: 1,
  },
  householdLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  householdValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  householdHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  scheduleButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  scheduleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    maxHeight: '70%',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  itemsSummary: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  itemSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemSummaryType: {
    fontSize: 15,
    color: Colors.text,
  },
  itemSummaryWeight: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  confirmScheduleButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmScheduleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  confirmScheduleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  // Modal styles
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepDotText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  stepDotTextActive: {
    color: Colors.white,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.surfaceSecondary,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  requirementsSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
  },
  requirementsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.text,
  },
  howItWorksSection: {
    marginBottom: 24,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 24,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minHeight: 100,
  },
  textAreaIcon: {
    marginRight: 8,
    marginTop: 14,
  },
  textArea: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  applyNowButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  applyNowGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  applyNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  notesSection: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    marginBottom: 16,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
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
});