import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { WorldSceneStage } from './WorldSceneStage';

export function WorldSceneInteractionLayer({ worldId, placeId, residentId, showResident, onExplore }: { worldId: any; placeId: string; residentId?: string; showResident: boolean; onExplore: () => void }) {
  return <View className="absolute inset-0">
    <WorldSceneStage worldId={worldId} placeId={placeId} residentId={residentId} showResident={showResident} />
    {!showResident && <View className="absolute inset-x-8 top-[30%] bottom-[22%]">
      <Pressable accessibilityRole="button" accessibilityLabel="Explore this place" onPress={onExplore} className="absolute inset-0 items-center justify-center rounded-[36px] border border-emerald-300/10 bg-transparent">
        <View className="rounded-full border border-emerald-200/20 bg-black/35 px-4 py-2.5">
          <View className="flex-row items-center"><MapPin size={15} color="#a7f3d0"/><Text className="ml-2 text-xs font-bold text-emerald-100">Explore the surroundings</Text></View>
        </View>
      </Pressable>
    </View>}
  </View>;
}
