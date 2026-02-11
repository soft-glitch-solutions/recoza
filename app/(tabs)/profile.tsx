import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LogOut, Copy, Check, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { CollectorApplication } from '@/types/database';

export default function ProfileScreen() {
  const { profile, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<CollectorApplication | null>(null);
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [area, setArea] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      loadApplication();
    }
  }, [profile?.id]);

  const loadApplication = async () => {
    try {
      const { data } = await supabase
        .from('collector_applications')
        .select('*')
        .eq('user_id', profile?.id!)
        .order('applied_at', { ascending: false })
        .maybeSingle();

      setApplication(data);
    } catch (error) {
      console.error('Error loading application:', error);
    }
  };

  const handleApplyCollector = async () => {
    if (!motivation || !area) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('collector_applications').insert({
        user_id: profile?.id!,
        motivation,
        area,
        status: 'pending',
      });

      if (error) throw error;

      setApplicationModalVisible(false);
      setMotivation('');
      setArea('');
      loadApplication();
      await refreshProfile();
    } catch (error) {
      console.error('Error applying:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (profile?.invite_code) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileContent}>
          <Text style={styles.profileName}>{profile?.full_name}</Text>
          <Text style={styles.profileRole}>
            {profile?.is_collector
              ? profile?.collector_approved
                ? 'Collector'
                : 'Pending Approval'
              : 'Household'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Account Type</Text>
          <Text style={styles.infoValue}>
            {profile?.is_collector ? 'Collector' : 'Household'}
          </Text>
        </View>

        {profile?.phone_number && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{profile.phone_number}</Text>
          </View>
        )}
      </View>

      {profile?.is_collector && profile?.collector_approved && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collector Details</Text>

          <View style={styles.inviteCard}>
            <Text style={styles.inviteLabel}>Your Invite Code</Text>
            <Text style={styles.inviteCode}>{profile?.invite_code}</Text>
            <Text style={styles.inviteHelper}>
              Share this code with friends and family to invite them to join Recoza
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyInviteCode}
            >
              {copied ? (
                <>
                  <Check size={16} color="#059669" />
                  <Text style={styles.copyButtonText}>Copied!</Text>
                </>
              ) : (
                <>
                  <Copy size={16} color="#059669" />
                  <Text style={styles.copyButtonText}>Copy Code</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!profile?.is_collector && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Become a Collector</Text>
          <Text style={styles.sectionDescription}>
            Earn money by collecting recyclables from your community
          </Text>

          {application ? (
            <View
              style={[
                styles.applicationCard,
                application.status === 'approved' && styles.approvedCard,
                application.status === 'rejected' && styles.rejectedCard,
              ]}
            >
              <View style={styles.applicationHeader}>
                <Text style={styles.applicationStatus}>
                  Application Status: {application.status}
                </Text>
                {application.status === 'pending' && (
                  <AlertCircle size={20} color="#f59e0b" />
                )}
              </View>
              <Text style={styles.applicationDate}>
                Applied: {new Date(application.applied_at).toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setApplicationModalVisible(true)}
            >
              <Text style={styles.applyButtonText}>Apply as Collector</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {profile?.is_collector && !profile?.collector_approved && (
        <View style={styles.section}>
          <View style={styles.pendingCard}>
            <AlertCircle size={20} color="#f59e0b" />
            <View style={styles.pendingContent}>
              <Text style={styles.pendingTitle}>Application Under Review</Text>
              <Text style={styles.pendingText}>
                We're reviewing your application to become a collector. You'll be notified once
                approved.
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#dc2626" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={applicationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setApplicationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply as Collector</Text>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>What motivates you to collect?</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell us about yourself and why you want to be a collector"
                  multiline
                  numberOfLines={4}
                  value={motivation}
                  onChangeText={setMotivation}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>What area would you cover?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your neighborhood or area"
                  value={area}
                  onChangeText={setArea}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleApplyCollector}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Application</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  profileCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  profileContent: {
    gap: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  profileRole: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  inviteCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  inviteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  inviteCode: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 8,
    letterSpacing: 2,
  },
  inviteHelper: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  applyButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  applicationCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  approvedCard: {
    backgroundColor: '#d1fae5',
    borderLeftColor: '#059669',
  },
  rejectedCard: {
    backgroundColor: '#fee2e2',
    borderLeftColor: '#dc2626',
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  applicationDate: {
    fontSize: 12,
    color: '#78350f',
  },
  pendingCard: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  pendingContent: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  pendingText: {
    fontSize: 12,
    color: '#78350f',
    marginTop: 4,
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalForm: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
