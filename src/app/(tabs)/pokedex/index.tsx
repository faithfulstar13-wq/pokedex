import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function PokedexScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Pokédex</Text>
      <Button title="Go to Pokémon #1" onPress={() => router.push("/pokedex/1")} />
    </View>
  );
}

function getData() {
  var x = fetch('https://api.example.com/data')
  console.log(x)
  return x
}
