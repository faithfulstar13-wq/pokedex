import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavorites } from "../../../lib/favorites";
import { fetchPokemonDetail, type PokemonDetail } from "../../../lib/pokeapi";
import PokemonStatsSheet from "./stats/index";

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F7D02C",
  grass: "#7AC74C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
  ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
  rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
  steel: "#B7B7CE", fairy: "#D685AD",
};

const STAT_COLORS: Record<string, string> = {
  hp: "#FF5959",
  attack: "#F5AC78",
  defense: "#FAE078",
  "special-attack": "#9DB7F5",
  "special-defense": "#A7DB8D",
  speed: "#FA92B2",
};

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SP.ATK",
  "special-defense": "SP.DEF",
  speed: "SPD",
};


export default function PokemonDetailScreen() {
  const { bottom } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchPokemonDetail(id)
      .then(setPokemon)
      .catch(() => setError("Failed to load Pokémon details. Check your connection and try again."));
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!pokemon) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E3350D" />
      </View>
    );
  }

  const primaryType = pokemon.types[0].type.name;
  const bgColor = TYPE_COLORS[primaryType] ?? "#888";
  const artwork = pokemon.sprites.other["official-artwork"].front_default;
  const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <View style={styles.root}>
    <ScrollView style={styles.scroll}>
      <Stack.Screen options={{ title: name }} />

      <View style={[styles.hero, { backgroundColor: bgColor }]}>
        <Text style={styles.number}>#{String(pokemon.id).padStart(3, "0")}</Text>
        <Image source={{ uri: artwork }} style={styles.artwork} />
      </View>

      <View style={[styles.body, { paddingBottom: bottom + 80 }]}>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.types}>
            {pokemon.types.map(({ type }) => (
              <View key={type.name} style={[styles.badge, { backgroundColor: TYPE_COLORS[type.name] ?? "#888" }]}>
                <Text style={styles.badgeText}>{type.name.toUpperCase()}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={() => toggleFavorite({ id: String(pokemon.id), name })}
          >
            <Text style={[styles.heartIcon, isFavorite(String(pokemon.id)) && styles.heartActive]}>
              {isFavorite(String(pokemon.id)) ? "★" : "☆"}
            </Text>
            <Text style={styles.favoriteLabel}>Add to Favorites</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Height</Text>
            <Text style={styles.infoValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Weight</Text>
            <Text style={styles.infoValue}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Base EXP</Text>
            <Text style={styles.infoValue}>{pokemon.base_experience ?? "—"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Abilities</Text>
        <View style={styles.abilities}>
          {pokemon.abilities.map(({ ability, is_hidden }) => (
            <View key={ability.name} style={[styles.abilityBadge, is_hidden && styles.hiddenBadge]}>
              <Text style={styles.abilityText}>
                {ability.name.replace(/-/g, " ")}
                {is_hidden ? "  (hidden)" : ""}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Base Stats</Text>
        {pokemon.stats.map(({ stat, base_stat }) => (
          <View key={stat.name} style={styles.statRow}>
            <Text style={styles.statLabel}>{STAT_LABELS[stat.name] ?? stat.name}</Text>
            <Text style={styles.statValue}>{base_stat}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(base_stat / 255) * 100}%`, backgroundColor: STAT_COLORS[stat.name] ?? bgColor }]} />
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.moreBtn, { backgroundColor: bgColor }]}
          onPress={() => setShowStats(true)}
        >
          <Text style={styles.moreBtnText}>Pokédex Entry & Breeding Info</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

    <Modal
      visible={showStats}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowStats(false)}
    >
      <PokemonStatsSheet
        id={String(pokemon.id)}
        color={bgColor}
        onClose={() => setShowStats(false)}
      />
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#E3350D", fontSize: 16, textAlign: "center", paddingHorizontal: 24 },

  hero: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 56,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  number: { color: "rgba(255,255,255,0.7)", fontSize: 16, fontWeight: "600", alignSelf: "flex-start", marginLeft: 20 },
  artwork: { width: 240, height: 240 },

  body: { padding: 20 },

  nameSection: { alignItems: "center", marginBottom: 24 },
  name: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  types: { flexDirection: "row", justifyContent: "center", gap: 8 },
  favoriteBtn: { position: "absolute", right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", gap: 4 },
  heartIcon: { fontSize: 26, color: "#ccc" },
  heartActive: { color: "#FFD700", textShadowColor: "#FFD700", textShadowRadius: 10, textShadowOffset: { width: 0, height: 0 } },
  favoriteLabel: { fontSize: 11, color: "#888", fontWeight: "500" },
  badge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 13, letterSpacing: 0.5 },

  infoGrid: {
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    borderRadius: 16,
    marginBottom: 28,
    paddingVertical: 16,
  },
  infoCell: { flex: 1, alignItems: "center" },
  infoDivider: { width: 1, backgroundColor: "#e0e0e0" },
  infoLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: "700" },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#333" },

  abilities: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 },
  abilityBadge: { backgroundColor: "#f0f0f0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  hiddenBadge: { borderWidth: 1, borderColor: "#ccc", borderStyle: "dashed" },
  abilityText: { fontSize: 14, fontWeight: "500", textTransform: "capitalize" },

  statRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  statLabel: { width: 68, fontSize: 13, fontWeight: "600", color: "#555" },
  statValue: { width: 36, fontSize: 13, fontWeight: "700", textAlign: "right", marginRight: 10 },
  barTrack: { flex: 1, height: 8, backgroundColor: "#eee", borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
  moreBtn: {
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  moreBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
