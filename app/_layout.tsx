// app/_layout.tsx
import { View, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback } from 'react';
import { PersistentChatHistoryProvider } from '../context/PersistentChatHistoryContext';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
         <Stack.Screen name="index" />
         <Stack.Screen name="language" />
         <Stack.Screen name="screens/TopicSelectScreen" />
         <Stack.Screen name="ChatScreen" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      await SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <PersistentChatHistoryProvider>
        <RootLayoutNav />
      </PersistentChatHistoryProvider>
    </View>
  );
}
