import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function LeagueAndLogo() {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-8, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    opacity.value = withRepeat(
      withTiming(0.7, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className="w-full items-center py-6">
      {/* Mini Stat Bar */}
      <View className="w-[85%] flex-row bg-white/5 rounded-full border border-white/10 p-1 mb-10">
        <View className="flex-1 flex-row items-center justify-center py-1.5">
           <MaterialCommunityIcons name="trophy-outline" size={16} color="#f59e0b" />
           <Text className="text-white/80 text-xs font-bold ml-2">Rank 183</Text>
        </View>
        <View className="w-[1px] bg-white/10 my-1" />
        <View className="flex-1 flex-row items-center justify-center py-1.5">
           <MaterialCommunityIcons name="web" size={16} color="#06b6d4" />
           <Text className="text-white/80 text-xs font-bold ml-2">Global 1K+</Text>
        </View>
      </View>

      <AnimatedView style={floatingStyle} className="items-center justify-center">
        {/* Soft Background Glow */}
        <AnimatedView 
          style={glowStyle} 
          className="absolute w-32 h-32 bg-game-accent rounded-full blur-3xl opacity-20" 
        />
        
        <Text className="text-white text-6xl font-black italic tracking-tighter">
          LUDO
        </Text>
        <View className="bg-red-600 px-4 py-0.5 rounded-sm rotate-[-1deg] mt-[-5px]">
          <Text className="text-white text-xs font-black tracking-[8px]">
            DOOM
          </Text>
        </View>
      </AnimatedView>
    </View>
  );
}