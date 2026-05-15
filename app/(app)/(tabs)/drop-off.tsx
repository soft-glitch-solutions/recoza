import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { MapPin, Phone, Clock, Navigation, Search, Globe, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/home/Header';

interface DropOffSpot {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  website: string;
  distance?: string;
  types: string[];
}

const MOCK_SPOTS: DropOffSpot[] = [
  {
    id: '1',
    name: 'GreenLife Recycling Center',
    address: '123 Sustainability Ave, Johannesburg',
    phone: '+27 11 123 4567',
    hours: 'Mon-Fri: 08:00 - 17:00',
    website: 'https://greenlife.co.za',
    distance: '2.5 km',
    types: ['Plastic', 'Paper', 'Glass', 'Metal'],
  },
  {
    id: '2',
    name: 'EcoHub Collection Point',
    address: '45 Earth Street, Sandton',
    phone: '+27 11 987 6543',
    hours: 'Mon-Sat: 09:00 - 18:00',
    website: 'https://ecohub.org.za',
    distance: '4.8 km',
    types: ['Cardboard', 'Electronics', 'Plastic'],
  },
  {
    id: '3',
    name: 'Johannesburg Municipal Recycling',
    address: '88 Public Road, JHB Central',
    phone: '+27 11 555 0199',
    hours: '24/7 (Drop-off bins)',
    website: 'https://joburg.org.za/recycling',
    distance: '7.2 km',
    types: ['Glass', 'Metal', 'Paper'],
  },
];

export default function DropOffScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpots = MOCK_SPOTS.filter(spot => 
    spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGetDirections = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={[styles.title, { color: colors.text }]}>Drop-off Spots</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Find the nearest location to exchange your collected items.
          </Text>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search locations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          {filteredSpots.map((spot) => (
            <View key={spot.id} style={[styles.spotCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.spotHeader}>
                <View style={styles.spotTitleRow}>
                  <Text style={[styles.spotName, { color: colors.text }]}>{spot.name}</Text>
                  {spot.distance && (
                    <View style={[styles.distanceBadge, { backgroundColor: colors.accent + '20' }]}>
                      <Text style={[styles.distanceText, { color: colors.primary }]}>{spot.distance}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.addressRow}>
                  <MapPin size={16} color={colors.textSecondary} />
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>{spot.address}</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Clock size={16} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.text }]}>{spot.hours}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Phone size={16} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.text }]}>{spot.phone}</Text>
                </View>
              </View>

              <View style={styles.typesContainer}>
                {spot.types.map((type, index) => (
                  <View key={index} style={[styles.typeBadge, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.typeText, { color: colors.textSecondary }]}>{type}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleGetDirections(spot.address)}
                >
                  <Navigation size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.secondaryButton, { borderColor: colors.border }]}
                  onPress={() => Linking.openURL(spot.website)}
                >
                  <Globe size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredSpots.length === 0 && (
            <View style={styles.emptyState}>
              <Info size={48} color={colors.textLight} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No locations found matching your search.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    lineHeight: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  spotCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  spotHeader: {
    marginBottom: 16,
  },
  spotTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  spotName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  distanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressText: {
    fontSize: 14,
    flex: 1,
  },
  infoGrid: {
    gap: 12,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
