import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, BellRing, Smartphone, Mail } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useState } from 'react';

export default function NotificationsScreen() {
  const router = useRouter();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
              <Smartphone size={20} color={Colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Push Notifications</Text>
              <Text style={styles.rowSubtitle}>Receive alerts on your device</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={pushEnabled ? Colors.primary : '#F3F4F6'}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FEF3C7' }]}>
              <Mail size={20} color="#F59E0B" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Email Newsletter</Text>
              <Text style={styles.rowSubtitle}>Weekly impact summaries</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#D1D5DB', true: '#FDE68A' }}
              thumbColor={emailEnabled ? '#F59E0B' : '#F3F4F6'}
            />
          </View>
          
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={[styles.iconWrapper, { backgroundColor: '#DCFCE7' }]}>
              <BellRing size={20} color="#22C55E" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Recycling Reminders</Text>
              <Text style={styles.rowSubtitle}>Don't forget collection day</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
              thumbColor={remindersEnabled ? '#22C55E' : '#F3F4F6'}
            />
          </View>
        </View>

        <View style={styles.placeholderBanner}>
          <Text style={styles.placeholderText}>Notification preferences will be fully synced soon.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  placeholderBanner: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  placeholderText: {
    color: '#D97706',
    textAlign: 'center',
    fontWeight: '500',
  },
});
