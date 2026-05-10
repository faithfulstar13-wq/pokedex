import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useState } from "react";
import { Image, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavorites } from "../../../lib/favorites";

export default function FavoritesScreen() {
  const { bottom } = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState("");

  const filtered = query
    ? favorites.filter((f) => f.name.includes(query.toLowerCase().trim()))
    : favorites;

  if (favorites.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyHeart}>♡</Text>
        <Text style={styles.emptyText}>No favorites yet</Text>
        <Text style={styles.emptySubtext}>Tap the heart on any Pokémon to save it here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint="light" style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search favorites..."
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </BlurView>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: bottom + 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => router.push(`/pokedex/${item.id}`)}>
            <Image
              source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png` }}
              style={styles.sprite}
            />
            <Text style={styles.id}>#{item.id.padStart(3, "0")}</Text>
            <Text style={styles.name}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</Text>
            <TouchableOpacity
              onPress={() => toggleFavorite(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.heart}>★</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No favorites match "{query}"</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: {
    margin: 12,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 10 },
  clearText: { fontSize: 14, color: "rgba(0, 0, 0, 0.4)" },
  noResults: { flex: 1, alignItems: "center", paddingTop: 40 },
  noResultsText: { color: "#888", fontSize: 15 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  emptyHeart: { fontSize: 64, color: "#E3350D" },
  emptyText: { fontSize: 18, fontWeight: "700", color: "#333" },
  emptySubtext: { fontSize: 14, color: "#888", textAlign: "center", paddingHorizontal: 40 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16 },
  sprite: { width: 100, height: 100, marginRight: 8 },
  id: { width: 50, color: "#222", fontSize: 14, fontWeight: "bold" },
  name: { fontSize: 16, fontWeight: "500", flex: 1 },
  heart: { fontSize: 22, color: "#FFD700", paddingHorizontal: 8, textShadowColor: "#FFD700", textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } },
  separator: { height: 1, backgroundColor: "#eee" },
});
