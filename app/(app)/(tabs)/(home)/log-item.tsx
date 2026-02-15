import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Check, Minus, Plus, ChevronRight, Leaf } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { useAuth } from '@/contexts/AuthContext';
import { RecyclableType } from '@/types';

// Common household items with their typical weights (only weight, no price for households)
const COMMON_ITEMS = [
  {
    id: 'plastic_bottle_2l',
    type: 'plastic' as RecyclableType,
    name: 'Plastic Bottle (2L)',
    icon: '🧴',
    weightKg: 0.05,
    color: '#2D9B5E',
  },
  {
    id: 'plastic_bottle_500ml',
    type: 'plastic' as RecyclableType,
    name: 'Plastic Bottle (500ml)',
    icon: '🥤',
    weightKg: 0.02,
    color: '#2D9B5E',
  },
  {
    id: 'can_soda',
    type: 'metal' as RecyclableType,
    name: 'Soda Can',
    icon: '🥫',
    weightKg: 0.015,
    color: '#EF4444',
  },
  {
    id: 'glass_bottle',
    type: 'glass' as RecyclableType,
    name: 'Glass Bottle',
    icon: '🍾',
    weightKg: 0.4,
    color: '#F59E0B',
  },
  {
    id: 'newspaper',
    type: 'paper' as RecyclableType,
    name: 'Newspaper',
    icon: '📰',
    weightKg: 0.5,
    color: '#3B82F6',
  },
  {
    id: 'magazine',
    type: 'paper' as RecyclableType,
    name: 'Magazine',
    icon: '📓',
    weightKg: 0.3,
    color: '#3B82F6',
  },
  {
    id: 'cardboard_box',
    type: 'cardboard' as RecyclableType,
    name: 'Cardboard Box',
    icon: '📦',
    weightKg: 0.5,
    color: '#8B5CF6',
  },
  {
    id: 'egg_carton',
    type: 'cardboard' as RecyclableType,
    name: 'Egg Carton',
    icon: '🥚',
    weightKg: 0.1,
    color: '#8B5CF6',
  },
];

// Group items by type for better organization
const ITEMS_BY_TYPE = {
  plastic: COMMON_ITEMS.filter(item => item.type === 'plastic'),
  metal: COMMON_ITEMS.filter(item => item.type === 'metal'),
  glass: COMMON_ITEMS.filter(item => item.type === 'glass'),
  paper: COMMON_ITEMS.filter(item => item.type === 'paper'),
  cardboard: COMMON_ITEMS.filter(item => item.type === 'cardboard'),
};

export default function LogItemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { type: preselectedType } = useLocalSearchParams<{ type?: RecyclableType }>();
  const { addRecyclableItem, loading } = useRecyclables();

  // Check if user is a collector
  const isCollector = user?.is_collector === true;

  const [selectedCategory, setSelectedCategory] = useState<RecyclableType | null>(
    preselectedType as RecyclableType || null
  );
  const [selectedItem, setSelectedItem] = useState<typeof COMMON_ITEMS[0] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const getTotalWeight = () => {
    if (!selectedItem) return 0;
    return selectedItem.weightKg * quantity;
  };

  const getCO2Saved = () => {
    return getTotalWeight() * 2.5;
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to log items');
      return;
    }

    if (!selectedItem) {
      Alert.alert('Error', 'Please select an item type');
      return;
    }

    setIsSaving(true);
    try {
      const totalWeight = getTotalWeight();

      const result = await addRecyclableItem({
        type: selectedItem.type,
        quantity: quantity,
        unit: 'items',
        item_type: selectedItem.id,
        item_name: selectedItem.name,
        weight_kg: totalWeight,
        status: 'pending',
      });

      if (result.success) {
        Alert.alert(
          '🎉 Thank You!', 
          `You've logged ${quantity} ${selectedItem.name}(s) for recycling!\n\n🌍 You helped save ${getCO2Saved().toFixed(1)}kg of CO₂!`,
          [{ text: 'Awesome!', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to log item');
      }
    } catch (error) {
      console.error('Error logging item:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryIcon = (type: RecyclableType) => {
    switch (type) {
      case 'plastic': return '🧴';
      case 'metal': return '🥫';
      case 'glass': return '🍾';
      case 'paper': return '📰';
      case 'cardboard': return '📦';
    }
  };

  const getCategoryColor = (type: RecyclableType) => {
    const item = COMMON_ITEMS.find(i => i.type === type);
    return item?.color || Colors.primary;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedItem ? 'How Many?' : 'What are you recycling?'}
        </Text>
        {selectedItem && (
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            disabled={isSaving || loading}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Check size={24} color={Colors.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {!selectedItem ? (
          // Category Selection
          <>
            <Text style={styles.sectionTitle}>Choose a category</Text>
            <View style={styles.categoryGrid}>
              {(['plastic', 'metal', 'glass', 'paper', 'cardboard'] as RecyclableType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.categoryCard,
                    selectedCategory === type && styles.categoryCardSelected,
                    { borderColor: selectedCategory === type ? getCategoryColor(type) : Colors.border }
                  ]}
                  onPress={() => setSelectedCategory(type)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(type) + '20' }]}>
                    <Text style={styles.categoryEmoji}>{getCategoryIcon(type)}</Text>
                  </View>
                  <Text style={styles.categoryLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  <ChevronRight size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            {selectedCategory && (
              <>
                <Text style={styles.sectionTitle}>What exactly do you have?</Text>
                <View style={styles.itemsList}>
                  {ITEMS_BY_TYPE[selectedCategory].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.itemCard}
                      onPress={() => setSelectedItem(item)}
                    >
                      <View style={[styles.itemIcon, { backgroundColor: item.color + '20' }]}>
                        <Text style={styles.itemEmoji}>{item.icon}</Text>
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemDetails}>
                          ~{item.weightKg}kg each
                        </Text>
                      </View>
                      <ChevronRight size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  ))}

                  {/* Custom Item Option */}
                  <TouchableOpacity 
                    style={styles.customItemCard}
                    onPress={() => {
                      Alert.alert(
                        'Custom Item',
                        'Please describe your item and approximate weight',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'OK', onPress: () => setShowCustom(true) }
                        ]
                      );
                    }}
                  >
                    <View style={[styles.itemIcon, { backgroundColor: Colors.primary + '20' }]}>
                      <Text style={styles.itemEmoji}>➕</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>Other Item</Text>
                      <Text style={styles.itemDetails}>Tap to describe</Text>
                    </View>
                    <ChevronRight size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        ) : (
          // Quantity Selection
          <>
            <View style={styles.selectedItemHeader}>
              <View style={[styles.selectedItemIcon, { backgroundColor: selectedItem.color + '20' }]}>
                <Text style={styles.selectedItemEmoji}>{selectedItem.icon}</Text>
              </View>
              <View style={styles.selectedItemInfo}>
                <Text style={styles.selectedItemName}>{selectedItem.name}</Text>
                <Text style={styles.selectedItemDetails}>
                  {selectedItem.weightKg}kg each
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setSelectedItem(null)}
                style={styles.changeButton}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>How many do you have?</Text>
              
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(-1)}
                >
                  <Minus size={24} color={Colors.text} />
                </TouchableOpacity>
                
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityNumber}>{quantity}</Text>
                  <Text style={styles.quantityUnit}>items</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(1)}
                >
                  <Plus size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Summary Card - Show Impact Only */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Your Impact</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total weight:</Text>
                <Text style={styles.summaryValue}>{getTotalWeight().toFixed(2)} kg</Text>
              </View>
              
              <View style={styles.impactPreview}>
                <Leaf size={20} color={Colors.success} />
                <Text style={styles.impactPreviewText}>
                  You'll save {getCO2Saved().toFixed(1)}kg of CO₂!
                </Text>
              </View>

              <View style={styles.thankYouNote}>
                <Text style={styles.thankYouText}>
                  Thank you for helping make South Africa greener! 🌍
                </Text>
              </View>
            </View>

            {/* Quick Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Recycling Tips</Text>
              <Text style={styles.tipsText}>
                • Rinse items before recycling{'\n'}
                • Remove caps and labels{'\n'}
                • Flatten cardboard boxes to save space{'\n'}
                • Keep items separate by type
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Button for when no item selected */}
      {!selectedItem && selectedCategory && (
        <View style={[styles.bottomButton, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity 
            style={[styles.submitButton, (!selectedCategory) && styles.submitButtonDisabled]}
            onPress={() => setSelectedItem(ITEMS_BY_TYPE[selectedCategory][0])}
            disabled={!selectedCategory}
          >
            <Text style={styles.submitButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  categoryGrid: {
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryCardSelected: {
    backgroundColor: Colors.surfaceSecondary,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  customItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  selectedItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  selectedItemIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedItemEmoji: {
    fontSize: 32,
  },
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedItemDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  quantitySection: {
    marginBottom: 32,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  quantityButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    alignItems: 'center',
    minWidth: 100,
  },
  quantityNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text,
  },
  quantityUnit: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.primary + '20',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  impactPreview: {
    backgroundColor: Colors.success + '15',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  impactPreviewText: {
    color: Colors.success,
    fontWeight: '700',
    fontSize: 15,
  },
  thankYouNote: {
    alignItems: 'center',
    padding: 8,
  },
  thankYouText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tipsCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomButton: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textLight,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
});