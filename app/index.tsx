import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingScreen from '@/components/auth/OnboardingScreen';

export default function RootScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.replace('/(tabs)');
      }
    }
  }, [session, loading, router]);

  if (loading) {
    return null;
  }

  return <OnboardingScreen />;
}
