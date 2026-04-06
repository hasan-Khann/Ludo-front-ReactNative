import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function Matchmaking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const totalPlayersNeeded = parseInt(params.players) || 2;
  const currentMode = params.mode || "2v2";

  const [playersFound, setPlayersFound] = useState(1);
  const pulse = useSharedValue(1);

  const images = {
    "2and4": require("../assets/gamemodes/2and4.png"),
    "offline": require("../assets/gamemodes/offline.png"),
    "2v2": require("../assets/gamemodes/2v2.png"),
  };

  const currentImage = images[currentMode] || images["2v2"];

  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.1, { duration: 1500 }), withTiming(1, { duration: 1500 })), -1, true);
    
    const interval = setInterval(() => {
      setPlayersFound(prev => prev < totalPlayersNeeded ? prev + 1 : prev);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [totalPlayersNeeded]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.1], [0.3, 0.05]),
  }));

  return (
    <View className="flex-1 bg-game-surface items-center justify-between p-6 pt-20 pb-12">
      {/* Dynamic Background */}
      <View style={StyleSheet.absoluteFill} className="opacity-10">
        <Image source={currentImage} className="w-full h-full" resizeMode="cover" blurRadius={30} />
      </View>

      <View className="items-center">
        <Text className="text-white/40 text-[10px] uppercase tracking-[5px] mb-2">Establishing Connection</Text>
        <Text className="text-white text-4xl font-black italic uppercase">{currentMode}</Text>
      </View>

      {/* Adaptive Image Container */}
      <View className="items-center justify-center w-full">
        <Animated.View style={animatedPulseStyle} className="absolute w-80 h-80 rounded-full border-2 border-game-primary" />
        
        <View 
          style={{ width: width * 0.75, aspectRatio: 1 }} 
          className="rounded-[40px] overflow-hidden border border-white/10 bg-black/40 p-6 justify-center items-center shadow-2xl"
        >
          {/* Background ghost image */}
          <Image source={currentImage} style={StyleSheet.absoluteFill} className="opacity-20" resizeMode="cover" blurRadius={8} />
          
          <Image 
            source={currentImage} 
            className="w-full h-full shadow-lg" 
            resizeMode="contain"
          />
          
          <View className="absolute bottom-6 bg-game-accent/90 px-5 py-1.5 rounded-full border border-game-primary/50">
             <Text className="text-black font-black text-sm italic">{playersFound} / {totalPlayersNeeded}</Text>
          </View>
        </View>
      </View>

      <View className="w-full px-6 flex-row justify-center gap-4">
        {[...Array(totalPlayersNeeded)].map((_, i) => (
          <View key={i} className={`w-14 h-16 rounded-2xl items-center justify-center border-2 ${i < playersFound ? 'bg-game-primary/10 border-game-primary' : 'bg-white/5 border-white/5 border-dashed'}`}>
             <Text className={i < playersFound ? "text-game-primary font-black" : "text-white/5"}>P{i+1}</Text>
          </View>
        ))}
      </View>

      <Pressable onPress={() => router.back()} className="w-full py-5 rounded-full border border-white/5 bg-white/5 active:bg-white/10 transition-colors">
        <Text className="text-center text-white/30 font-black text-xs uppercase tracking-[5px]">Abort Search</Text>
      </Pressable>
    </View>
  );
}