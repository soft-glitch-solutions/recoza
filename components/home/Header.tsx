import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Recycle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  isDesktop?: boolean;
  scale?: (size: number) => number;
  layout?: {
    paddingHorizontal: number;
    contentMaxWidth: number | '100%';
  };
}

export const Header: React.FC<HeaderProps> = ({ 
  isDesktop = false, 
  scale = (size) => size,
  layout = { paddingHorizontal: 20, contentMaxWidth: '100%' }
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      style={[
        styles.header,
        { 
          paddingTop: insets.top + (isDesktop ? 24 : 16),
          paddingBottom: isDesktop ? 40 : 20,
        }
      ]}
    >
      <View style={[
        styles.headerContent,
        { 
          paddingHorizontal: layout.paddingHorizontal,
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
          width: '100%',
        }
      ]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, isDesktop && { fontSize: scale(18) }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.userName, isDesktop && { fontSize: scale(32) }]}>
            {user?.full_name?.split(' ')[0] || 'Recycler'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[
            styles.logoSmall,
            isDesktop && {
              width: scale(52),
              height: scale(52),
              borderRadius: scale(26),
            }
          ]}>
            <Recycle size={isDesktop ? scale(28) : 24} color={Colors.white} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  logoSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});