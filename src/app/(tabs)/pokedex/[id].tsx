import { useLocalSearchParams } from "expo-router";
import PokemonDetailView from "../../../components/PokemonDetailView";

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PokemonDetailView id={id} />;
}
