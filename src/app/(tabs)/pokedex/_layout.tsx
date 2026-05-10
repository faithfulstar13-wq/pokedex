import { Stack } from "expo-router";

export default function PokedexLayout() {
  return (
    <Stack screenOptions={{ title: "Pokédex" }}>
      <Stack.Screen name="index" options={{ title: "Pokédex" }} />  
      <Stack.Screen name="[id]" options={{ title: "Details" }} />
    </Stack>
  );
}
