// app/(tabs)/_layout.tsx - FLOATING DESIGN
import { Tabs } from 'expo-router';
import { Home, Package, User, Leaf } from 'lucide-react-native';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import Colors from '@/constants/colors';
import { RecyclablesProvider } from '@/contexts/RecyclablesContext';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  return (
    <RecyclablesProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ),
          tabBarShowLabel: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: '#94A3B8',
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Animated.View style={[styles.tabItem, focused && styles.tabItemActive]}>
                <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                  <Home size={22} color={focused ? Colors.white : color} />
                </View>
                {focused && <View style={styles.activeIndicator} />}
              </Animated.View>
            ),
          }}
        />
        
        <Tabs.Screen
          name="collections"
          options={{
            title: 'Collections',
            tabBarIcon: ({ color, focused }) => (
              <Animated.View style={[styles.tabItem, focused && styles.tabItemActive]}>
                <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                  <Package size={22} color={focused ? Colors.white : color} />
                </View>
                {focused && <View style={styles.activeIndicator} />}
              </Animated.View>
            ),
          }}
        />
        
        <Tabs.Screen
          name="impact"
          options={{
            title: 'Impact',
            tabBarIcon: ({ color, focused }) => (
              <Animated.View style={[styles.tabItem, focused && styles.tabItemActive]}>
                <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                  <Leaf size={22} color={focused ? Colors.white : color} />
                </View>
                {focused && <View style={styles.activeIndicator} />}
              </Animated.View>
            ),
          }}
        />
        
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Animated.View style={[styles.tabItem, focused && styles.tabItemActive]}>
                <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                  <User size={22} color={focused ? Colors.white : color} />
                </View>
                {focused && <View style={styles.activeIndicator} />}
              </Animated.View>
            ),
          }}
        />
      </Tabs>
    </RecyclablesProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 35,
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabItemActive: {
    transform: [{ translateY: -4 }],
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});