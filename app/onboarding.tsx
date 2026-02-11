import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Recycle, Users, TrendingUp, ArrowRight, ChevronLeft } from 'lucide-react-native';
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

// Responsive scaling - same as Uthutho
const scale = (size: number) => {
  if (isDesktop) {
    return Math.min(size * (width / 375), size * 1.2);
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

// Slide configuration
const slides = [
  {
    id: 1,
    title: 'Welcome to Recoza',
    subtitle: 'Turn Recycling Into Income',
    description: 'Join South Africa\'s community-powered recycling movement. Help the environment while earning money.',
    icon: Recycle,
    gradientColors: ['#2D9B5E', '#1E7A45'] as const,
  },
  {
    id: 2,
    title: 'Build Your Network',
    subtitle: 'Connect With Your Community',
    description: 'Invite friends, family, and neighbours to join. Become their trusted recycling collector.',
    icon: Users,
    gradientColors: ['#3B82F6', '#1D4ED8'] as const,
  },
  {
    id: 3,
    title: 'Track & Earn',
    subtitle: 'Predictable Weekly Income',
    description: 'Log recyclables, plan collections, and see your estimated earnings grow week by week.',
    icon: TrendingUp,
    gradientColors: ['#F59E0B', '#D97706'] as const,
  },
];

// Brand colors
const BRAND_COLORS = {
  primary: '#2D9B5E',
  secondary: '#1E7A45',
};

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // Reasonable max content width
  const maxContentWidth = isLargeDesktop ? 1000 : isDesktop ? 900 : isTablet ? 700 : '100%';

  // Dynamic heights - same pattern as Uthutho
  const getDynamicHeights = () => {
    if (isTinyScreen) {
      return {
        headerHeight: verticalScale(35),
        iconSize: scale(60),
        iconContainerSize: scale(110),
        iconMarginBottom: verticalScale(15),
        textMarginBottom: verticalScale(10),
        footerMarginTop: verticalScale(5),
        contentPaddingTop: verticalScale(10),
        contentPaddingBottom: verticalScale(5),
        titleSize: scale(22),
        subtitleSize: scale(14),
        descriptionSize: scale(12),
      };
    } else if (isVerySmallScreen) {
      return {
        headerHeight: verticalScale(40),
        iconSize: scale(70),
        iconContainerSize: scale(130),
        iconMarginBottom: verticalScale(20),
        textMarginBottom: verticalScale(15),
        footerMarginTop: verticalScale(10),
        contentPaddingTop: verticalScale(15),
        contentPaddingBottom: verticalScale(10),
        titleSize: scale(26),
        subtitleSize: scale(16),
        descriptionSize: scale(13),
      };
    } else if (isSmallScreen) {
      return {
        headerHeight: verticalScale(45),
        iconSize: scale(80),
        iconContainerSize: scale(150),
        iconMarginBottom: verticalScale(25),
        textMarginBottom: verticalScale(20),
        footerMarginTop: verticalScale(15),
        contentPaddingTop: verticalScale(20),
        contentPaddingBottom: verticalScale(15),
        titleSize: scale(30),
        subtitleSize: scale(18),
        descriptionSize: scale(14),
      };
    } else if (isTablet) {
      return {
        headerHeight: verticalScale(50),
        iconSize: scale(90),
        iconContainerSize: scale(170),
        iconMarginBottom: verticalScale(30),
        textMarginBottom: verticalScale(25),
        footerMarginTop: verticalScale(20),
        contentPaddingTop: verticalScale(25),
        contentPaddingBottom: verticalScale(20),
        titleSize: scale(34),
        subtitleSize: scale(20),
        descriptionSize: scale(15),
      };
    } else {
      // Desktop - keep it compact
      return {
        headerHeight: 50,
        iconSize: 100,
        iconContainerSize: 180,
        iconMarginBottom: 30,
        textMarginBottom: 25,
        footerMarginTop: 20,
        contentPaddingTop: 30,
        contentPaddingBottom: 20,
        titleSize: 38,
        subtitleSize: 22,
        descriptionSize: 16,
      };
    }
  };

  const dynamicHeights = getDynamicHeights();

  // Desktop layout with proper proportions
  const getLayoutConfig = () => {
    if (isDesktop) {
      return {
        contentFlexDirection: 'row',
        contentJustifyContent: 'space-between',
        contentAlignItems: 'center',
        iconWidth: '40%',
        textWidth: '55%',
        textAlign: 'left',
        iconMaxWidth: 300,
        textMaxWidth: 500,
      };
    }
    return {
      contentFlexDirection: 'column',
      contentJustifyContent: 'center',
      contentAlignItems: 'center',
      iconWidth: isTablet ? '60%' : isTinyScreen ? '60%' : isVerySmallScreen ? '70%' : '80%',
      textWidth: '100%',
      textAlign: 'center',
      iconMaxWidth: isTablet ? 320 : 280,
      textMaxWidth: '100%',
    };
  };

  const layoutConfig = getLayoutConfig();

  // Prevent double tap zoom
  const handleDoubleTapProtection = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
      return true;
    } else {
      setLastTap(now);
      return false;
    }
  };

  // Slide transition function
  const handleSlideTransition = (direction: 'next' | 'prev') => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    
    if (direction === 'next') {
      // Next slide animation - slide left
      Animated.timing(slideAnim, {
        toValue: -width * 0.8,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        if (currentSlide < slides.length - 1) {
          setCurrentSlide(prev => prev + 1);
        } else {
          // Last slide - go to login
          handleGetStarted();
          return;
        }

        slideAnim.setValue(width * 0.5);
        
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start(() => {
          setIsTransitioning(false);
        });
      });
    } else {
      // Previous slide animation - slide right
      if (currentSlide === 0) {
        setIsTransitioning(false);
        return;
      }
      
      Animated.timing(slideAnim, {
        toValue: width * 0.8,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        setCurrentSlide(prev => prev - 1);
        
        slideAnim.setValue(-width * 0.5);
        
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start(() => {
          setIsTransitioning(false);
        });
      });
    }
  };

  // PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        if (handleDoubleTapProtection()) {
          return false;
        }
        return true;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && 
               Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isTransitioning) {
          const constrainedDX = Math.max(Math.min(gestureState.dx, width * 0.5), -width * 0.5);
          slideAnim.setValue(constrainedDX);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isTransitioning) return;

        const swipeThreshold = width * 0.15;
        const currentDX = gestureState.dx;
        const swipeVelocity = Math.abs(gestureState.vx);
        
        if (currentDX < -swipeThreshold || (currentDX < -10 && swipeVelocity > 0.5)) {
          handleSlideTransition('next');
        } else if (currentDX > swipeThreshold || (currentDX > 10 && swipeVelocity > 0.5)) {
          handleSlideTransition('prev');
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleNext = () => {
    if (handleDoubleTapProtection() && isTransitioning) return;
    handleSlideTransition('next');
  };

  const handleBack = () => {
    if (handleDoubleTapProtection() || isTransitioning || currentSlide === 0) return;
    handleSlideTransition('prev');
  };

  const handleSkip = async () => {
    if (handleDoubleTapProtection()) return;
    await completeOnboarding();
    router.replace('/login');
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/login');
  };

  const slideStyle = {
    transform: [
      { 
        translateX: slideAnim.interpolate({
          inputRange: [-width * 0.5, 0, width * 0.5],
          outputRange: [-width * 0.5, 0, width * 0.5],
          extrapolate: 'clamp'
        })
      },
    ],
    opacity: slideAnim.interpolate({
      inputRange: [-width * 0.5, 0, width * 0.5],
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp'
    }),
  };

  const currentItem = slides[currentSlide];
  const IconComponent = currentItem.icon;

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={currentItem.gradientColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Content Container */}
      <View style={styles.contentContainer}>
        <View 
          style={[
            styles.content, 
            { 
              maxWidth: maxContentWidth,
              paddingTop: Math.max(dynamicHeights.contentPaddingTop, insets.top + 10),
              paddingBottom: dynamicHeights.contentPaddingBottom,
            }
          ]} 
          {...panResponder.panHandlers}
        >
          {/* Header with Back Button */}
          <View style={[styles.header, { height: dynamicHeights.headerHeight }]}>
            {currentSlide > 0 ? (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBack}
                disabled={isTransitioning}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <ChevronLeft size={isDesktop ? 20 : scale(24)} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
            
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isTransitioning}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Text style={styles.skipText}>
                Skip
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Content with Slide Animation */}
          <Animated.View 
            style={[
              styles.mainContent, 
              slideStyle,
              {
                flexDirection: layoutConfig.contentFlexDirection,
                justifyContent: layoutConfig.contentJustifyContent,
                alignItems: layoutConfig.contentAlignItems,
              }
            ]}
          >
            {/* Icon Container */}
            <View style={[
              styles.iconWrapper,
              { 
                width: layoutConfig.iconWidth,
                maxWidth: layoutConfig.iconMaxWidth,
              }
            ]}>
              <View style={[
                styles.iconContainer,
                {
                  width: dynamicHeights.iconContainerSize,
                  height: dynamicHeights.iconContainerSize,
                  borderRadius: dynamicHeights.iconContainerSize / 2,
                  marginBottom: layoutConfig.contentFlexDirection === 'row' ? 0 : dynamicHeights.iconMarginBottom,
                }
              ]}>
                <IconComponent 
                  size={dynamicHeights.iconSize} 
                  color="#ffffff" 
                  strokeWidth={1.5}
                />
              </View>
            </View>

            {/* Text Content */}
            <View style={[
              styles.textContainer, 
              { 
                marginBottom: layoutConfig.contentFlexDirection === 'row' ? 0 : dynamicHeights.textMarginBottom,
                width: layoutConfig.textWidth,
                maxWidth: layoutConfig.textMaxWidth,
              }
            ]}>
              <Text style={[
                styles.title,
                { 
                  fontSize: dynamicHeights.titleSize,
                  textAlign: layoutConfig.textAlign,
                }
              ]}>
                {currentItem.title}
              </Text>
              <Text style={[
                styles.subtitle,
                { 
                  fontSize: dynamicHeights.subtitleSize,
                  textAlign: layoutConfig.textAlign,
                  marginBottom: verticalScale(8),
                }
              ]}>
                {currentItem.subtitle}
              </Text>
              <Text style={[
                styles.description,
                { 
                  fontSize: dynamicHeights.descriptionSize,
                  lineHeight: dynamicHeights.descriptionSize * 1.5,
                  textAlign: layoutConfig.textAlign,
                }
              ]}>
                {currentItem.description}
              </Text>
            </View>
          </Animated.View>

          {/* Footer with Navigation */}
          <View style={[styles.footer, { marginTop: dynamicHeights.footerMarginTop }]}>
            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: index === currentSlide ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                      width: index === currentSlide ? (isDesktop ? 24 : scale(24)) : (isDesktop ? 8 : scale(8)),
                      height: isDesktop ? 8 : scale(8),
                      borderRadius: isDesktop ? 4 : scale(4),
                    },
                  ]}
                />
              ))}
            </View>

            {/* Next/Get Started Button */}
            <TouchableOpacity
              style={[
                styles.button, 
                isTransitioning && styles.buttonDisabled
              ]}
              onPress={handleNext}
              disabled={isTransitioning}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.buttonText}>
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <ArrowRight size={isDesktop ? 18 : scale(20)} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Developer Credit - Only show if there's space */}
          {!isTinyScreen && (
            <View style={styles.credit}>
              <Text style={styles.creditText}>
                Recoza v1.0.0
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: isLargeDesktop ? 40 : isDesktop ? 32 : isTablet ? scale(24) : scale(16),
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(5),
    minHeight: verticalScale(30),
    width: '100%',
  },
  backButton: {
    padding: isDesktop ? 8 : scale(8),
    opacity: 0.9,
  },
  placeholder: {
    width: isDesktop ? 40 : scale(40),
    height: isDesktop ? 40 : scale(40),
  },
  skipButton: {
    padding: isDesktop ? 8 : scale(8),
  },
  skipText: {
    fontSize: isDesktop ? 16 : scale(16),
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.9,
  },
  mainContent: {
    flex: 1,
    width: '100%',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: verticalScale(4),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.3,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: isDesktop ? 5 : verticalScale(5),
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isDesktop ? 20 : isTablet ? verticalScale(20) : isTinyScreen ? verticalScale(15) : verticalScale(20),
    height: isDesktop ? 12 : verticalScale(12),
  },
  dot: {
    marginHorizontal: isDesktop ? 4 : scale(4),
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isDesktop ? 32 : isTablet ? scale(32) : scale(28),
    paddingVertical: isDesktop ? 14 : isTablet ? verticalScale(14) : verticalScale(12),
    borderRadius: isDesktop ? 30 : scale(30),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: isDesktop ? 140 : isTablet ? scale(140) : scale(130),
    minHeight: isDesktop ? 48 : isTablet ? verticalScale(48) : verticalScale(44),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: isDesktop ? 16 : isTablet ? scale(16) : scale(15),
    fontWeight: 'bold',
    marginRight: isDesktop ? 8 : scale(8),
  },
  credit: {
    alignItems: 'center',
    marginTop: isDesktop ? 10 : verticalScale(10),
    marginBottom: verticalScale(5),
  },
  creditText: {
    fontSize: isDesktop ? 12 : scale(11),
    color: '#ffffff',
    opacity: 0.5,
  },
});