import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  FadeInTop,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header() {
  const insets = useSafeAreaInsets();
  const shopPulse = useSharedValue(1);

  useEffect(() => {
    shopPulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(1, { duration: 1000 })
      ), -1, true
    );
  }, []);

  const shopStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shopPulse.value }],
  }));

  return (
    <View 
      style={{ paddingTop: insets.top }} 
      className="bg-game-surface border-b border-white/5 shadow-2xl z-50"
    >
      <StatusBar barStyle="light-content" />
      
      <Animated.View 
        entering={FadeInTop ? FadeInTop.springify() : null}
        className="flex-row items-center justify-between px-4 h-20"
      >
        {/* AVATAR SECTION */}
        <TouchableOpacity activeOpacity={0.8} className="flex-row items-center">
          <View className="h-12 w-12 rounded-2xl border-2 border-game-gold bg-black/40 overflow-hidden shadow-lg rotate-[-2deg]">
            <Image
              source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=Ludo' }}
              className="h-full w-full"
              resizeMode="cover"
            />
            <View className="absolute bottom-0 right-0 bg-game-gold px-1 rounded-tl-md">
               <Text className="text-[9px] font-black text-game-primary">28</Text>
            </View>
          </View>
          <View className="ml-2">
             <Text className="text-white text-[10px] font-black tracking-tight uppercase">Alex_Pro</Text>
             <View className="h-1.5 w-12 bg-black/50 rounded-full mt-1 border border-white/10">
                <View className="h-full w-[70%] bg-game-gold rounded-full" />
             </View>
          </View>
        </TouchableOpacity>

        {/* CURRENCY BAR */}
        <View className="flex-row items-center space-x-1.5">
          {/* COINS */}
          <View className="flex-row items-center bg-black/40 rounded-full h-8 pl-1 pr-0.5 border border-white/10">
            <FontAwesome6 name="coins" size={14} color="#f59e0b" />
            <Text className="text-white font-black text-[10px] px-2">73.2M</Text>
            <TouchableOpacity className="bg-game-accent rounded-full h-6 w-6 items-center justify-center">
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* GEMS */}
          <View className="flex-row items-center bg-black/40 rounded-full h-8 pl-1 pr-0.5 border border-white/10">
            <MaterialCommunityIcons name="diamond" size={16} color="#06b6d4" />
            <Text className="text-white font-black text-[10px] px-2">78.2K</Text>
            <TouchableOpacity className="bg-game-accent rounded-full h-6 w-6 items-center justify-center">
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SHOP & SETTINGS */}
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity>
            <Animated.View style={shopStyle}>
              <MaterialCommunityIcons name="cart-variant" size={26} color="#f59e0b" />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="settings-sharp" size={26} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

      </Animated.View>
    </View>
  );
}