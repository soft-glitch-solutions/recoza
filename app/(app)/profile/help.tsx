import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  HelpCircle, 
  Mail, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  FileText,
  AlertCircle
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const faqs = [
  {
    question: 'How do I become a collector?',
    answer: 'Go to your profile and tap on "Become a Collector". Fill out the application form and wait for approval (usually 24-48 hours).',
  },
  {
    question: 'How do I log recyclable items?',
    answer: 'On the home screen, tap on the recyclable type you want to log (plastic, paper, etc.). Enter the quantity and confirm.',
  },
  {
    question: 'When do I get paid as a collector?',
    answer: 'Payouts are processed weekly on Fridays for all completed collections from the previous week.',
  },
  {
    question: 'How do I connect with households?',
    answer: 'Share your unique invite code with neighbors. They can enter it during signup to connect with you as their collector.',
  },
  {
    question: 'What items can be recycled?',
    answer: 'We accept plastic bottles, glass bottles, metal cans, paper, cardboard, and magazines. Make sure items are clean and dry.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleContactSupport = () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    Alert.alert('Message Sent', 'Our support team will get back to you within 24 hours');
    setMessage('');
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => 
      Alert.alert('Error', 'Could not open link')
    );
  };

  const supportOptions = [
    {
      icon: <Mail size={24} color="#3B82F6" />,
      title: 'Email Support',
      description: 'support@recoza.co.za',
      onPress: () => Linking.openURL('mailto:support@recoza.co.za'),
      color: '#3B82F6',
      bg: '#DBEAFE',
    },
    {
      icon: <MessageCircle size={24} color="#10B981" />,
      title: 'WhatsApp',
      description: '+27 12 345 6789',
      onPress: () => Linking.openURL('https://wa.me/27123456789'),
      color: '#10B981',
      bg: '#D1FAE5',
    },
    {
      icon: <FileText size={24} color="#8B5CF6" />,
      title: 'Terms of Service',
      description: 'Read our terms',
      onPress: () => handleOpenLink('https://recoza.co.za/terms'),
      color: '#8B5CF6',
      bg: '#EDE9FE',
    },
    {
      icon: <AlertCircle size={24} color="#F59E0B" />,
      title: 'Report an Issue',
      description: 'Technical support',
      onPress: () => Alert.alert('Report Issue', 'Please describe your issue in the message box below'),
      color: '#F59E0B',
      bg: '#FEF3C7',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Support Options */}
        <Text style={styles.sectionTitle}>Get in Touch</Text>
        <View style={styles.supportGrid}>
          {supportOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.supportCard}
              onPress={option.onPress}
            >
              <LinearGradient
                colors={[option.bg, option.bg]}
                style={styles.supportIcon}
              >
                {option.icon}
              </LinearGradient>
              <Text style={styles.supportTitle}>{option.title}</Text>
              <Text style={styles.supportDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.formCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TextInput
              style={styles.messageInput}
              placeholder="How can we help you today?"
              placeholderTextColor={Colors.textLight}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleContactSupport}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.sendButtonGradient}
              >
                <Text style={styles.sendButtonText}>Send Message</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <LinearGradient
              key={index}
              colors={['#FFFFFF', '#F9FAFB']}
              style={styles.faqCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFaq(index)}
              >
                <HelpCircle size={20} color={Colors.primary} />
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                {expandedFaq === index ? (
                  <ChevronUp size={20} color={Colors.textSecondary} />
                ) : (
                  <ChevronDown size={20} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
              {expandedFaq === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </LinearGradient>
          ))}
        </View>

        {/* Emergency Support */}
        <LinearGradient
          colors={['#FEE2E2', '#FEF2F2']}
          style={styles.emergencyCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.emergencyTitle}>🚨 Emergency Support</Text>
          <Text style={styles.emergencyText}>
            If you're experiencing a critical issue, please call us immediately:
          </Text>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:+27123456789')}
          >
            <Text style={styles.emergencyButtonText}>Call +27 12 345 6789</Text>
          </TouchableOpacity>
        </LinearGradient>

        <Text style={styles.versionText}>Recoza v1.0.0 • support@recoza.co.za</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  supportCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  supportIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  messageInput: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  faqSection: {
    marginBottom: 24,
  },
  faqCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    marginLeft: 32,
    lineHeight: 20,
  },
  emergencyCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});