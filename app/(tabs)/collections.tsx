import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus, X } from 'lucide-react-native';
import type { LoggedItem, Collection } from '@/types/database';

interface ItemWithType extends LoggedItem {
  recyclable_types: { name: string } | null;
}

export default function CollectionsScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ItemWithType[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [recyclableTypes, setRecyclableTypes] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [profile?.id]);

  const loadData = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      const { data: types } = await supabase
        .from('recyclable_types')
        .select('*')
        .eq('active', true);

      setRecyclableTypes(types || []);

      if (!profile.is_collector) {
        const { data: loggedItems } = await supabase
          .from('logged_items')
          .select('*, recyclable_types(name)')
          .eq('household_id', profile.id)
          .order('logged_at', { ascending: false });

        setItems(loggedItems || []);
      } else {
        const { data: myCollections } = await supabase
          .from('collections')
          .select('*')
          .eq('collector_id', profile.id)
          .order('scheduled_date', { ascending: false });

        setCollections(myCollections || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!selectedType || !quantity || !weight) return;

    try {
      const { error } = await supabase.from('logged_items').insert({
        household_id: profile?.id!,
        recyclable_type_id: selectedType,
        quantity: parseInt(quantity),
        estimated_weight_kg: parseFloat(weight),
      });

      if (error) throw error;

      setItemModalVisible(false);
      setQuantity('');
      setWeight('');
      setSelectedType('');
      loadData();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {profile?.is_collector ? 'My Collections' : 'Track Recyclables'}
        </Text>
      </View>

      {!profile?.is_collector && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setItemModalVisible(true)}
        >
          <Plus size={20} color="#ffffff" strokeWidth={2} />
          <Text style={styles.addButtonText}>Log Item</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator color="#059669" size="large" />
      ) : !profile?.is_collector ? (
        items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items logged</Text>
            <Text style={styles.emptyStateSubtext}>Tap above to add your first recyclable</Text>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemType}>{item.recyclable_types?.name}</Text>
                  <Text style={styles.itemDate}>
                    {new Date(item.logged_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemDetail}>
                    Quantity: {item.quantity} items
                  </Text>
                  <Text style={styles.itemDetail}>
                    Weight: {item.estimated_weight_kg} kg
                  </Text>
                  {item.notes && (
                    <Text style={styles.itemNotes}>{item.notes}</Text>
                  )}
                </View>
                <View style={styles.itemFooter}>
                  <View
                    style={[
                      styles.statusBadge,
                      item.collected ? styles.collectedBadge : styles.pendingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.collected ? styles.collectedText : styles.pendingText,
                      ]}
                    >
                      {item.collected ? 'Collected' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )
      ) : collections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No collections yet</Text>
          <Text style={styles.emptyStateSubtext}>Create your first collection schedule</Text>
        </View>
      ) : (
        <View style={styles.collectionsList}>
          {collections.map((collection) => (
            <View key={collection.id} style={styles.collectionCard}>
              <View style={styles.collectionHeader}>
                <Text style={styles.collectionDate}>
                  {new Date(collection.scheduled_date).toLocaleDateString()}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    collection.status === 'completed'
                      ? styles.completedBadge
                      : collection.status === 'scheduled'
                        ? styles.scheduledBadge
                        : styles.cancelledBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      collection.status === 'completed'
                        ? styles.completedText
                        : collection.status === 'scheduled'
                          ? styles.scheduledText
                          : styles.cancelledText,
                    ]}
                  >
                    {collection.status}
                  </Text>
                </View>
              </View>
              <View style={styles.collectionDetails}>
                <Text style={styles.collectionDetail}>
                  Weight: {collection.total_weight_kg || 'N/A'} kg
                </Text>
                <Text style={styles.collectionEarnings}>
                  R{collection.estimated_earnings.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={itemModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setItemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Recyclable Item</Text>
              <TouchableOpacity onPress={() => setItemModalVisible(false)}>
                <X size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type</Text>
                <ScrollView style={styles.typeSelector} horizontal showsHorizontalScrollIndicator={false}>
                  {recyclableTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeOption,
                        selectedType === type.id && styles.typeOptionSelected,
                      ]}
                      onPress={() => setSelectedType(type.id)}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          selectedType === type.id && styles.typeOptionTextSelected,
                        ]}
                      >
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Number of items"
                  keyboardType="number-pad"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Estimated weight"
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddItem}
              >
                <Text style={styles.submitButtonText}>Add Item</Text>
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
    marginBottom: 20,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  itemDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemDetails: {
    gap: 6,
    marginBottom: 12,
  },
  itemDetail: {
    fontSize: 13,
    color: '#4b5563',
  },
  itemNotes: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  itemFooter: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  collectedBadge: {
    backgroundColor: '#d1fae5',
  },
  completedBadge: {
    backgroundColor: '#d1fae5',
  },
  scheduledBadge: {
    backgroundColor: '#fef3c7',
  },
  cancelledBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pendingText: {
    color: '#92400e',
  },
  collectedText: {
    color: '#065f46',
  },
  completedText: {
    color: '#065f46',
  },
  scheduledText: {
    color: '#92400e',
  },
  cancelledText: {
    color: '#991b1b',
  },
  collectionsList: {
    gap: 12,
  },
  collectionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  collectionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  collectionDetails: {
    gap: 8,
  },
  collectionDetail: {
    fontSize: 13,
    color: '#4b5563',
  },
  collectionEarnings: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  typeSelector: {
    gap: 8,
  },
  typeOption: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  typeOptionTextSelected: {
    color: '#ffffff',
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
  submitButton: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
