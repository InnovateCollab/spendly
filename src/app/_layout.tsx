import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useRef } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/icons/animated-icon';
import AppTabs from '@/components/layout/app-tabs';
import { useInitializeApp } from '@/hooks/use-initialize-app';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isInitialized, error } = useInitializeApp();
  const hasShownSplash = useRef(false);

  // Show splash overlay only on app startup
  const showSplash = !hasShownSplash.current && !isInitialized;
  if (!hasShownSplash.current && isInitialized) {
    hasShownSplash.current = true;
  }

  // Log initialization errors (handle gracefully - app continues anyway)
  if (error) {
    console.warn('App failed to initialize fully, running with degraded mode:', error);
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {showSplash && <AnimatedSplashOverlay />}
      <AppTabs />
    </ThemeProvider>
  );
}
