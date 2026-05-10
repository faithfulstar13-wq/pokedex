import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchPokemonList, getIdFromUrl, type Pokemon } from "../../../lib/pokeapi";
import { useFavorites } from "../../../lib/favorites";

export default function PokedexScreen() {
  const { bottom } = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtered = query
    ? pokemon.filter((p) => p.name.includes(query.toLowerCase().trim()))
    : pokemon;

  useEffect(() => {
    fetchPokemonList()
      .then(setPokemon)
      .catch(() => setError("Failed to load Pokémon. Check your connection and try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint="light" style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search Pokémon..."
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
      keyExtractor={(item) => item.name}
      contentContainerStyle={{ paddingBottom: bottom + 16 }}
      renderItem={({ item }) => {
        const id = getIdFromUrl(item.url);
        return (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/pokedex/${id}`)}
          >
            <Image
              source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` }}
              style={styles.sprite}
            />
            <Text style={styles.id}>#{id}</Text>
            <Text style={styles.name}>
              {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </Text>
            <TouchableOpacity
              onPress={() => toggleFavorite({ id: id!, name: item.name })}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.heart, isFavorite(id!) && styles.heartActive]}>{isFavorite(id!) ? "★" : "☆"}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      }}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  clearText: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.4)",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#E3350D", fontSize: 16, textAlign: "center", paddingHorizontal: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sprite: { width: 100, height: 100, marginRight: 8 },
  id: { width: 50, color: "#222", fontSize: 14, fontWeight: "bold" },
  name: { fontSize: 16, fontWeight: "500", flex: 1 },
  heart: { fontSize: 22, color: "#ccc", paddingHorizontal: 8 },
  heartActive: { color: "#FFD700", textShadowColor: "#FFD700", textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } },
  separator: { height: 1, backgroundColor: "#eee" },
});
