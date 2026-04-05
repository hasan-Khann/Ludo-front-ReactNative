import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { TabButton } from './tabs';

export function TabBar({ state, descriptors, navigation }) {
  const { width } = useWindowDimensions();
  const containerWidth = width * 0.94;
  const tabWidth = containerWidth / state.routes.length;
  const translateX = useSharedValue(state.index * tabWidth);

  useEffect(() => {
    translateX.value = withSpring(state.index * tabWidth, { 
      damping: 18, 
      stiffness: 120,
      mass: 0.5 
    });
  }, [state.index, tabWidth]);

  const icons = {
    index: (p) => <FontAwesome6 name="dice" size={22} {...p} />,
    social: (p) => <Ionicons name="people-sharp" size={24} {...p} />,
    shop: (p) => <MaterialCommunityIcons name="treasure-chest" size={24} {...p} />,
    events: (p) => <MaterialCommunityIcons name="ticket-star" size={24} {...p} />,
  };

  return (
    <View className="absolute bottom-8 w-full items-center">
      <View 
        className="flex-row bg-game-surface rounded-[32px] border border-white/10 items-center shadow-2xl"
        style={{ width: containerWidth, height: 84 }}
      >
        {/* Floating Indicator */}
        <Animated.View
          style={[useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] })), {
            position: 'absolute', width: tabWidth, height: '100%', padding: 6
          }]}
        >
          <View className="flex-1 bg-white/5 rounded-[24px] border border-white/5" />
          <View className="absolute top-0 left-1/4 right-1/4 h-1 bg-game-accent rounded-b-full shadow-lg shadow-game-accent" />
        </Animated.View>

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const label = route.name === 'index' ? 'Play' : route.name;
          const Icon = icons[route.name.toLowerCase()] || icons.index;

          return (
            <TabButton
              key={route.key}
              isActive={isFocused}
              routeName={label}
              icon={Icon({ color: isFocused ? '#8b5cf6' : '#94a3b8' })}
              onPress={() => navigation.navigate(route.name)}
              style={{ width: tabWidth }}
            />
          );
        })}
      </View>
    </View>
  );
}