import '../global.css';
import { Stack, Redirect, useSegments, SplashScreen } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../src/utils/supabase';

// Prevent the splash screen from auto-hiding until we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onLayoutReady = useCallback(async () => {
    if (initialized) {
      await SplashScreen.hideAsync();
    }
  }, [initialized]);

  useEffect(() => {
    onLayoutReady();
  }, [onLayoutReady]);

  // Always render the Stack so NavigationContainer context is available
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="add-transaction" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="debts" options={{ presentation: 'fullScreenModal', headerShown: false }} />
      <Stack.Screen name="notifications" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="personal-info" options={{ headerShown: false }} />
      <Stack.Screen name="security" options={{ headerShown: false }} />
      <Stack.Screen name="accounts" options={{ headerShown: false }} />
      <Stack.Screen name="categories" options={{ headerShown: false }} />
    </Stack>
  );
}

/**
 * Auth guard component - use this inside individual layouts or screens
 * that need auth protection. We export it so child layouts can use it.
 */
export function useProtectedRoute() {
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!initialized) return { isLoading: true, redirect: null };

  const inAuthGroup = segments[0] === '(auth)';

  if (!session && !inAuthGroup) {
    return { isLoading: false, redirect: '/(auth)/login' as const };
  }
  if (session && inAuthGroup) {
    return { isLoading: false, redirect: '/(tabs)' as const };
  }

  return { isLoading: false, redirect: null };
}
