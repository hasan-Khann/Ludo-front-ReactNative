import { ScrollView, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GameModes from '../../components/GameModes';
import Header from '../../components/header';
import LeagueAndLogo from '../../components/leagueAndLogo';

export default function App() {
  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-game-primary">
        <StatusBar barStyle="light-content" />
        <Header /> 
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <LeagueAndLogo />
          
          <View className="px-4 mt-2">
            <GameModes />
          </View>
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
}