const palette = {
  primary: '#2D9B5E',
  primaryDark: '#1E7A45',
  primaryLight: '#4AB876',
  secondary: '#F5A623',
  secondaryLight: '#FFD280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
};

export const light = {
  ...palette,
  background: '#F8FAF9',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0F5F2',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  cardGradient: ['#FFFFFF', '#F9FAFB'] as [string, string],
  headerGradient: ['#059669', '#047857', '#065F46'] as [string, string, string],
};

export const dark = {
  ...palette,
  background: '#121212',
  surface: '#1E1E1E',
  surfaceSecondary: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textLight: '#707070',
  border: '#333333',
  borderLight: '#262626',
  overlay: 'rgba(0, 0, 0, 0.7)',
  cardGradient: ['#1E1E1E', '#252525'] as [string, string],
  headerGradient: ['#065F46', '#064E3B', '#022C22'] as [string, string, string],
};

export default light; // Backward compatibility
