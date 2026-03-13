import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { database } from '@/database';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Initialize database (auto-selects native or web version)
    if (Platform.OS !== 'web') {
      database.init().catch(error => console.error('Database init failed:', error));
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
