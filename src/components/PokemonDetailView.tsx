import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  createAnimatedComponent,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

const AnimatedScrollView = createAnimatedComponent(ScrollView);
const AnimatedImage = createAnimatedComponent(Image);
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavorites } from "../lib/favorites";
import { fetchPokemonDetail, type PokemonDetail } from "../lib/pokeapi";
import PokemonStatsSheet from "../app/(tabs)/pokedex/stats/index";

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

function SkeletonLoader() {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const S = ({ style }: { style: object }) => (
    <Animated.View style={[skeletonStyles.block, style, { opacity }]} />
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} scrollEnabled={false}>
      <View style={skeletonStyles.hero}>
        <S style={{ width: 56, height: 14, alignSelf: "flex-start", marginLeft: 20, marginBottom: 16 }} />
        <S style={{ width: 200, height: 200, borderRadius: 100 }} />
      </View>
      <View style={{ padding: 20 }}>
        <S style={{ width: 180, height: 30, alignSelf: "center", marginBottom: 12, borderRadius: 10 }} />
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          <S style={{ width: 80, height: 30, borderRadius: 20 }} />
          <S style={{ width: 80, height: 30, borderRadius: 20 }} />
        </View>
        <View style={skeletonStyles.infoGrid}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ flex: 1, alignItems: "center", gap: 8 }}>
              <S style={{ width: 48, height: 12, borderRadius: 6 }} />
              <S style={{ width: 56, height: 18, borderRadius: 6 }} />
            </View>
          ))}
        </View>
        <S style={{ width: 72, height: 16, marginBottom: 12, borderRadius: 6 }} />
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 28 }}>
          <S style={{ width: 100, height: 36, borderRadius: 12 }} />
          <S style={{ width: 120, height: 36, borderRadius: 12 }} />
        </View>
        <S style={{ width: 82, height: 16, marginBottom: 12, borderRadius: 6 }} />
        {[...Array(6)].map((_, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 }}>
            <S style={{ width: 68, height: 13, borderRadius: 6 }} />
            <S style={{ width: 30, height: 13, borderRadius: 6 }} />
            <S style={{ flex: 1, height: 8, borderRadius: 4 }} />
          </View>
        ))}
        <S style={{ height: 48, borderRadius: 14, marginTop: 24 }} />
      </View>
    </ScrollView>
  );
}

interface Props {
  id: string;
  onClose?: () => void;
}

export default function PokemonDetailView({ id, onClose }: Props) {
  const { bottom } = useSafeAreaInsets();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const artworkStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-100, 0, 300],
          [-20, 0, 60],
          Extrapolation.CLAMP
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-200, 0, 200],
          [1.25, 1, 1.4],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setPokemon(null);
    fetchPokemonDetail(id)
      .then((data) => { if (!cancelled) setPokemon(data); })
      .catch(() => { if (!cancelled) setError("Failed to load Pokémon details. Check your connection and try again."); });
    return () => { cancelled = true; };
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!pokemon) {
    return <SkeletonLoader />;
  }

  const primaryType = pokemon.types[0].type.name;
  const bgColor = TYPE_COLORS[primaryType] ?? "#888";
  const artwork = pokemon.sprites.other["official-artwork"].front_default;
  const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>

      <AnimatedScrollView
        style={styles.scroll}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {!onClose && <Stack.Screen options={{ title: name }} />}

        <View style={[styles.hero, { backgroundColor: bgColor }]}>
          <Text style={styles.number}>#{String(pokemon.id).padStart(3, "0")}</Text>
          <AnimatedImage source={{ uri: artwork }} style={[styles.artwork, artworkStyle]} />
        </View>

        <View style={[styles.body, { paddingBottom: bottom + 80, backgroundColor: "#fff" }]}>
          <View style={styles.nameSection}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.types}>
              {pokemon.types.map(({ type }) => (
                <View key={type.name} style={[styles.badge, { backgroundColor: TYPE_COLORS[type.name] ?? "#888" }]}>
                  <Text style={styles.badgeText}>{type.name.toUpperCase()}</Text>
                </View>
              ))}
            </View>
            {!onClose && (
              <TouchableOpacity
                style={styles.favoriteBtn}
                onPress={() => toggleFavorite({ id: String(pokemon.id), name })}
              >
                <Text style={[styles.heartIcon, isFavorite(String(pokemon.id)) && styles.heartActive]}>
                  {isFavorite(String(pokemon.id)) ? "★" : "☆"}
                </Text>
                <Text style={styles.favoriteLabel}>{isFavorite(String(pokemon.id)) ? "Remove from Favorites" : "Add to Favorites"}</Text>
              </TouchableOpacity>
            )}
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
      </AnimatedScrollView>

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

const skeletonStyles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 56,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    backgroundColor: "#e8e8e8",
  },
  block: { backgroundColor: "#d0d0d0", borderRadius: 8 },
  infoGrid: {
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    borderRadius: 16,
    marginBottom: 28,
    paddingVertical: 16,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#E3350D", fontSize: 16, textAlign: "center", paddingHorizontal: 24 },


  hero: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 56,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
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
