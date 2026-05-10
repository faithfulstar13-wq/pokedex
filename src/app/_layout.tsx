import { Stack } from "expo-router";
import { FavoritesProvider } from "../lib/favorites";

export default function RootLayout() {
  return (
    <FavoritesProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pokemon/[id]" options={{ presentation: "transparentModal", headerShown: false }} />
      </Stack>
    </FavoritesProvider>
  );
}
