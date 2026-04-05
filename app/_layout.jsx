import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import "../global.css";

export default function rootLayout() {
  useEffect(() => {
    const prepareGUI = async () => {
      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync("hidden");
      }
    };
    prepareGUI();
  }, []);

  return (
    <View className="flex-1 bg-black">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="matchMaking"
          options={{
            animation: 'slide_from_bottom',
            presentation: 'fullScreenModal'
          }}
        />
      </Stack>
    </View>
  );
}