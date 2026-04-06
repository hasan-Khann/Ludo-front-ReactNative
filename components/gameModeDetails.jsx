import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function GameModeDetails({ selectedMode, onClose }) {
  const router = useRouter();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const [displayMode, setDisplayMode] = useState("2v2"); 

  const [selectedPlayers, setSelectedPlayers] = useState(2);
  const [isRanked, setIsRanked] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);

  useEffect(() => {
    if (selectedMode) {
      setDisplayMode(selectedMode);
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(measuredHeight || SCREEN_HEIGHT, { duration: 250 });
      opacity.value = withTiming(0, { duration: 250 });
    }
  }, [selectedMode, measuredHeight]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleStartMatch = () => {
    onClose?.();
    setTimeout(() => {
      router.push({
        pathname: displayMode === 'offline' ? "/offlineGame" : "/matchMaking",
        params: {
          mode: displayMode,
          players: displayMode === '2v2' ? 4 : selectedPlayers,
          ranked: isRanked ? 1 : 0,
          special: isSpecial ? 1 : 0,
        },
      });
    }, 300);
  };

  return (
    <View 
      style={StyleSheet.absoluteFillObject} 
      pointerEvents={selectedMode ? "auto" : "none"} 
      className="z-[999]"
    >
      {/* Backdrop */}
      <Animated.View 
        style={[StyleSheet.absoluteFillObject, backdropStyle, { backgroundColor: "rgba(0,0,0,0.85)" }]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Popover Content */}
      <Animated.View
        onLayout={(e) => setMeasuredHeight(e.nativeEvent.layout.height)}
        style={[containerStyle, styles.popover]}
        className="bg-game-surface px-6 pb-12 pt-4 border-t border-white/10"
      >
        <View className="w-12 h-1 bg-white/10 self-center rounded-full mb-8" />

        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-white text-3xl font-black italic uppercase tracking-tighter">
              {displayMode === 'offline' ? 'Local' : 'Online'}
            </Text>
            <Text className="text-game-primary font-bold text-[10px] uppercase tracking-[3px]">
               {displayMode} Mode
            </Text>
          </View>
          <Pressable onPress={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center">
            <Text className="text-white/40 text-lg font-bold">✕</Text>
          </Pressable>
        </View>

        {displayMode !== '2v2' && (
          <View className="flex-row gap-3 mb-8">
            {[2, 4].map((num) => (
              <Pressable
                key={num}
                onPress={() => setSelectedPlayers(num)}
                className={`flex-1 py-4 rounded-3xl items-center border-2 ${
                  selectedPlayers === num ? "bg-game-primary border-game-primary" : "bg-white/5 border-transparent"
                }`}
              >
                <Text className={`text-2xl font-black ${selectedPlayers === num ? "text-black" : "text-white/20"}`}>{num}</Text>
                <Text className={`text-[9px] uppercase font-black tracking-widest ${selectedPlayers === num ? "text-black/40" : "text-white/10"}`}>Players</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View className="bg-black/20 rounded-[32px] p-5 border border-white/5 mb-8">
           <ToggleRow label="Ranked Match" active={isRanked} onToggle={setIsRanked} />
           <View className="h-[1px] bg-white/5 my-4" />
           <ToggleRow label="Special Mode" active={isSpecial} onToggle={setIsSpecial} />
        </View>

        <Pressable onPress={handleStartMatch} className="bg-game-accent py-5 rounded-full">
          <Text className="text-center text-black font-black text-lg uppercase tracking-[4px]">Confirm</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const ToggleRow = ({ label, active, onToggle }) => (
  <View className="flex-row justify-between items-center">
    <Text className="text-white/80 text-lg font-bold">{label}</Text>
    <Pressable 
        onPress={() => onToggle(!active)}
        className={`w-12 h-7 rounded-full p-1 justify-center ${active ? 'bg-game-primary' : 'bg-white/10'}`}
    >
      <View className={`w-5 h-5 bg-white rounded-full ${active ? 'self-end' : 'self-start'}`} />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  popover: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  }
});