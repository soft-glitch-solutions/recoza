const palette = {
  primary: '#327331',      // Dark Green
  lime: '#c8d643',         // Lime/Yellow-Green
  orange: '#d6772e',       // Orange
  blue: '#3293ca',         // Blue
  success: '#327331',
  warning: '#d6772e',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#111827',
};

export const light = {
  ...palette,
  primary: '#327331',
  primaryDark: '#265425',
  primaryLight: '#c8d643',
  secondary: '#d6772e',
  accent: '#c8d643',
  info: '#3293ca',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',
  text: '#111827',
  textSecondary: '#4B5563',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  overlay: 'rgba(0, 0, 0, 0.4)',
  cardGradient: ['#FFFFFF', '#FFFFFF'] as [string, string],
  headerGradient: ['#327331', '#327331', '#327331'] as [string, string, string],
};

export const dark = light; // Disable dark mode values

export default light;
