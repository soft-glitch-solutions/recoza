import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Dimensions, Animated
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const TUTORIAL_STORAGE_KEY = '@recoza_tutorial_seen';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetX: number;
  targetY: number;
  spotlightW: number;
  spotlightH: number;
  tooltipPosition: 'top' | 'bottom' | 'center';
  emoji: string;
  /** Optional: call this before showing the step (e.g., router.push to another tab) */
  onBeforeShow?: () => void;
}

interface TutorialOverlayProps {
  visible: boolean;
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export function TutorialOverlay({ visible, steps, onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      startPulse();
    } else {
      pulseRef.current?.stop();
    }
    return () => pulseRef.current?.stop();
  }, [visible]);

  // Re-trigger pulse on step change
  useEffect(() => {
    if (visible) {
      pulseRef.current?.stop();
      pulseAnim.setValue(1);
      startPulse();
    }
  }, [currentStep]);

  const startPulse = () => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulseRef.current.start();
  };

  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const PAD = 10;
  const spotLeft = step.targetX - step.spotlightW / 2 - PAD;
  const spotTop = step.targetY - step.spotlightH / 2 - PAD;
  const spotRight = step.targetX + step.spotlightW / 2 + PAD;
  const spotBottom = step.targetY + step.spotlightH / 2 + PAD;

  const left = Math.max(0, spotLeft);
  const top = Math.max(0, spotTop);
  const right = Math.min(SCREEN_W, spotRight);
  const bottom = Math.min(SCREEN_H, spotBottom);
  const holeW = right - left;
  const holeH = bottom - top;

  const TOOLTIP_H = 230;
  const TOOLTIP_MARGIN = 24;
  let tooltipTop: number;

  const belowY = bottom + TOOLTIP_MARGIN;
  const aboveY = top - TOOLTIP_MARGIN - TOOLTIP_H;

  if (step.tooltipPosition === 'bottom' && belowY + TOOLTIP_H < SCREEN_H - 20) {
    tooltipTop = belowY;
  } else if (step.tooltipPosition === 'top' && aboveY > 20) {
    tooltipTop = aboveY;
  } else {
    // Fallback: show below the middle of screen if neither fits
    tooltipTop = SCREEN_H > 700 ? SCREEN_H / 2 + 40 : SCREEN_H - TOOLTIP_H - 20;
  }
  tooltipTop = Math.min(Math.max(tooltipTop, 20), SCREEN_H - TOOLTIP_H - 20);

  const dismiss = (cb: () => void) => {
    pulseRef.current?.stop();
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(cb);
  };

  const goToStep = (nextIndex: number) => {
    if (nextIndex >= steps.length) {
      dismiss(onComplete);
      return;
    }
    const nextStep = steps[nextIndex];
    if (nextStep.onBeforeShow) {
      // Navigate first, then wait a frame for the screen to render
      nextStep.onBeforeShow();
      setTimeout(() => setCurrentStep(nextIndex), 350);
    } else {
      setCurrentStep(nextIndex);
    }
  };

  const handleNext = () => goToStep(currentStep + 1);
  const handleSkip = () => dismiss(onSkip);

  const borderRadius = step.spotlightW > 80 ? 20 : step.spotlightW / 2;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.root, { opacity: fadeAnim }]} pointerEvents="box-none">

        {/* 4-panel dark mask */}
        {/* TOP */}
        <View style={[styles.mask, { top: 0, left: 0, right: 0, height: top }]} />
        {/* BOTTOM */}
        <View style={[styles.mask, { top: bottom, left: 0, right: 0, bottom: 0 }]} />
        {/* LEFT */}
        <View style={[styles.mask, { top: top, left: 0, width: left, height: holeH }]} />
        {/* RIGHT */}
        <View style={[styles.mask, { top: top, left: right, right: 0, height: holeH }]} />

        {/* Animated green border around spotlight */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.spotlightBorder,
            {
              top,
              left,
              width: holeW,
              height: holeH,
              borderRadius,
              transform: [{ scale: pulseAnim }],
            }
          ]}
        />

        {/* Tap dark area = advance */}
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleNext} />

        {/* Tooltip card */}
        <View style={[styles.tooltip, { top: tooltipTop }]} pointerEvents="box-none">
          <View style={styles.tooltipHeader}>
            <Text style={styles.emoji}>{step.emoji}</Text>
            <View style={styles.dots}>
              {steps.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, { backgroundColor: i === currentStep ? '#00A651' : '#D1FAE5' }]}
                />
              ))}
            </View>
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.desc}>{step.description}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextText}>{isLast ? 'Get Started! 🎉' : 'Next'}</Text>
              {!isLast && <ChevronRight size={16} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>

      </Animated.View>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export function useTutorial() {
  const [shouldShow, setShouldShow] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => { checkStatus(); }, []);

  const checkStatus = async () => {
    try {
      const seen = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
      setShouldShow(seen !== 'true');
    } catch {
      setShouldShow(false);
    } finally {
      setChecked(true);
    }
  };

  const markTutorialSeen = async () => {
    try { await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true'); } catch {}
    setShouldShow(false);
  };

  const resetTutorial = async () => {
    try { await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY); } catch {}
    setShouldShow(true);
  };

  return { shouldShow: checked && shouldShow, markTutorialSeen, resetTutorial };
}

// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  mask: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.80)',
  },
  spotlightBorder: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#00A651',
  },
  tooltip: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 10000,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  emoji: { fontSize: 36 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 22, fontWeight: '900', color: '#111827', letterSpacing: -0.5, marginBottom: 8 },
  desc: { fontSize: 14, color: '#6B7280', lineHeight: 21, fontWeight: '500', marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  skipBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  skipText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00A651',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#000',
  },
  nextText: { fontSize: 15, fontWeight: '900', color: '#fff' },
});
