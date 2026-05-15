import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { CheckCircle2, AlertCircle, Info, X, HelpCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type FeedbackType = 'success' | 'error' | 'info' | 'confirm';

interface FeedbackModalProps {
  visible: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel'
}) => {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={48} color="#10B981" />;
      case 'error': return <AlertCircle size={48} color="#EF4444" />;
      case 'confirm': return <HelpCircle size={48} color="#3B82F6" />;
      default: return <Info size={48} color="#3B82F6" />;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      default: return colors.primary;
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.surface, borderColor: '#000000' }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={20} color={colors.textLight} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            {getIcon()}
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <View style={styles.actions}>
            {type === 'confirm' && (
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton, { borderColor: '#000000' }]} 
                onPress={onClose}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.button, 
                { backgroundColor: getAccentColor(), borderColor: '#000000' },
                type === 'confirm' ? { flex: 1 } : { width: '100%' }
              ]} 
              onPress={onConfirm || onClose}
            >
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 32,
    borderWidth: 3,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  iconContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
