import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus } from 'lucide-react-native';
import type { LoggedItem, Collection } from '@/types/database';

interface ItemWithType extends LoggedItem {
  recyclable_types: { name: string } | null;
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weeklyItems, setWeeklyItems] = useState<ItemWithType[]>([]);
  const [upcomingCollections, setUpcomingCollections] = useState<Collection[]>([]);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);

  useEffect(() => {
    loadData();
  }, [profile?.id]);

  const loadData = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      if (!profile.is_collector) {
        const { data: items } = await supabase
          .from('logged_items')
          .select('*, recyclable_types(name)')
          .eq('household_id', profile.id)
          .eq('collected', false)
          .order('logged_at', { ascending: false });

        setWeeklyItems(items || []);

        const earnings = (items || []).reduce((total, item) => {
          return total + ((item.estimated_weight_kg || 0) * 2.5);
        }, 0);
        setEstimatedEarnings(earnings);
      } else {
        const { data: collections } = await supabase
          .from('collections')
          .select('*')
          .eq('collector_id', profile.id)
          .eq('status', 'scheduled')
          .order('scheduled_date', { ascending: true });

        setUpcomingCollections(collections || []);

        const earnings = (collections || []).reduce((total, collection) => {
          return total + (collection.estimated_earnings || 0);
        }, 0);
        setEstimatedEarnings(earnings);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello</Text>
          <Text style={styles.name}>{profile?.full_name}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Weekly Earnings</Text>
        <View style={styles.earningsContainer}>
          <Text style={styles.earnings}>R{estimatedEarnings.toFixed(2)}</Text>
          <Text style={styles.earningsSubtext}>Estimated</Text>
        </View>
      </View>

      {!profile?.is_collector && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Items</Text>
            <TouchableOpacity>
              <Plus size={24} color="#059669" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#059669" size="large" />
          ) : weeklyItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No items logged yet</Text>
              <Text style={styles.emptyStateSubtext}>Start by adding your recyclables</Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {weeklyItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.recyclable_types?.name}</Text>
                    <Text style={styles.itemQuantity}>{item.quantity} items · {item.estimated_weight_kg} kg</Text>
                  </View>
                  <Text style={styles.itemValue}>R{(item.estimated_weight_kg || 0 * 2.5).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {profile?.is_collector && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Collections</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#059669" size="large" />
          ) : upcomingCollections.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No collections scheduled</Text>
              <Text style={styles.emptyStateSubtext}>Plan your next collection week</Text>
            </View>
          ) : (
            <View style={styles.collectionsList}>
              {upcomingCollections.map((collection) => (
                <View key={collection.id} style={styles.collectionCard}>
                  <View style={styles.collectionInfo}>
                    <Text style={styles.collectionDate}>
                      {new Date(collection.scheduled_date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.collectionStatus}>{collection.status}</Text>
                  </View>
                  <Text style={styles.collectionEarnings}>
                    R{collection.estimated_earnings.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {!profile?.collector_approved && profile?.is_collector && (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Collector Application</Text>
          <Text style={styles.noticeText}>Your application is being reviewed</Text>
        </View>
      )}
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
    marginBottom: 32,
    marginTop: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 12,
  },
  earningsContainer: {
    gap: 4,
  },
  earnings: {
    fontSize: 36,
    fontWeight: '700',
    color: '#059669',
  },
  earningsSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
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
    marginBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  collectionsList: {
    gap: 12,
    marginBottom: 24,
  },
  collectionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  collectionStatus: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  collectionEarnings: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  noticeCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  noticeText: {
    fontSize: 13,
    color: '#b45309',
    marginTop: 4,
  },
});
