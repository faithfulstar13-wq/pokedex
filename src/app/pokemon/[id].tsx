import { router, useLocalSearchParams } from "expo-router";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import PokemonDetailView from "../../components/PokemonDetailView";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_HEIGHT = SCREEN_HEIGHT * 0.78;
const CARD_WIDTH = SCREEN_WIDTH - 32;

export default function PokemonModalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => router.back()} />
      <View style={styles.card}>
        <PokemonDetailView id={id} onClose={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: "#fff", borderRadius: 20, overflow: "hidden" },
});
