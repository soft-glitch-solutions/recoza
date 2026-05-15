import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, Alert } from 'react-native';
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  FileText,
  LifeBuoy,
  Send,
  ExternalLink
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useFeedback } from '@/contexts/FeedbackContext';

const FAQ_DATA = [
  {
    question: 'How do I schedule a collection?',
    answer: 'Go to the Collections tab, find your linked collector in "My Network", and tap the calendar icon to schedule a pickup day. Your collector will see the appointment and confirm.'
  },
  {
    question: 'What items can I recycle?',
    answer: 'Recoza supports glass, plastic (PET, HDPE), paper, cardboard, cans (aluminium & steel), e-waste, and organic materials. Tap "Log Items" on the home screen to see all supported categories.'
  },
  {
    question: 'How are rewards calculated?',
    answer: 'Rewards are based on the weight and type of recyclables collected. Collectors set their own rates per kg. You can see estimated earnings before confirming a collection.'
  },
  {
    question: 'How do I become a collector?',
    answer: 'Go to the Collections tab and tap "Become a Collector". Fill in your motivation and service area. Our team will review your application within 3–5 business days.'
  },
  {
    question: 'Where are the drop-off points?',
    answer: 'Open the Drop-off tab on the navigation bar to see a map of all nearby drop-off points. You can filter by material type and get directions directly from the app.'
  },
  {
    question: 'How do I link with a collector?',
    answer: 'Ask your collector to share their invite code. Go to the Home screen, enter the code in the "Link a Collector" section, and tap the arrow to connect.'
  },
  {
    question: 'Is my personal data safe?',
    answer: 'Yes. Recoza uses Supabase with row-level security ensuring only you can access your data. We never sell personal information. Read our full Privacy Policy at recoza.co.za/privacy.'
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showAlert } = useFeedback();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const handleContact = (type: 'email' | 'whatsapp') => {
    if (type === 'email') Linking.openURL('mailto:support@recoza.co.za?subject=Recoza App Support');
    if (type === 'whatsapp') Linking.openURL('https://wa.me/27110000000?text=Hi Recoza support, I need help with...');
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      showAlert({ type: 'error', title: 'Empty Message', message: 'Please type your message before sending.' });
      return;
    }
    Linking.openURL(`mailto:support@recoza.co.za?subject=Recoza App Support&body=${encodeURIComponent(message)}`);
    setMessage('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primary + '15' }]}>
            <LifeBuoy size={40} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>How can we help?</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Browse our FAQs or get in touch with the Recoza team.
          </Text>
        </View>

        {/* Contact options */}
        <View style={styles.contactGrid}>
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: colors.surface }]}
            onPress={() => handleContact('whatsapp')}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#25D366' }]}>
              <MessageCircle size={22} color="#fff" />
            </View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>WhatsApp</Text>
            <Text style={[styles.contactSub, { color: colors.textSecondary }]}>Instant Response</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: colors.surface }]}
            onPress={() => handleContact('email')}
          >
            <View style={[styles.contactIcon, { backgroundColor: colors.secondary }]}>
              <Mail size={22} color="#fff" />
            </View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Email Us</Text>
            <Text style={[styles.contactSub, { color: colors.textSecondary }]}>Within 24h</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>FREQUENTLY ASKED QUESTIONS</Text>
          <View style={[styles.faqCard, { backgroundColor: colors.surface }]}>
            {FAQ_DATA.map((item, index) => (
              <View key={index}>
                <TouchableOpacity
                  style={[
                    styles.faqItem,
                    index < FAQ_DATA.length - 1 && { borderBottomWidth: 3, borderBottomColor: '#000000' },
                    openFaq === index && { backgroundColor: colors.surfaceSecondary }
                  ]}
                  onPress={() => setOpenFaq(openFaq === index ? null : index)}
                  activeOpacity={0.7}
                >
                  <HelpCircle size={16} color={colors.primary} style={{ marginRight: 12 }} />
                  <Text style={[styles.faqQuestion, { color: colors.text, flex: 1 }]}>{item.question}</Text>
                  {openFaq === index
                    ? <ChevronDown size={18} color={colors.primary} />
                    : <ChevronRight size={18} color={colors.textLight} />
                  }
                </TouchableOpacity>
                {openFaq === index && (
                  <View style={[styles.faqAnswer, { backgroundColor: colors.accent + '20' }]}>
                    <Text style={[styles.faqAnswerText, { color: colors.text }]}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Send a message */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SEND A MESSAGE</Text>
          <View style={[styles.messageCard, { backgroundColor: colors.surface }]}>
            <TextInput
              placeholder="Tell us what's happening..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              style={[styles.messageInput, { color: colors.text, borderColor: colors.borderLight }]}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={handleSendMessage}
            >
              <Text style={styles.sendButtonText}>Send Message</Text>
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>POLICIES & HELP CENTER</Text>
          <View style={[styles.faqCard, { backgroundColor: colors.surface }]}>
            {[
              { label: 'Privacy Policy', url: 'https://recoza.co.za/privacy' },
              { label: 'Terms of Service', url: 'https://recoza.co.za/terms' },
              { label: 'Help Center', url: 'https://recoza.co.za/help' },
            ].map((link, i, arr) => (
              <TouchableOpacity
                key={link.url}
                style={[
                  styles.faqItem,
                  i < arr.length - 1 && { borderBottomWidth: 3, borderBottomColor: '#000000' }
                ]}
                onPress={() => Linking.openURL(link.url)}
              >
                <FileText size={16} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <Text style={[styles.faqQuestion, { color: colors.text, flex: 1 }]}>{link.label}</Text>
                <ExternalLink size={16} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
    borderWidth: 3,
    borderColor: '#000000',
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
    borderWidth: 3,
    borderColor: '#000000',
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
    borderWidth: 3,
    borderColor: '#000000',
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000000',
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
    borderWidth: 3,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
  },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  messageCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#000000',
  },
  messageInput: {
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 100,
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#000000',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
