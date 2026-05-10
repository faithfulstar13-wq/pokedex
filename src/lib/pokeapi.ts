import type { Pokemon } from "../types/pokemon";
export type { Pokemon };

export function getIdFromUrl(url: string) {
  return url.split("/").filter(Boolean).pop();
}

export async function fetchPokemonList(): Promise<Pokemon[]> {
  const countRes = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1");
  const { count } = await countRes.json();
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${count}`);
  const data = await res.json();
  return data.results;
}
