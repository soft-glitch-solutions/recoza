// app/(tabs)/_layout.tsx - FLOATING DESIGN
import { Tabs } from 'expo-router';
import { Home, Package, User, Leaf, MapPin } from 'lucide-react-native';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import Colors from '@/constants/colors';
import { RecyclablesProvider } from '@/contexts/RecyclablesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const isCollector = profile?.is_collector || profile?.collector_approved;
  const isHousehold = profile?.is_collector === false || profile?.collector_approved === false;

  return (
    <RecyclablesProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [styles.tabBar, { backgroundColor: colors.background, borderTopColor: colors.borderLight }],
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
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
            href: isCollector ? null : undefined,
            tabBarIcon: ({ color }) => (
              <Leaf size={22} color={color} />
            ),
          }}
        />

        {isCollector && (
          <Tabs.Screen
            name="drop-off"
            options={{
              title: 'Drop-off',
              href: isHousehold ? null : undefined,
              tabBarIcon: ({ color }) => (
                <MapPin size={22} color={color} />
              ),
            }}
          />
        )}

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
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    paddingBottom: 0,
    paddingTop: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
});