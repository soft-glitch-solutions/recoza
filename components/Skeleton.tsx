import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, borderRadius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB', // Colors.border approximation
          opacity: opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonBlock = ({ height = 100, style }: { height?: number | string, style?: ViewStyle }) => (
  <Skeleton height={height} width="100%" borderRadius={16} style={[{ marginBottom: 16 }, style]} />
);

export const SkeletonList = ({ count = 3, height = 60 }: { count?: number, height?: number | string }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} height={height} width="100%" borderRadius={12} style={{ marginBottom: 12 }} />
    ))}
  </View>
);
