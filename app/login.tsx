import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Recycle, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const isVerySmallScreen = height < 600;
const isTinyScreen = height < 500;
const isTablet = width >= 768;
const isDesktop = width >= 1024;

// Conservative scaling for desktop
const scale = (size: number) => {
  if (isDesktop) {
    return Math.min(size * (width / 375), size * 1.1);
  }
  
  const baseWidth = 375;
  let scaleFactor = 1;
  
  if (isTinyScreen) scaleFactor = 0.8;
  else if (isVerySmallScreen) scaleFactor = 0.9;
  else if (isSmallScreen) scaleFactor = 1;
  else if (isTablet) scaleFactor = 1.1;
  
  return (width / baseWidth) * size * scaleFactor;
};

const verticalScale = (size: number) => {
  if (isDesktop) {
    return Math.min(size * (height / 667), size * 1.1);
  }
  
  const baseHeight = 667;
  let scaleFactor = 1;
  
  if (isTinyScreen) scaleFactor = 0.7;
  else if (isVerySmallScreen) scaleFactor = 0.8;
  else if (isSmallScreen) scaleFactor = 0.9;
  else if (isTablet) scaleFactor = 1;
  
  return (height / baseHeight) * size * scaleFactor;
};

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, setOnboardingComplete } = useAuth();
  const { colors, isDark } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Desktop layout configuration
  const getLayoutConfig = () => {
    if (isDesktop) {
      return {
        maxContentWidth: 1000,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
        leftWidth: '45%',
        rightWidth: '45%',
        paddingHorizontal: 48,
        textAlign: 'left' as const,
      };
    }
    return {
      maxContentWidth: '100%',
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      leftWidth: '100%',
      rightWidth: '100%',
      paddingHorizontal: 24,
      textAlign: 'center' as const,
    };
  };

  const layoutConfig = getLayoutConfig();

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Email is required');
      return;
    }
    if (!password) {
      setErrorMessage('Password is required');
      return;
    }
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.success) {
        if (setOnboardingComplete) {
          await setOnboardingComplete(true);
        }
        router.replace('/(tabs)/(home)' as any);
      } else {
        setErrorMessage(result.error || 'Invalid email or password');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            maxWidth: layoutConfig.maxContentWidth as any,
            paddingTop: insets.top + (isDesktop ? 40 : 20),
            paddingBottom: insets.bottom + (isDesktop ? 40 : 20),
            paddingHorizontal: layoutConfig.paddingHorizontal,
          }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[
          styles.rowContainer,
          {
            flexDirection: layoutConfig.flexDirection,
            alignItems: layoutConfig.alignItems,
            justifyContent: layoutConfig.justifyContent,
            gap: isDesktop ? 60 : 0,
          }
        ]}>
          <View style={[styles.leftColumn, { width: layoutConfig.leftWidth as any }]}>
            <View style={styles.logoWrapper}>
              <View style={[
                styles.logoContainer,
                {
                  width: isDesktop ? 160 : scale(120),
                  height: isDesktop ? 160 : scale(120),
                  borderRadius: isDesktop ? 80 : scale(60),
                }
              ]}>
                <Recycle size={isDesktop ? 80 : scale(60)} color="#fff" />
              </View>
            </View>
            
            <View style={styles.brandContainer}>
              <Text style={[
                styles.brandName,
                { fontSize: isDesktop ? 48 : scale(42), textAlign: layoutConfig.textAlign }
              ]}>
                Recoza
              </Text>
              <View style={[
                styles.taglineContainer,
                { justifyContent: layoutConfig.textAlign === 'left' ? 'flex-start' : 'center' }
              ]}>
                <Text style={[styles.taglineText, styles.recycleText]}>Recycle.</Text>
                <Text style={[styles.taglineText, styles.earnText]}> Earn.</Text>
                <Text style={[styles.taglineText, styles.sustainText]}> Sustain.</Text>
              </View>
              <Text style={[
                styles.description,
                { fontSize: isDesktop ? 16 : scale(15), textAlign: layoutConfig.textAlign }
              ]}>
                Join South Africa's community-powered recycling movement. 
                Turn waste into income while helping the environment.
              </Text>
            </View>
          </View>

          <View style={[styles.rightColumn, { width: layoutConfig.rightWidth as any }]}>
            <View style={[
              styles.formCard,
              {
                backgroundColor: colors.surface,
                padding: isDesktop ? 40 : scale(24),
              }
            ]}>
              <Text style={[styles.formTitle, { fontSize: isDesktop ? 28 : scale(26), color: colors.text }]}>
                Welcome Back
              </Text>
              <Text style={[styles.formSubtitle, { fontSize: isDesktop ? 15 : scale(15), color: colors.textSecondary }]}>
                Sign in to continue recycling
              </Text>

              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <View style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.borderLight,
                  height: isDesktop ? 52 : scale(50),
                  paddingHorizontal: isDesktop ? 16 : scale(16),
                  marginBottom: isDesktop ? 16 : scale(14),
                }
              ]}>
                <Mail size={isDesktop ? 18 : 20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { fontSize: isDesktop ? 15 : scale(15), color: colors.text }]}
                  placeholder="Email address"
                  placeholderTextColor={colors.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>

              <View style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.borderLight,
                  height: isDesktop ? 52 : scale(50),
                  paddingHorizontal: isDesktop ? 16 : scale(16),
                  marginBottom: isDesktop ? 16 : scale(14),
                }
              ]}>
                <Lock size={isDesktop ? 18 : 20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { fontSize: isDesktop ? 15 : scale(15), color: colors.text }]}
                  placeholder="Password"
                  placeholderTextColor={colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  autoComplete="password"
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} disabled={isLoading}>
                  {passwordVisible ? (
                    <EyeOff size={isDesktop ? 18 : 20} color={colors.textLight} />
                  ) : (
                    <Eye size={isDesktop ? 18 : 20} color={colors.textLight} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={() => console.log('Forgot password pressed')}
                disabled={isLoading}
              >
                <Text style={[styles.forgotPasswordText, { fontSize: isDesktop ? 14 : scale(14), color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  {
                    backgroundColor: colors.primary,
                    height: isDesktop ? 52 : scale(50),
                    borderRadius: isDesktop ? 26 : scale(25),
                    marginBottom: isDesktop ? 20 : scale(16),
                  },
                  isLoading && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={[styles.loginButtonText, { fontSize: isDesktop ? 16 : scale(16) }]}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
                <Text style={[styles.dividerText, { fontSize: isDesktop ? 14 : scale(14), color: colors.textSecondary }]}>
                  or
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
              </View>

              <View style={styles.signupContainer}>
                <Text style={[styles.signupText, { fontSize: isDesktop ? 15 : scale(15), color: colors.textSecondary }]}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/register')} disabled={isLoading}>
                  <Text style={[styles.signupLink, { fontSize: isDesktop ? 15 : scale(15), color: colors.primary }]}>
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { fontSize: isDesktop ? 12 : scale(12) }]}>
            Developed by Recoza
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { alignSelf: 'center', width: '100%', justifyContent: 'center', minHeight: '100%' },
  rowContainer: { width: '100%' },
  leftColumn: { alignItems: 'center' },
  rightColumn: { alignItems: 'center' },
  logoWrapper: { marginBottom: isDesktop ? 24 : verticalScale(20) },
  logoContainer: { backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center' },
  brandContainer: { marginBottom: isDesktop ? 0 : verticalScale(30) },
  brandName: { fontWeight: '700', color: '#ffffff', marginBottom: 8, letterSpacing: -0.5 },
  taglineContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: isDesktop ? 16 : scale(12) },
  taglineText: { fontSize: isDesktop ? 22 : scale(20), fontWeight: '600' },
  recycleText: { color: '#ffffff' },
  earnText: { color: '#FFD700' },
  sustainText: { color: '#98FB98' },
  description: { color: 'rgba(255, 255, 255, 0.9)', lineHeight: isDesktop ? 24 : scale(22), maxWidth: isDesktop ? 400 : '100%' },
  formCard: { borderRadius: isDesktop ? 24 : scale(20), width: '100%', maxWidth: isDesktop ? 450 : '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  formTitle: { fontWeight: '700', marginBottom: 6 },
  formSubtitle: { marginBottom: isDesktop ? 24 : scale(20) },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: isDesktop ? 12 : scale(12), borderWidth: 1, gap: isDesktop ? 10 : scale(10) },
  inputIcon: { opacity: 0.7 },
  input: { flex: 1, padding: 0 },
  forgotPasswordButton: { alignSelf: 'flex-end', marginBottom: isDesktop ? 24 : scale(20) },
  forgotPasswordText: { fontWeight: '500' },
  loginButton: { justifyContent: 'center', alignItems: 'center' },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { fontWeight: '600', color: '#ffffff' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: isDesktop ? 20 : scale(16) },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: isDesktop ? 12 : scale(12) },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: {},
  signupLink: { fontWeight: '600' },
  errorContainer: { backgroundColor: '#FFEBEE', padding: 12, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#F44336' },
  errorText: { color: '#D32F2F' },
  footer: { marginTop: isDesktop ? 40 : verticalScale(30), alignItems: 'center' },
  footerText: { color: 'rgba(255, 255, 255, 0.6)' },
});