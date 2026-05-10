import { Stack } from "expo-router";

const headerTheme = {
  headerStyle: { backgroundColor: "#E3350D" },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "bold" as const },
};

export default function PokedexLayout() {
  return (
    <Stack screenOptions={headerTheme}>
      <Stack.Screen name="index" options={{ title: "Pokédex" }} />
      <Stack.Screen name="[id]" options={{ title: "Details" }} />
    </Stack>
  );
}
