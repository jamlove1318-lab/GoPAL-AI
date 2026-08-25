import { View, Text } from 'react-native';

export function StudyScene() {
  return (
    <View className="mt-4 flex-1 rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-base font-semibold text-slate-700">Study Scene</Text>
      <Text className="mt-1 text-slate-500">Contextual learning happens here.</Text>
    </View>
  );
}
