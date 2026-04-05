import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export function TabButton({ isActive, icon, routeName, onPress, style }) {
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, { damping: 12, stiffness: 150 });
  }, [isActive]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.9, 1.2]) },
      { translateY: interpolate(progress.value, [0, 1], [0, -6]) },
    ],
  }));

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(progress.value, [0, 1], ['#94a3b8', '#8b5cf6']),
      opacity: interpolate(progress.value, [0, 1], [0.6, 1]),
      transform: [
        { translateY: interpolate(progress.value, [0, 1], [4, -2]) }, 
        { scale: interpolate(progress.value, [0, 1], [0.9, 1]) }
      ]
    };
  });

  return (
    <Pressable onPress={onPress} style={style} className="items-center justify-center h-full">
      <View className="items-center justify-center">
        <Animated.View style={animatedIconStyle}>
          {icon}
        </Animated.View>

        <Animated.Text
          style={animatedTextStyle}
          className="text-[10px] font-black uppercase tracking-tighter mt-1"
        >
          {routeName}
        </Animated.Text>
      </View>
    </Pressable>
  );
}