import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RecyclablesProvider } from "@/contexts/RecyclablesContext";

SplashScreen.preventAutoHideAsync();


function RootLayoutNav() {
  const { isLoading, isAuthenticated, hasSeenOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(tabs)";
    const inOnboarding = segments[0] === "onboarding";

    if (!hasSeenOnboarding && !inOnboarding) {
      router.replace("/onboarding");
    } else if (!isAuthenticated && hasSeenOnboarding && inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && !inAuthGroup) {
      router.replace("/(tabs)/(home)" as any);
    }
  }, [isLoading, isAuthenticated, hasSeenOnboarding, segments]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
