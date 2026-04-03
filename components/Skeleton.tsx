import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle, DimensionValue } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, borderRadius = 8, style }) => {
  const { colors } = useTheme();
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
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: colors.borderLight,
          opacity: opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonBlock = ({ height = 100, style }: { height?: DimensionValue, style?: ViewStyle }) => (
  <Skeleton height={height} width="100%" borderRadius={16} style={[styles.mb16, style]} />
);

export const SkeletonList = ({ count = 3, height = 60 }: { count?: number, height?: DimensionValue }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} height={height} width="100%" borderRadius={12} style={styles.mb12} />
    ))}
  </View>
);

const styles = {
  mb16: { marginBottom: 16 } as ViewStyle,
  mb12: { marginBottom: 12 } as ViewStyle,
};
