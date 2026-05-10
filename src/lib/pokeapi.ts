import type { Pokemon, PokemonDetail, PokemonSpecies } from "../types/pokemon";
export type { Pokemon, PokemonDetail, PokemonSpecies };

export function getIdFromUrl(url: string) {
  return url.split("/").filter(Boolean).pop();
}

export async function fetchPokemonSpecies(id: string): Promise<PokemonSpecies> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  return res.json();
}

export async function fetchPokemonDetail(id: string): Promise<PokemonDetail> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return res.json();
}

export async function fetchPokemonList(): Promise<Pokemon[]> {
  const countRes = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1");
  const { count } = await countRes.json();
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${count}`);
  const data = await res.json();
  return data.results;
}
