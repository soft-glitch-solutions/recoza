import React, { createContext, useContext, useState, useCallback } from 'react';
import { FeedbackModal, FeedbackType } from '@/components/FeedbackModal';

interface FeedbackContextType {
  showAlert: (config: {
    type: FeedbackType;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
    cancelText?: string;
  }) => void;
  hideAlert: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<{
    type: FeedbackType;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
    cancelText?: string;
  } | null>(null);

  const showAlert = useCallback((newConfig: any) => {
    setConfig(newConfig);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (config?.onConfirm) {
      config.onConfirm();
    }
    hideAlert();
  }, [config, hideAlert]);

  return (
    <FeedbackContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {config && (
        <FeedbackModal
          visible={visible}
          type={config.type}
          title={config.title}
          message={config.message}
          confirmText={config.confirmText}
          cancelText={config.cancelText}
          onClose={hideAlert}
          onConfirm={handleConfirm}
        />
      )}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
