import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchPokemonList, getIdFromUrl, type Pokemon } from "../../../lib/pokeapi";
import { useFavorites } from "../../../lib/favorites";
import PokedexListItem from "../../../components/PokedexListItem";

const SEARCH_HEIGHT = 52;

export default function PokedexScreen() {
  const { bottom } = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchAnim = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);
  const searchVisible = useRef(true);
  const searchFocused = useRef(false);

  const normalizedQuery = query.toLowerCase().trim().replace(/^#/, "");
  const filtered = normalizedQuery
    ? pokemon.filter((p) => {
        const id = getIdFromUrl(p.url);
        const paddedId = (id ?? "").padStart(3, "0");
        return p.name.toLowerCase().includes(normalizedQuery) || (id ?? "").includes(normalizedQuery) || paddedId.includes(normalizedQuery);
      })
    : pokemon;

  useEffect(() => {
    fetchPokemonList()
      .then(setPokemon)
      .catch(() => setError("Failed to load Pokémon. Check your connection and try again."))
      .finally(() => setLoading(false));
  }, []);

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const dy = y - lastScrollY.current;
    lastScrollY.current = y;
    if (searchFocused.current) return;
    if (dy > 5 && searchVisible.current && y > SEARCH_HEIGHT) {
      searchVisible.current = false;
      Animated.timing(searchAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    } else if (dy < -5 && !searchVisible.current) {
      searchVisible.current = true;
      Animated.timing(searchAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    }
  }, [searchAnim]);

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
    <View style={styles.root}>
      <Animated.View style={[styles.searchWrap, { height: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, SEARCH_HEIGHT] }) }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or number..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          returnKeyType="search"
          onFocus={() => { searchFocused.current = true; }}
          onBlur={() => { searchFocused.current = false; }}
        />
      </Animated.View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.name}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: bottom + 16 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const id = getIdFromUrl(item.url);
          if (!id) return null;
          return (
            <PokedexListItem
              id={id}
              name={item.name}
              isFavorite={isFavorite(id)}
              onPress={() => router.push(`/pokedex/${id}`)}
              onToggleFavorite={() => toggleFavorite({ id, name: item.name })}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#E3350D", fontSize: 16, textAlign: "center", paddingHorizontal: 24 },
  searchWrap: {
    backgroundColor: "#E3350D",
    overflow: "hidden",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  searchInput: {
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
    color: "#fff",
    fontSize: 15,
  },
  separator: { height: 1, backgroundColor: "#eee" },
});
