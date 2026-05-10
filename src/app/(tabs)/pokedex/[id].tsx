import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <View style={{ flex: 1 }} />;
}
