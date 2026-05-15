import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Recycle, 
  X, 
  FileText, 
  GlassWater, 
  Box, 
  Package,
  Zap,
  CheckCircle2
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecyclables } from '@/contexts/RecyclablesContext';
import { useTheme } from '@/contexts/ThemeContext';

interface QuickLogSectionProps {
  isDesktop?: boolean;
  scale?: (size: number) => number;
}

export const QuickLogSection: React.FC<QuickLogSectionProps> = ({
  isDesktop = false,
  scale = (size) => size
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { addRecyclableItem, recyclableTypes = [] } = useRecyclables();
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const getIconForType = (name: string, size: number) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('plastic')) return <Package size={size} color="#ffffff" />;
    if (lowercaseName.includes('glass')) return <GlassWater size={size} color="#ffffff" />;
    if (lowercaseName.includes('paper')) return <FileText size={size} color="#ffffff" />;
    if (lowercaseName.includes('metal') || lowercaseName.includes('can')) return <Zap size={size} color="#ffffff" />;
    if (lowercaseName.includes('cardboard') || lowercaseName.includes('box')) return <Box size={size} color="#ffffff" />;
    return <Recycle size={size} color="#ffffff" />;
  };

  const getColorForType = (name: string): [string, string] => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('plastic')) return [colors.primary, colors.primaryDark];
    if (lowercaseName.includes('glass')) return [colors.info, colors.info];
    if (lowercaseName.includes('paper')) return [colors.secondary, colors.secondary];
    if (lowercaseName.includes('metal')) return [colors.accent, colors.accent];
    if (lowercaseName.includes('cardboard')) return [colors.primaryLight, colors.primaryLight];
    return [colors.primary, colors.primaryDark];
  };

  const handleSelectType = async (typeId: string, typeName: string) => {
    setLoading(true);
    try {
      const result = await addRecyclableItem({
        recyclableTypeId: typeId,
        quantity: quantity,
        estimatedWeightKg: quantity * 0.1, 
        notes: `Quick log: ${quantity}x ${typeName}`,
      });

      if (result.success) {
        setShowOverlay(false);
        setSuccessVisible(true);
        setQuantity(1); // Reset
        setTimeout(() => setSuccessVisible(false), 2000);
      } else {
        Alert.alert('Error', result.error || 'Failed to log item');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }, isDesktop && { fontSize: scale(20) }]}>
        Quick Log
      </Text>
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowOverlay(true)}
        disabled={loading || successVisible}
        style={styles.buttonWrapper}
      >
        <View
          style={[
            styles.giantButton, 
            { 
              backgroundColor: successVisible ? colors.info : colors.accent,
              borderWidth: 2,
              borderColor: successVisible ? colors.info : colors.accent,
            },
            isDesktop && { paddingVertical: 32 }
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} size="large" />
          ) : successVisible ? (
            <View style={styles.buttonContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.white }]}>
                <CheckCircle2 size={isDesktop ? scale(48) : 36} color={colors.info} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.buttonPrimaryText, { color: colors.white }]}>Logged!</Text>
                <Text style={[styles.buttonSecondaryText, { color: 'rgba(255,255,255,0.9)' }]}>Your contribution was recorded</Text>
              </View>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.white }]}>
                <Recycle size={isDesktop ? scale(48) : 36} color={colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.buttonPrimaryText, { color: colors.primary }, isDesktop && { fontSize: scale(24) }]}>
                  Log Item
                </Text>
                <Text style={[styles.buttonSecondaryText, { color: colors.primary }, isDesktop && { fontSize: scale(16) }]}>
                  Tap to choose and log what you have
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={showOverlay}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOverlay(false)}
      >
        <Pressable 
          style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]} 
          onPress={() => setShowOverlay(false)}
        >
          <View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: colors.surface,
                paddingBottom: insets.bottom + 20 
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowOverlay(false)}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>What are you logging?</Text>
            
            {/* Quantity Selector */}
            <View style={[styles.quantitySection, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.quantityLabel, { color: colors.text }]}>Quantity</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={[styles.quantityButton, { backgroundColor: colors.surface }]} 
                  onPress={decrementQuantity}
                >
                  <Text style={[styles.quantityButtonText, { color: colors.primary }]}>−</Text>
                </TouchableOpacity>
                <View style={styles.quantityValueContainer}>
                  <Text style={[styles.quantityValue, { color: colors.text }]}>{quantity}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.quantityButton, { backgroundColor: colors.surface }]} 
                  onPress={incrementQuantity}
                >
                  <Text style={[styles.quantityButtonText, { color: colors.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Select type to log instantly</Text>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.typeGrid}
            >
              {recyclableTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeItem, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight }]}
                  onPress={() => handleSelectType(type.id, type.name)}
                >
                  <View
                    style={[styles.typeIconContainer, { backgroundColor: colors.primary }]}
                  >
                    {getIconForType(type.name, 32)}
                  </View>
                  <Text style={[styles.typeName, { color: colors.text }]}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 32, width: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  buttonWrapper: { width: '100%' },
  giantButton: { width: '100%', borderRadius: 20, padding: 24, minHeight: 120, justifyContent: 'center' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  iconContainer: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1 },
  buttonPrimaryText: { color: '#ffffff', fontSize: 24, fontWeight: '900', letterSpacing: -0.5, marginBottom: 2 },
  buttonSecondaryText: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20, position: 'relative' },
  modalHandle: { width: 40, height: 4, borderRadius: 2 },
  closeButton: { position: 'absolute', right: 0, padding: 4 },
  modalTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  quantitySection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, marginBottom: 20 },
  quantityLabel: { fontSize: 16, fontWeight: '700' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  quantityButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  quantityButtonText: { fontSize: 20, fontWeight: '700' },
  quantityValueContainer: { minWidth: 40, alignItems: 'center' },
  quantityValue: { fontSize: 20, fontWeight: '800' },
  modalSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, fontWeight: '600' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 20 },
  typeItem: { width: '46%', borderRadius: 24, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1 },
  typeIconContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  typeName: { fontSize: 16, fontWeight: '700' },
});