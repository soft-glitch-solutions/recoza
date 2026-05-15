import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { 
  ArrowLeft, 
  MessageCircle, 
  Mail, 
  Phone, 
  HelpCircle, 
  ChevronRight, 
  FileText,
  LifeBuoy,
  Send
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

export default function SupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handleContact = (type: 'email' | 'call' | 'chat') => {
    if (type === 'email') Linking.openURL('mailto:support@recoza.co.za');
    if (type === 'call') Linking.openURL('tel:+27110000000');
    if (type === 'chat') router.push('/(chat)' as any);
  };

  const FAQItem = ({ question }: { question: string }) => (
    <TouchableOpacity style={[styles.faqItem, { borderColor: colors.borderLight }]}>
      <Text style={[styles.faqText, { color: colors.text }]}>{question}</Text>
      <ChevronRight size={18} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primary + '15' }]}>
            <LifeBuoy size={40} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>How can we help?</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Our team is here to assist you with any questions or issues you may have.
          </Text>
        </View>

        <View style={styles.contactGrid}>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.surface }]} onPress={() => handleContact('chat')}>
            <View style={[styles.contactIcon, { backgroundColor: colors.primary }]}>
              <MessageCircle size={22} color="#fff" />
            </View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Live Chat</Text>
            <Text style={[styles.contactSub, { color: colors.textSecondary }]}>Instant Response</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.surface }]} onPress={() => handleContact('email')}>
            <View style={[styles.contactIcon, { backgroundColor: colors.secondary }]}>
              <Mail size={22} color="#fff" />
            </View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Email Us</Text>
            <Text style={[styles.contactSub, { color: colors.textSecondary }]}>Within 24h</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>FREQUENTLY ASKED QUESTIONS</Text>
          <View style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <FAQItem question="How do I schedule a collection?" />
            <FAQItem question="What items can I recycle?" />
            <FAQItem question="How are rewards calculated?" />
            <FAQItem question="How do I become a collector?" />
            <FAQItem question="Where are the drop-off points?" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SEND A MESSAGE</Text>
          <View style={[styles.messageCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <TextInput 
              placeholder="Tell us what's happening..." 
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              style={[styles.messageInput, { color: colors.text }]}
            />
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.sendButtonText}>Send Message</Text>
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.policyLink}>
          <FileText size={18} color={colors.textSecondary} />
          <Text style={[styles.policyText, { color: colors.textSecondary }]}>View Help Center & Policies</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSection: {
    alignItems: 'center',
    padding: 32,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  contactGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  contactCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  contactSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
    paddingLeft: 4,
  },
  faqCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
  },
  faqText: {
    fontSize: 15,
    fontWeight: '600',
  },
  messageCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  messageInput: {
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 100,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 16,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
  },
  policyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
