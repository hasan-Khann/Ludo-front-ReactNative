import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import GameModeDetails from './gameModeDetails';

export default function GameModes() {
  const [selectedMode, setSelectedMode] = useState(null);

  return (
    <View className="w-full px-4">
      {/* 2v2 Card */}
      <Pressable 
        onPress={() => setSelectedMode('2v2')} 
        className="w-full h-48 mb-4 rounded-[40px] overflow-hidden bg-game-surface border border-white/10 active:scale-[0.98] shadow-2xl"
      >
        <Image 
          source={require("../assets/gamemodes/2v2.png")}
          className="w-full h-full"
          resizeMode="stretch"
        />
      </Pressable>

      {/* Grid Modes */}
      <View className="flex-row w-row gap-4">
        <Pressable 
          onPress={() => setSelectedMode('2and4')} 
          className="flex-1 h-52 rounded-[40px] overflow-hidden bg-game-surface border border-white/10 active:scale-[0.97] shadow-lg"
        >
          <Image 
            source={require("../assets/gamemodes/2and4.png")}
            className="w-full h-full"
            resizeMode="stretch"
          />
        </Pressable>

        <Pressable 
          onPress={() => setSelectedMode('offline')}
          className="flex-1 h-52 rounded-[40px] overflow-hidden bg-game-surface border border-white/10 active:scale-[0.97] shadow-lg"
        >
          <Image 
            source={require("../assets/gamemodes/offline.png")}
            className="w-full h-full"
            resizeMode="stretch"
          />
        </Pressable>
      </View>

      <GameModeDetails 
        selectedMode={selectedMode} 
        onClose={() => setSelectedMode(null)} 
      />
    </View>
  );
}