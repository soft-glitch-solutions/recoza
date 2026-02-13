import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RecyclablesProvider } from "@/contexts/RecyclablesContext";
import { View, Text, ActivityIndicator, StyleSheet, Platform, Linking } from "react-native";
import { supabase } from "@/lib/supabase";

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Loading component with Recoza branding
function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Recoza</Text>
      <View style={styles.taglineContainer}>
        <Text style={styles.taglineText}>Recycle Smart, Earn Smart</Text>
      </View>
      <ActivityIndicator color="#00A651" style={{ marginTop: 16 }} />
    </View>
  );
}

function RootLayoutNav() {
  const { isLoading, isAuthenticated, hasSeenOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [initialUrlProcessed, setInitialUrlProcessed] = useState(false);

  useEffect(() => {
    const handleInitialURL = async () => {
      try {
        let initialUrl: string | null = null;

        if (Platform.OS !== 'web') {
          initialUrl = await Linking.getInitialURL();
        } else {
          initialUrl = window.location.href;
        }

        if (initialUrl) {
          console.log('[RootLayout] Initial URL detected:', initialUrl);

          // Handle OAuth callback
          if (initialUrl.includes('auth/callback')) {
            try {
              const url = new URL(initialUrl);
              const hashParams = new URLSearchParams(url.hash.substring(1));
              const searchParams = new URLSearchParams(url.search);
              
              const access_token = hashParams.get('access_token') || searchParams.get('access_token');
              const refresh_token = hashParams.get('refresh_token') || searchParams.get('refresh_token');
              
              if (access_token && refresh_token) {
                console.log('[RootLayout] Setting session from URL tokens');
                const { error } = await supabase.auth.setSession({
                  access_token,
                  refresh_token
                });
                
                if (error) throw error;
                console.log('[RootLayout] Session stored successfully');
              }
            } catch (err) {
              console.error('[RootLayout] Error storing session from URL:', err);
            }
          }
        }
      } catch (error) {
        console.error('Error handling initial URL:', error);
      } finally {
        setInitialUrlProcessed(true);
      }
    };

    handleInitialURL();
  }, []);

  useEffect(() => {
    // Don't do anything while loading or until initial URL is processed
    if (isLoading || !initialUrlProcessed) {
      return;
    }

    // Get current route safely
    const currentRoute = segments?.[0] || '';
    const inAuthGroup = currentRoute === "(tabs)";
    const inOnboarding = currentRoute === "onboarding";
    const inAuthScreen = currentRoute === "login" || currentRoute === "register";

    // Debug logging to help track navigation flow
    console.log('📍 Navigation State:', {
      isLoading,
      isAuthenticated,
      hasSeenOnboarding,
      currentRoute,
      inAuthGroup,
      inOnboarding,
      inAuthScreen
    });

    // Define navigation logic with clear priorities
    if (!hasSeenOnboarding && !inOnboarding) {
      // First time user - go to onboarding (highest priority)
      console.log('➡️ Redirecting to onboarding');
      router.replace("/onboarding");
    } else if (hasSeenOnboarding && !isAuthenticated && !inAuthScreen && !inOnboarding) {
      // Has seen onboarding but not authenticated - go to login
      console.log('➡️ Redirecting to login');
      router.replace("/login");
    } else if (isAuthenticated && !inAuthGroup && !inOnboarding && !inAuthScreen) {
      // Authenticated but not in tabs - go to home
      console.log('➡️ Redirecting to home');
      router.replace("/(tabs)/(home)");
    }
    
    // Hide splash screen once we've made navigation decisions
    SplashScreen.hideAsync().catch(error => {
      // Ignore error - splash screen might already be hidden
      console.log('Splash screen hide error:', error);
    });
    
  }, [isLoading, isAuthenticated, hasSeenOnboarding, segments, initialUrlProcessed]);

  // Show loading screen while auth is initializing or URL is being processed
  if (isLoading || !initialUrlProcessed) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="onboarding" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          headerShown: false, 
          presentation: "card" 
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
      
      {/* Catch any undefined routes */}
      <Stack.Screen 
        name="+not-found" 
        options={{ title: "Not Found" }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RecyclablesProvider>
          <RootLayoutNav />
        </RecyclablesProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background for Recoza
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00A651', // Recoza green
    marginBottom: 16,
  },
  taglineContainer: {
    marginBottom: 8,
  },
  taglineText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666666', // Gray text for tagline
  },
});