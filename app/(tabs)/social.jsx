import { Dimensions, ScrollView, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function App() {
  const items = Array.from({ length: 10 });

  return (
    <View style={{ flex: 1 }}> 
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="mt-20 px-4">
          {items.map((_, i) => (
            <View 
              key={`product-card-${i}`}
              className="h-20 w-full bg-violet-600 rounded-xl mb-4 shadow-sm"
              style={{ backgroundColor: '#14b8a6' }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}