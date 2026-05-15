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
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulseRef.current.start();
    } else {
      pulseRef.current?.stop();
    }
    return () => pulseRef.current?.stop();
  }, [visible]);

  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const PAD = 8;
  const spotLeft = step.targetX - step.spotlightW / 2 - PAD;
  const spotTop = step.targetY - step.spotlightH / 2 - PAD;
  const spotRight = step.targetX + step.spotlightW / 2 + PAD;
  const spotBottom = step.targetY + step.spotlightH / 2 + PAD;

  // Clamp to screen
  const left = Math.max(0, spotLeft);
  const top = Math.max(0, spotTop);
  const right = Math.min(SCREEN_W, spotRight);
  const bottom = Math.min(SCREEN_H, spotBottom);
  const holeW = right - left;
  const holeH = bottom - top;

  // Tooltip: position below spotlight if room, else above
  const belowY = bottom + 20;
  const aboveY = top - 20;
  const tooltipH = 220;
  let tooltipTop: number;
  if (step.tooltipPosition === 'bottom' && belowY + tooltipH < SCREEN_H - 20) {
    tooltipTop = belowY;
  } else if (step.tooltipPosition === 'top' && aboveY - tooltipH > 20) {
    tooltipTop = aboveY - tooltipH;
  } else {
    // Fallback: center of screen offset from spotlight
    tooltipTop = SCREEN_H / 2 + 60;
  }
  tooltipTop = Math.min(Math.max(tooltipTop, 20), SCREEN_H - tooltipH - 20);

  const dismiss = (cb: () => void) => {
    pulseRef.current?.stop();
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(cb);
  };

  const handleNext = () => {
    if (isLast) {
      dismiss(onComplete);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => dismiss(onSkip);

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.root, { opacity: fadeAnim }]} pointerEvents="box-none">

        {/* 4-panel dark mask around spotlight */}
        {/* TOP panel */}
        <View style={[styles.maskPanel, { top: 0, left: 0, right: 0, height: top }]} />
        {/* BOTTOM panel */}
        <View style={[styles.maskPanel, { top: bottom, left: 0, right: 0, bottom: 0 }]} />
        {/* LEFT panel (between top and bottom) */}
        <View style={[styles.maskPanel, { top: top, left: 0, width: left, height: holeH }]} />
        {/* RIGHT panel (between top and bottom) */}
        <View style={[styles.maskPanel, { top: top, left: right, right: 0, height: holeH }]} />

        {/* Animated spotlight border */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.spotlightBorder,
            {
              top: top,
              left: left,
              width: holeW,
              height: holeH,
              borderRadius: holeW > 80 ? 20 : holeW / 2,
              transform: [{ scale: pulseAnim }],
            }
          ]}
        />

        {/* Tap anywhere on dark area to advance */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleNext}
        />

        {/* Tooltip card — not intercepted by above touch */}
        <View
          style={[styles.tooltip, { top: tooltipTop }]}
          pointerEvents="box-none"
        >
          {/* Header row */}
          <View style={styles.tooltipHeader}>
            <Text style={styles.emoji}>{step.emoji}</Text>
            <View style={styles.dots}>
              {steps.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === currentStep ? '#00A651' : '#D1FAE5' }
                  ]}
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
// Hook to manage tutorial state
// ─────────────────────────────────────────────
export function useTutorial() {
  const [shouldShow, setShouldShow] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

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
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch {}
    setShouldShow(false);
  };

  /** Clears storage AND immediately shows the tutorial again */
  const resetTutorial = async () => {
    try {
      await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
    } catch {}
    setShouldShow(true);
  };

  return {
    shouldShow: checked && shouldShow,
    markTutorialSeen,
    resetTutorial,
  };
}

// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  maskPanel: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.78)',
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
  emoji: { fontSize: 38 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 22, fontWeight: '900', color: '#111827', letterSpacing: -0.5, marginBottom: 8 },
  desc: { fontSize: 15, color: '#6B7280', lineHeight: 22, fontWeight: '500', marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  skipBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  skipText: { fontSize: 15, fontWeight: '700', color: '#6B7280' },
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
