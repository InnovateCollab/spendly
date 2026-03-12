import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { database } from '@/database';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Database testing only available on native platforms
  // To test on iOS: Run app with `npx expo start --ios`
  // Check console for database initialization logs
  // To inspect data directly, use sqlite3 CLI on iOS simulator database
  useEffect(() => {
    database.init();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
