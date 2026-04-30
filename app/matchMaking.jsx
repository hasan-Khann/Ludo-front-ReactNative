import * as Device from 'expo-device';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

import { closeSocket, getSocket, sendMessage, subscribe } from "../Utils/socket";

const { width } = Dimensions.get("window");

const IMAGES = {
  "2and4": require("../assets/gamemodes/2and4.png"),
  "offline": require("../assets/gamemodes/offline.png"),
  "2v2": require("../assets/gamemodes/2v2.png"),
  "testing": require("../assets/gamemodes/2v2.png"),
};

export default function Matchmaking() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const totalPlayersNeeded = parseInt(params.players) || 2;
  const currentMode = params.mode || "testing";
  const isTestMode = currentMode === "testing";

  const [playersFound, setPlayersFound] = useState(1);
  const pulse = useSharedValue(1);
  const myPlayerId = useRef(null);

  const currentImage = IMAGES[currentMode] || IMAGES["2v2"];

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );

    const ws = getSocket();

    sendMessage({
      type: "join",
      mode: currentMode,
      player_max: isTestMode ? 4 : totalPlayersNeeded,
    });

    const unsub = subscribe((data) => {
      if (data.game) {
        const currentPlayers = Object.keys(data.game.players).length;
        setPlayersFound(currentPlayers);

        if (data.player_id && !myPlayerId.current) {
          myPlayerId.current = data.player_id;
        }

        if (data.state === true) {
          router.replace({
            pathname: "/online",
            params: {
              game_id: data.game_id,
              id: myPlayerId.current,
              test_mode: data.test_mode ? "1" : "0",
              bot_ids: data.bot_ids ? JSON.stringify(data.bot_ids) : "[]",
              check: `[${Device.brand} ${Device.modelName}]`
            },
          });
        }
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, [totalPlayersNeeded, currentMode]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.1], [0.3, 0.05]),
  }));

  const handleAbort = () => {
    if (myPlayerId.current) {
      sendMessage({
        type: "leave",
        player_id: myPlayerId.current,
      });
    }
    
    closeSocket(); 
    router.back();
  };

  return (
    <View className="flex-1 bg-game-surface items-center justify-between p-6 pt-20 pb-12">
      <View style={StyleSheet.absoluteFill} className="opacity-10">
        <Image source={currentImage} className="w-full h-full" resizeMode="cover" blurRadius={30} />
      </View>

      <View className="items-center">
        <Text className="text-white/40 text-[10px] uppercase tracking-[5px] mb-2">
          {isTestMode ? "Setting Up Test Game" : "Establishing Connection"}
        </Text>
        <Text className="text-white text-4xl font-black italic uppercase">
          {String(currentMode)}
        </Text>
      </View>

      <View className="items-center justify-center w-full">
        <Animated.View
          style={animatedPulseStyle}
          className="absolute w-80 h-80 rounded-full border-2 border-game-primary"
        />

        <View
          style={{ width: width * 0.75, aspectRatio: 1 }}
          className="rounded-[40px] overflow-hidden border border-white/10 bg-black/40 p-6 justify-center items-center shadow-2xl"
        >
          <Image
            source={currentImage}
            style={StyleSheet.absoluteFill}
            className="opacity-20"
            resizeMode="cover"
            blurRadius={8}
          />
          <Image source={currentImage} className="w-full h-full" resizeMode="contain" />

          <View className="absolute bottom-6 bg-game-accent/90 px-5 py-1.5 rounded-full border border-game-primary/50">
            <Text className="text-black font-black text-sm italic">
              {isTestMode ? "Filling bots..." : `${String(playersFound)} / ${String(totalPlayersNeeded)}`}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={handleAbort}
        className="w-full py-5 rounded-full border border-white/5 bg-white/5"
      >
        <Text className="text-center text-white/30 font-black text-xs uppercase tracking-[5px]">
          Abort Search
        </Text>
      </Pressable>
    </View>
  );
}