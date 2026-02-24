import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Recycle, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface WeeklyItemsProps {
  items: any[];
  weeklyItems: any[];
  getIcon: (type: string) => string;
  getLabel: (type: string) => string;
  getColor: (type: string) => string;
  formatDate: (date: string) => string;
  onDelete: (itemId: string) => void;
  isDesktop?: boolean;
  scale?: (size: number) => number;
}

export const WeeklyItems: React.FC<WeeklyItemsProps> = ({
  items,
  weeklyItems,
  getIcon,
  getLabel,
  getColor,
  formatDate,
  onDelete,
  isDesktop = false,
  scale = (size) => size
}) => {
  return (
    <View style={[
      styles.section,
      isDesktop && styles.desktopGridItem
    ]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isDesktop && { fontSize: scale(24) }]}>
          This Week's Items
        </Text>
        <View style={[
          styles.weekBadge,
          isDesktop && {
            paddingHorizontal: scale(12),
            paddingVertical: scale(6),
            borderRadius: scale(16),
          }
        ]}>
          <Calendar size={isDesktop ? 16 : 14} color={Colors.primary} />
          <Text style={[styles.weekBadgeText, isDesktop && { fontSize: scale(14) }]}>
            {weeklyItems.length} items
          </Text>
        </View>
      </View>

      {items.length > 0 ? (
        <View style={styles.itemsGrid}>
          {items.slice(0, isDesktop ? 5 : 3).map((item, index) => {
            const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
            
            return (
              <View key={item.id} style={[
                styles.itemCard,
                isDesktop && { padding: scale(20) }
              ]}>
                <View style={[
                  styles.itemIconContainer,
                  { 
                    backgroundColor: getColor(item.type) + '15',
                    width: isDesktop ? scale(60) : 48,
                    height: isDesktop ? scale(60) : 48,
                    borderRadius: isDesktop ? scale(16) : 12,
                  }
                ]}>
                  <Text style={[
                    styles.itemEmoji,
                    isDesktop && { fontSize: scale(28) }
                  ]}>
                    {getIcon(item.type)}
                  </Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[
                    styles.itemType,
                    isDesktop && { fontSize: scale(18) }
                  ]}>
                    {item.item_name || getLabel(item.type)}
                  </Text>
                  <Text style={[
                    styles.itemWeight,
                    isDesktop && { fontSize: scale(16) }
                  ]}>
                    {weight.toFixed(1)} kg
                  </Text>
                  <Text style={[
                    styles.itemDate,
                    isDesktop && { fontSize: scale(14) }
                  ]}>
                    {formatDate(item.created_at)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.deleteButton, isDesktop && { padding: scale(10) }]}
                  onPress={() => onDelete(item.id)}
                >
                  <Trash2 size={isDesktop ? 20 : 18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={[
          styles.emptyState,
          isDesktop && { padding: scale(40), borderRadius: scale(20) }
        ]}>
          <Recycle size={isDesktop ? 64 : 48} color={Colors.textLight} />
          <Text style={[styles.emptyStateText, isDesktop && { fontSize: scale(18), marginTop: scale(16) }]}>
            No items logged this week
          </Text>
          <Text style={[styles.emptyStateSubtext, isDesktop && { fontSize: scale(16) }]}>
            Choose a recyclable type above to get started
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  desktopGridItem: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  weekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weekBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  itemsGrid: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemType: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  itemWeight: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  itemDate: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});