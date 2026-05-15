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
          tabBarShowLabel: true,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: '#94A3B8',
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Home size={22} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="collections"
          options={{
            title: 'Collections',
            tabBarIcon: ({ color }) => (
              <Package size={22} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="impact"
          options={{
            title: 'Impact',
            tabBarIcon: ({ color }) => (
              <Leaf size={22} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <User size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </RecyclablesProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 0,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});