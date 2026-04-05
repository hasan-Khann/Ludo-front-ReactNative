import { Tabs } from 'expo-router';
import { TabBar } from '../../components/tabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="shop" options={{ title: "Shop" }} />
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="social" options={{ title: "social" }} />
    </Tabs>
  );
}
