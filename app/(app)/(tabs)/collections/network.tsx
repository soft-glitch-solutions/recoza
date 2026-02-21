import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Package,
  X,
  Plus,
  ChevronRight
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { HouseholdConnection } from '@/types';

export default function NetworkScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  // Safely get households with default empty array
  const recyclablesContext = useRecyclables() || {};
  const { households = [], scheduleCollection = () => {} } = recyclablesContext;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHousehold, setNewHousehold] = useState({ name: '', email: '', phone: '' });

  const [mockHouseholds] = useState<HouseholdConnection[]>([
    {
      id: '1',
      householdId: 'h1',
      householdName: 'Thabo Mokoena',
      householdEmail: 'thabo@example.com',
      connectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalItemsLogged: 15,
    },
    {
      id: '2',
      householdId: 'h2',
      householdName: 'Naledi Sithole',
      householdEmail: 'naledi@example.com',
      connectedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      totalItemsLogged: 23,
    },
    {
      id: '3',
      householdId: 'h3',
      householdName: 'Sipho Dlamini',
      householdEmail: 'sipho@example.com',
      connectedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      totalItemsLogged: 8,
    },
  ]);

  // Ensure both arrays are iterable
  const allHouseholds = [
    ...(Array.isArray(mockHouseholds) ? mockHouseholds : []),
    ...(Array.isArray(households) ? households : [])
  ];

  const filteredHouseholds = allHouseholds.filter((h: HouseholdConnection) => 
    h && 
    h.householdName && 
    h.householdName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.householdEmail && 
    h.householdEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddHousehold = () => {
    if (!newHousehold.name || !newHousehold.email) {
      Alert.alert('Missing Information', 'Please enter at least name and email');
      return;
    }
    Alert.alert('Invite Sent', `An invite has been sent to ${newHousehold.email}`);
    setShowAddModal(false);
    setNewHousehold({ name: '', email: '', phone: '' });
  };

  const handleScheduleCollection = (household: HouseholdConnection) => {
    Alert.alert(
      'Schedule Collection',
      `Schedule a pickup from ${household.householdName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Schedule', 
          onPress: () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            scheduleCollection(household.householdId, household.householdName, tomorrow.toISOString(), []);
            Alert.alert('Scheduled!', 'Collection has been scheduled for tomorrow');
          }
        },
      ]
    );
  };

  // Calculate total items safely
  const totalItemsLogged = allHouseholds.reduce((sum: number, h: HouseholdConnection) => {
    return sum + (h?.totalItemsLogged || 0);
  }, 0);

  if (!user?.isCollector) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.notCollector}>
          <Users size={64} color={Colors.textLight} />
          <Text style={styles.notCollectorTitle}>Collector Network</Text>
          <Text style={styles.notCollectorText}>
            Become a collector to build your household network
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>My Network</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <UserPlus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search households..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{allHouseholds.length}</Text>
            <Text style={styles.statLabel}>Households</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalItemsLogged}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Connected Households</Text>
        
        {filteredHouseholds.length > 0 ? (
          filteredHouseholds.map((household: HouseholdConnection) => (
            <TouchableOpacity 
              key={household.id} 
              style={styles.householdCard}
              onPress={() => handleScheduleCollection(household)}
            >
              <View style={styles.householdAvatar}>
                <Text style={styles.householdAvatarText}>
                  {household.householdName?.charAt(0) || '?'}
                </Text>
              </View>
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
          <View style={styles.emptyState}>
            <Users size={48} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>No households found</Text>
            <Text style={styles.emptyStateSubtext}>
              Share your invite code to connect with households
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Household</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Household name"
                placeholderTextColor={Colors.textSecondary}
                value={newHousehold.name}
                onChangeText={(text) => setNewHousehold(prev => ({ ...prev, name: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={newHousehold.email}
                onChangeText={(text) => setNewHousehold(prev => ({ ...prev, email: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="+27 XX XXX XXXX"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="phone-pad"
                value={newHousehold.phone}
                onChangeText={(text) => setNewHousehold(prev => ({ ...prev, phone: text }))}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddHousehold}>
              <Plus size={20} color={Colors.white} />
              <Text style={styles.submitButtonText}>Send Invite</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  householdAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  householdAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.white,
    borderRadius: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});