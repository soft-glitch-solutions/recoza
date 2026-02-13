import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Check, Minus, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { RecyclableType } from '@/types';

const RECYCLABLE_ICONS: Record<RecyclableType, string> = {
  plastic: '🫙',
  paper: '📰',
  glass: '🍾',
  metal: '🥫',
  cardboard: '📦',
};

export default function LogItemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { type: preselectedType } = useLocalSearchParams<{ type?: RecyclableType }>();
  const { prices, logItem } = useRecyclables();

  const [selectedType, setSelectedType] = useState<RecyclableType | null>(
    preselectedType as RecyclableType || null
  );
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<'kg' | 'items'>('kg');

  const handleQuantityChange = (delta: number) => {
    const current = parseFloat(quantity) || 0;
    const newValue = Math.max(0.1, current + delta);
    setQuantity(newValue.toFixed(1));
  };

  const getEstimatedValue = () => {
    if (!selectedType) return 0;
    const price = prices.find(p => p.type === selectedType)?.pricePerKg || 0;
    const qty = parseFloat(quantity) || 0;
    const weight = unit === 'kg' ? qty : qty * 0.05;
    return weight * price;
  };

  const handleSave = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a recyclable type');
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    await logItem(selectedType, qty, unit);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Recyclable</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Check size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        <Text style={styles.sectionTitle}>What are you recycling?</Text>
        <View style={styles.typeGrid}>
          {prices.map((item) => (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.typeCard,
                selectedType === item.type && styles.typeCardSelected,
                { borderColor: selectedType === item.type ? Colors.recyclables[item.type] : Colors.border }
              ]}
              onPress={() => setSelectedType(item.type)}
            >
              <View style={[styles.typeIcon, { backgroundColor: Colors.recyclables[item.type] + '20' }]}>
                <Text style={styles.typeEmoji}>{RECYCLABLE_ICONS[item.type]}</Text>
              </View>
              <Text style={styles.typeLabel}>{item.label}</Text>
              <Text style={styles.typePrice}>R{item.pricePerKg}/kg</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>How much?</Text>
        <View style={styles.unitSelector}>
          <TouchableOpacity
            style={[styles.unitButton, unit === 'kg' && styles.unitButtonActive]}
            onPress={() => setUnit('kg')}
          >
            <Text style={[styles.unitButtonText, unit === 'kg' && styles.unitButtonTextActive]}>
              Kilograms
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, unit === 'items' && styles.unitButtonActive]}
            onPress={() => setUnit('items')}
          >
            <Text style={[styles.unitButtonText, unit === 'items' && styles.unitButtonTextActive]}>
              Items
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(unit === 'kg' ? -0.5 : -1)}
          >
            <Minus size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.quantityInputContainer}>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
            <Text style={styles.quantityUnit}>{unit}</Text>
          </View>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(unit === 'kg' ? 0.5 : 1)}
          >
            <Plus size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {selectedType && (
          <View style={styles.estimateCard}>
            <Text style={styles.estimateLabel}>Estimated Value</Text>
            <Text style={styles.estimateValue}>R{getEstimatedValue().toFixed(2)}</Text>
            <Text style={styles.estimateNote}>
              Based on current rates • {unit === 'items' ? `~${(parseFloat(quantity) * 0.05).toFixed(2)}kg` : ''}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
          <Text style={styles.submitButtonText}>Log Item</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  typeCard: {
    width: '31%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  typeCardSelected: {
    backgroundColor: Colors.surfaceSecondary,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeEmoji: {
    fontSize: 24,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  typePrice: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unitButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  unitButtonTextActive: {
    color: Colors.text,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 32,
  },
  quantityButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInputContainer: {
    alignItems: 'center',
  },
  quantityInput: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    minWidth: 120,
  },
  quantityUnit: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  estimateCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  estimateLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  estimateValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  estimateNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
