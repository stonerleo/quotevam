import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import mobileAds from 'react-native-google-mobile-ads';

mobileAds()
  .initialize()
  .then(adapterStatuses => {
    // Initialization complete!
  });

import { CustomQuotesProvider } from '@/context/CustomQuotesContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AdProvider } from '@/context/AdContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <FavoritesProvider>
          <CustomQuotesProvider>
            <AdProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </AdProvider>
          </CustomQuotesProvider>
        </FavoritesProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
