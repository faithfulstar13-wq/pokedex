import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  id: string;
  name: string;
  onPress: () => void;
  onRemove: () => void;
};

export default function FavoriteListItem({ id, name, onPress, onRemove }: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Image
        source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` }}
        style={styles.sprite}
      />
      <Text style={styles.id}>#{id}</Text>
      <Text style={styles.name}>{name.charAt(0).toUpperCase() + name.slice(1)}</Text>
      <Pressable
        onPress={(e) => { e.stopPropagation(); onRemove(); }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.star}>★</Text>
      </Pressable>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16 },
  sprite: { width: 100, height: 100, marginRight: 8 },
  id: { width: 50, color: "#222", fontSize: 14, fontWeight: "bold" },
  name: { fontSize: 16, fontWeight: "500", flex: 1 },
  star: { fontSize: 22, color: "#FFD700", paddingHorizontal: 8, textShadowColor: "#FFD700", textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } },
});
