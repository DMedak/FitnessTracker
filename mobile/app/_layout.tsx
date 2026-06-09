import { Stack } from 'expo-router';
import { AppProvider } from '../src/contexts/AppContext';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    NavigationBar.setButtonStyleAsync('dark');
  }, []);

  return (
    <AppProvider>
      <StatusBar
        style="dark"
        translucent
        backgroundColor="transparent"
      />

      <Stack screenOptions={{ headerShown: false }} />
    </AppProvider>
  );
}