import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface RecentActivityProps {
  items: any[];
  recentLogs: any[];
  getIcon: (type: string) => string;
  getLabel: (type: string) => string;
  getColor: (type: string) => string;
  formatDate: (date: string) => string;
  isDesktop?: boolean;
  scale?: (size: number) => number;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  items,
  recentLogs,
  getIcon,
  getLabel,
  getColor,
  formatDate,
  isDesktop = false,
  scale = (size) => size
}) => {
  return (
    <View style={[
      styles.section,
      isDesktop && styles.desktopGridItem
    ]}>
      <Text style={[styles.sectionTitle, isDesktop && { fontSize: scale(24), marginBottom: scale(24) }]}>
        Recent Activity
      </Text>
      
      {recentLogs.length > 0 ? (
        recentLogs.slice(0, isDesktop ? 6 : 4).map((item) => {
          const weight = item.unit === 'kg' ? item.quantity : item.quantity * 0.05;
          
          return (
            <View key={item.id} style={[
              styles.recentItem,
              isDesktop && { padding: scale(16), marginBottom: scale(12), borderRadius: scale(14) }
            ]}>
              <View style={[
                styles.recentItemIcon,
                { 
                  backgroundColor: getColor(item.type) + '15',
                  width: isDesktop ? scale(48) : 40,
                  height: isDesktop ? scale(48) : 40,
                  borderRadius: isDesktop ? scale(12) : 10,
                }
              ]}>
                <Text style={isDesktop && { fontSize: scale(20) }}>
                  {getIcon(item.type)}
                </Text>
              </View>
              <View style={styles.recentItemInfo}>
                <Text style={[
                  styles.recentItemType,
                  isDesktop && { fontSize: scale(16) }
                ]}>
                  {item.item_name || getLabel(item.type)}
                </Text>
                <Text style={[
                  styles.recentItemDate,
                  isDesktop && { fontSize: scale(14) }
                ]}>
                  {formatDate(item.created_at)} • {weight.toFixed(1)}kg
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </View>
          );
        })
      ) : (
        <View style={[
          styles.emptyStateSmall,
          isDesktop && { padding: scale(40), borderRadius: scale(16) }
        ]}>
          <Text style={[styles.emptyStateTextSmall, isDesktop && { fontSize: scale(16) }]}>
            No activity yet
          </Text>
          <Text style={[styles.emptyStateSubtextSmall, isDesktop && { fontSize: scale(14) }]}>
            Your recent logs will appear here
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  recentItemIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentItemInfo: {
    flex: 1,
  },
  recentItemType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  recentItemDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyStateSmall: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  emptyStateTextSmall: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyStateSubtextSmall: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});