import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  id: string;
  name: string;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export default function PokedexListItem({ id, name, isFavorite, onPress, onToggleFavorite }: Props) {
  return (
    <TouchableOpacity style={[styles.row, isFavorite && styles.rowFavorite]} onPress={onPress}>
      <Image
        source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` }}
        style={styles.sprite}
      />
      <Text style={styles.id}>#{id}</Text>
      <Text style={styles.name}>{name.charAt(0).toUpperCase() + name.slice(1)}</Text>
      <TouchableOpacity onPress={onToggleFavorite} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={[styles.star, isFavorite && styles.starActive]}>{isFavorite ? "★" : "☆"}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16 },
  rowFavorite: { backgroundColor: "rgba(255, 215, 0, 0.12)" },
  sprite: { width: 100, height: 100, marginRight: 8 },
  id: { width: 50, color: "#222", fontSize: 14, fontWeight: "bold" },
  name: { fontSize: 16, fontWeight: "500", flex: 1 },
  star: { fontSize: 22, color: "#ccc", paddingHorizontal: 8 },
  starActive: { color: "#FFD700", textShadowColor: "#FFD700", textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } },
});
