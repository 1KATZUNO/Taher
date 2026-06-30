import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function TopBar({ title, right = null }) {
  return (
    <View className="h-16 px-4 flex-row items-center justify-between bg-surface border-b border-outline-variant/20">
      <View className="flex-row items-center gap-3">
        <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
          <MaterialIcons name="shield" size={20} color="#ffffff" />
        </View>
        <Text className="text-xl font-bold text-primary">{title}</Text>
      </View>
      {right}
    </View>
  );
}
