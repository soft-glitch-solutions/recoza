import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';

interface UpcomingCollectionsProps {
  collections: any[];
  isDesktop?: boolean;
  scale?: (size: number) => number;
}

export const UpcomingCollections: React.FC<UpcomingCollectionsProps> = ({
  collections,
  isDesktop = false,
  scale = (size) => size
}) => {
  const router = useRouter();

  if (!collections.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isDesktop && { fontSize: scale(24) }]}>
          Upcoming Collections
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/collections')}>
          <Text style={[styles.seeAllText, isDesktop && { fontSize: scale(16) }]}>
            View all
          </Text>
        </TouchableOpacity>
      </View>

      {collections.map((collection) => (
        <View key={collection.id} style={[
          styles.collectionCard,
          isDesktop && { padding: scale(20), marginBottom: scale(12), borderRadius: scale(16) }
        ]}>
          <View style={styles.collectionHeader}>
            <View style={styles.collectionInfo}>
              <Text style={[styles.collectionDate, isDesktop && { fontSize: scale(16) }]}>
                <Calendar size={14} color={Colors.primary} /> {new Date(collection.scheduled_date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
              </Text>
            </View>
            <View style={[styles.collectionBadge, { backgroundColor: Colors.warning + '20' }]}>
              <Clock size={14} color={Colors.warning} />
              <Text style={[styles.collectionStatus, { color: Colors.warning }]}>Scheduled</Text>
            </View>
          </View>
          <Text style={[styles.collectionHousehold, isDesktop && { fontSize: scale(18) }]}>
            {collection.household?.full_name || 'Household'}
          </Text>
          <Text style={[styles.collectionEstimate, isDesktop && { fontSize: scale(14) }]}>
            Est. {collection.total_weight_kg?.toFixed(1)}kg
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
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
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  collectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  collectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  collectionStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  collectionHousehold: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  collectionEstimate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});