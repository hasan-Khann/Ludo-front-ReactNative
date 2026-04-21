import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    const prepareGUI = async () => {
      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync("hidden");
      }
    };
    prepareGUI();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar hidden />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="matchMaking"
          options={{
            animation: 'slide_from_bottom',
            presentation: 'fullScreenModal'
          }}
        />
        <Stack.Screen
          name="online"
          options={{
            animation: 'slide_from_bottom',
            presentation: 'fullScreenModal'
          }}
        />
      </Stack>
    </View>
  );
}