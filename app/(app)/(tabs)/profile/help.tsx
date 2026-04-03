import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MessageCircle, FileText, ChevronRight, HelpCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

export default function HelpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
              <HelpCircle size={20} color={Colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>How do I log items?</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
              <HelpCircle size={20} color={Colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>What can I recycle?</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
              <HelpCircle size={20} color={Colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>How to become a collector?</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <View style={[styles.iconWrapper, { backgroundColor: '#DCFCE7' }]}>
              <MessageCircle size={20} color="#22C55E" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Live Chat</Text>
              <Text style={styles.rowSubtitle}>Talk to our support team</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FEF3C7' }]}>
              <FileText size={20} color="#F59E0B" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Terms of Service</Text>
              <Text style={styles.rowSubtitle}>Read our policies</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.placeholderBanner}>
          <Text style={styles.placeholderText}>Help desk will be fully online soon.</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
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
