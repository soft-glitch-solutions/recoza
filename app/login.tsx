import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Recycle, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const isVerySmallScreen = height < 600;
const isTinyScreen = height < 500;
const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isLargeDesktop = width >= 1440;

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
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Desktop layout configuration - exactly like Uthutho
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
    // Clear any previous errors
    setErrorMessage(null);
    
    // Validate inputs
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
      // Call signIn from AuthContext
      const result = await signIn(email, password);
      
      // Check if login was successful
      if (result.success) {
        // Mark onboarding as complete
        if (setOnboardingComplete) {
          await setOnboardingComplete(true);
        }
        // Navigate to home screen
        router.replace('/(tabs)/(home)');
      } else {
        // Display error message
        setErrorMessage(result.error || 'Invalid email or password');
      }
    } catch (error) {
      // Handle unexpected errors
      setErrorMessage('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            maxWidth: layoutConfig.maxContentWidth,
            paddingTop: insets.top + (isDesktop ? 40 : 20),
            paddingBottom: insets.bottom + (isDesktop ? 40 : 20),
            paddingHorizontal: layoutConfig.paddingHorizontal,
          }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Desktop Row Layout */}
        <View style={[
          styles.rowContainer,
          {
            flexDirection: layoutConfig.flexDirection,
            alignItems: layoutConfig.alignItems,
            justifyContent: layoutConfig.justifyContent,
            gap: isDesktop ? 60 : 0,
          }
        ]}>
          {/* Left Side - Branding */}
          <View style={[styles.leftColumn, { width: layoutConfig.leftWidth }]}>
            <View style={styles.logoWrapper}>
              <View style={[
                styles.logoContainer,
                {
                  width: isDesktop ? 160 : scale(120),
                  height: isDesktop ? 160 : scale(120),
                  borderRadius: isDesktop ? 80 : scale(60),
                }
              ]}>
                <Recycle 
                  size={isDesktop ? 80 : scale(60)} 
                  color="#ffffff" 
                  strokeWidth={1.5} 
                />
              </View>
            </View>
            
            <View style={styles.brandContainer}>
              <Text style={[
                styles.brandName,
                { 
                  fontSize: isDesktop ? 48 : scale(42),
                  textAlign: layoutConfig.textAlign,
                }
              ]}>
                Recoza
              </Text>
              
              {/* Tagline with colors - Uthutho style */}
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
                { 
                  fontSize: isDesktop ? 16 : scale(15),
                  textAlign: layoutConfig.textAlign,
                }
              ]}>
                Join South Africa's community-powered recycling movement. 
                Turn waste into income while helping the environment.
              </Text>
            </View>
          </View>

          {/* Right Side - Login Form */}
          <View style={[styles.rightColumn, { width: layoutConfig.rightWidth }]}>
            <View style={[
              styles.formCard,
              {
                padding: isDesktop ? 40 : scale(24),
              }
            ]}>
              <Text style={[
                styles.formTitle,
                { fontSize: isDesktop ? 28 : scale(26) }
              ]}>
                Welcome Back
              </Text>
              <Text style={[
                styles.formSubtitle,
                { fontSize: isDesktop ? 15 : scale(15) }
              ]}>
                Sign in to continue recycling
              </Text>

              {/* Error Message */}
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Email Input */}
              <View style={[
                styles.inputWrapper,
                {
                  height: isDesktop ? 52 : scale(50),
                  paddingHorizontal: isDesktop ? 16 : scale(16),
                  marginBottom: isDesktop ? 16 : scale(14),
                }
              ]}>
                <Mail size={isDesktop ? 18 : 20} color={Colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    { fontSize: isDesktop ? 15 : scale(15) }
                  ]}
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>

              {/* Password Input */}
              <View style={[
                styles.inputWrapper,
                {
                  height: isDesktop ? 52 : scale(50),
                  paddingHorizontal: isDesktop ? 16 : scale(16),
                  marginBottom: isDesktop ? 16 : scale(14),
                }
              ]}>
                <Lock size={isDesktop ? 18 : 20} color={Colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    { fontSize: isDesktop ? 15 : scale(15) }
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  autoComplete="password"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  disabled={isLoading}
                >
                  {passwordVisible ? (
                    <EyeOff size={isDesktop ? 18 : 20} color="#999" />
                  ) : (
                    <Eye size={isDesktop ? 18 : 20} color="#999" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={() => {
                  // Handle forgot password
                  console.log('Forgot password pressed');
                }}
                disabled={isLoading}
              >
                <Text style={[
                  styles.forgotPasswordText,
                  { fontSize: isDesktop ? 14 : scale(14) }
                ]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  {
                    height: isDesktop ? 52 : scale(50),
                    borderRadius: isDesktop ? 26 : scale(25),
                    marginBottom: isDesktop ? 20 : scale(16),
                  },
                  isLoading && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={[
                  styles.loginButtonText,
                  { fontSize: isDesktop ? 16 : scale(16) }
                ]}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={[
                  styles.dividerText,
                  { fontSize: isDesktop ? 14 : scale(14) }
                ]}>
                  or
                </Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={[
                  styles.signupText,
                  { fontSize: isDesktop ? 15 : scale(15) }
                ]}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/register')}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.signupLink,
                    { fontSize: isDesktop ? 15 : scale(15) }
                  ]}>
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Credit */}
        <View style={styles.footer}>
          <Text style={[
            styles.footerText,
            { fontSize: isDesktop ? 12 : scale(12) }
          ]}>
            Developed by Recoza
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
    minHeight: '100%',
  },
  rowContainer: {
    width: '100%',
  },
  leftColumn: {
    alignItems: 'center',
  },
  rightColumn: {
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: isDesktop ? 24 : verticalScale(20),
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    marginBottom: isDesktop ? 0 : verticalScale(30),
  },
  brandName: {
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: isDesktop ? 8 : scale(8),
    letterSpacing: -0.5,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isDesktop ? 16 : scale(12),
  },
  taglineText: {
    fontSize: isDesktop ? 22 : scale(20),
    fontWeight: '600',
  },
  recycleText: {
    color: '#ffffff',
  },
  earnText: {
    color: '#FFD700',
  },
  sustainText: {
    color: '#98FB98',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: isDesktop ? 24 : scale(22),
    maxWidth: isDesktop ? 400 : '100%',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: isDesktop ? 24 : scale(20),
    width: '100%',
    maxWidth: isDesktop ? 450 : '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formTitle: {
    fontWeight: '700',
    color: Colors.text,
    marginBottom: isDesktop ? 8 : scale(6),
  },
  formSubtitle: {
    color: Colors.textSecondary,
    marginBottom: isDesktop ? 24 : scale(20),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: isDesktop ? 12 : scale(12),
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: isDesktop ? 10 : scale(10),
  },
  inputIcon: {
    opacity: 0.7,
  },
  input: {
    flex: 1,
    color: Colors.text,
    padding: 0,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: isDesktop ? 24 : scale(20),
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontWeight: '600',
    color: '#ffffff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isDesktop ? 20 : scale(16),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    marginHorizontal: isDesktop ? 12 : scale(12),
    color: Colors.textSecondary,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: Colors.textSecondary,
  },
  signupLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: isDesktop ? 12 : scale(12),
    borderRadius: isDesktop ? 8 : scale(8),
    marginBottom: isDesktop ? 20 : scale(16),
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: isDesktop ? 14 : scale(14),
  },
  footer: {
    marginTop: isDesktop ? 40 : verticalScale(30),
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});