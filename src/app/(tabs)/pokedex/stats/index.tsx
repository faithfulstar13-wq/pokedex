import { useEffect, useRef, useState } from "react";
import {
  Animated, ActivityIndicator, Dimensions, PanResponder,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchPokemonDetail, fetchPokemonSpecies, type PokemonDetail, type PokemonSpecies } from "../../../../lib/pokeapi";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HALF = SCREEN_HEIGHT * 0.5;
const FULL = SCREEN_HEIGHT * 0.92;

const STAT_LABELS: Record<string, string> = {
  hp: "HP", attack: "ATK", defense: "DEF",
  "special-attack": "SP.ATK", "special-defense": "SP.DEF", speed: "SPD",
};

const STAT_COLORS: Record<string, string> = {
  hp: "#FF5959", attack: "#F5AC78", defense: "#FAE078",
  "special-attack": "#9DB7F5", "special-defense": "#A7DB8D", speed: "#FA92B2",
};

function GenderBar({ genderRate }: { genderRate: number }) {
  if (genderRate === -1) return <Text style={styles.metaValue}>Genderless</Text>;
  const femalePercent = (genderRate / 8) * 100;
  const malePercent = 100 - femalePercent;
  return (
    <View>
      <View style={styles.genderBar}>
        <View style={[styles.genderFill, { flex: malePercent, backgroundColor: "#6390F0" }]} />
        <View style={[styles.genderFill, { flex: femalePercent, backgroundColor: "#F95587" }]} />
      </View>
      <View style={styles.genderLabels}>
        <Text style={[styles.genderLabel, { color: "#6390F0" }]}>♂ {malePercent.toFixed(1)}%</Text>
        <Text style={[styles.genderLabel, { color: "#F95587" }]}>♀ {femalePercent.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

type Props = { id: string; color: string; onClose: () => void };

export default function PokemonStatsSheet({ id, color, onClose }: Props) {
  const { bottom } = useSafeAreaInsets();
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isExpandedRef = useRef(false);

  const animProgress = useRef(new Animated.Value(0)).current;
  const sheetHeight = useRef(new Animated.Value(HALF)).current;
  const currentHeight = useRef(HALF);

  const expandToFull = () => {
    Animated.spring(sheetHeight, { toValue: FULL, useNativeDriver: false }).start();
    currentHeight.current = FULL;
    isExpandedRef.current = true;
  };

  const collapseToHalf = () => {
    Animated.spring(sheetHeight, { toValue: HALF, useNativeDriver: false }).start();
    currentHeight.current = HALF;
    isExpandedRef.current = false;
  };

  // Grabber: drag up expands, drag down collapses or closes
  const grabberPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gs) => {
      const next = currentHeight.current - gs.dy;
      sheetHeight.setValue(Math.min(FULL, Math.max(HALF, next)));
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dy > 60) {
        if (isExpandedRef.current) {
          collapseToHalf();
        } else {
          onClose();
        }
      } else if (gs.dy < -40 || currentHeight.current - gs.dy > (HALF + FULL) / 2) {
        expandToFull();
      } else {
        Animated.spring(sheetHeight, { toValue: currentHeight.current, useNativeDriver: false }).start();
      }
    },
  })).current;


  useEffect(() => {
    let cancelled = false;
    setError(null);
    setSpecies(null);
    setPokemon(null);
    Promise.all([fetchPokemonSpecies(id), fetchPokemonDetail(id)])
      .then(([speciesData, pokemonData]) => {
        if (cancelled) return;
        setSpecies(speciesData);
        setPokemon(pokemonData);
        animProgress.setValue(0);
        Animated.spring(animProgress, { toValue: 1, friction: 4, tension: 40, useNativeDriver: false }).start();
      })
      .catch(() => { if (!cancelled) setError("Failed to load data."); });
    return () => { cancelled = true; };
  }, [id]);

  const flavorText = species?.flavor_text_entries
    .find((e) => e.language.name === "en")
    ?.flavor_text.replace(/\f/g, " ");

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
        <View style={styles.grabberArea} {...grabberPan.panHandlers}>
          <View style={styles.grabber} />
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={[styles.closeBtnText, { color }]}>Done</Text>
        </TouchableOpacity>

        {error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !species || !pokemon ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={color} />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={[styles.scroll, { paddingBottom: bottom + 24 }]}
              onScrollBeginDrag={() => { if (!isExpandedRef.current) expandToFull(); }}
              onScrollEndDrag={(e) => {
                if (e.nativeEvent.contentOffset.y < -50) onClose();
              }}
              scrollEventThrottle={16}
            >
              {(species.is_legendary || species.is_mythical) && (
                <View style={[styles.badge, { backgroundColor: color }]}>
                  <Text style={styles.badgeText}>{species.is_mythical ? "✦ Mythical" : "★ Legendary"}</Text>
                </View>
              )}

              {flavorText && (
                <View style={styles.flavorCard}>
                  <Text style={styles.flavorQuote}>"</Text>
                  <Text style={styles.flavorText}>{flavorText}</Text>
                </View>
              )}

              <Text style={styles.sectionTitle}>Base Stats</Text>
              <View style={styles.statsContainer}>
                {pokemon.stats.map(({ stat, base_stat }) => {
                  const statColor = STAT_COLORS[stat.name] ?? color;
                  const pct = Math.round((base_stat / 255) * 100);
                  return (
                    <View key={stat.name} style={[styles.statCard, { borderLeftColor: statColor }]}>
                      <View style={styles.statCardHeader}>
                        <Text style={[styles.statCardLabel, { color: statColor }]}>{STAT_LABELS[stat.name] ?? stat.name}</Text>
                        <Text style={styles.statCardValue}>{base_stat}</Text>
                        <Text style={styles.statCardPct}>{pct}% of max</Text>
                      </View>
                      <View style={styles.statBarTrack}>
                        <Animated.View
                          style={[styles.statBarFill, {
                            backgroundColor: statColor,
                            width: animProgress.interpolate({ inputRange: [0, 1], outputRange: ["0%", `${pct}%`] }),
                          }]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.sectionTitle}>Training</Text>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Catch Rate</Text>
                  <Text style={styles.value}>{species.capture_rate}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(species.capture_rate / 255) * 100}%`, backgroundColor: color }]} />
                </View>
                <View style={[styles.row, styles.rowTop]}>
                  <Text style={styles.label}>Base Happiness</Text>
                  <Text style={styles.value}>{species.base_happiness}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(species.base_happiness / 255) * 100}%`, backgroundColor: color }]} />
                </View>
                <View style={[styles.row, styles.rowTop]}>
                  <Text style={styles.label}>Growth Rate</Text>
                  <Text style={styles.metaValue}>{species.growth_rate.name.replace(/-/g, " ")}</Text>
                </View>
                {species.habitat && (
                  <View style={[styles.row, styles.rowTop]}>
                    <Text style={styles.label}>Habitat</Text>
                    <Text style={styles.metaValue}>{species.habitat.name.replace(/-/g, " ")}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.sectionTitle}>Breeding</Text>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Egg Groups</Text>
                  <Text style={styles.metaValue}>{species.egg_groups.map((g) => g.name.replace(/-/g, " ")).join(", ")}</Text>
                </View>
                <View style={[styles.row, styles.rowTop]}>
                  <Text style={styles.label}>Gender Ratio</Text>
                </View>
                <GenderBar genderRate={species.gender_rate} />
              </View>
            </ScrollView>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden" },
  grabberArea: { alignItems: "center", paddingVertical: 12 },
  grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#ccc" },
  closeBtn: { alignSelf: "flex-end", paddingHorizontal: 20, paddingBottom: 8 },
  closeBtnText: { fontWeight: "600", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#E3350D", fontSize: 16, textAlign: "center", paddingHorizontal: 24 },
  scroll: { padding: 20 },
  badge: { alignSelf: "center", borderRadius: 20, paddingHorizontal: 18, paddingVertical: 6, marginBottom: 20 },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  flavorCard: { backgroundColor: "#f7f7f7", borderRadius: 16, padding: 20, marginBottom: 28 },
  flavorQuote: { fontSize: 40, color: "#ddd", lineHeight: 36, marginBottom: 4 },
  flavorText: { fontSize: 15, lineHeight: 22, color: "#444", fontStyle: "italic" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 10 },
  statsContainer: { gap: 10, marginBottom: 24 },
  statCard: { backgroundColor: "#f7f7f7", borderRadius: 12, borderLeftWidth: 4, padding: 12, gap: 6 },
  statCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  statCardLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3, flex: 1 },
  statCardValue: { fontSize: 16, fontWeight: "800" },
  statCardPct: { fontSize: 12, color: "#999" },
  statBarTrack: { width: "100%", height: 8, backgroundColor: "#e0e0e0", borderRadius: 4, overflow: "hidden" },
  statBarFill: { height: "100%", borderRadius: 4 },
  card: { backgroundColor: "#f7f7f7", borderRadius: 16, padding: 16, marginBottom: 24 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowTop: { marginTop: 14 },
  label: { fontSize: 14, color: "#666" },
  value: { fontSize: 14, fontWeight: "700" },
  metaValue: { fontSize: 14, fontWeight: "600", textTransform: "capitalize", color: "#333" },
  barTrack: { height: 8, backgroundColor: "#e0e0e0", borderRadius: 4, overflow: "hidden", marginTop: 6 },
  barFill: { height: "100%", borderRadius: 4 },
  genderBar: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", marginTop: 8 },
  genderFill: { height: "100%" },
  genderLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  genderLabel: { fontSize: 13, fontWeight: "600" },
});
