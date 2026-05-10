export type Pokemon = {
  name: string;
  url: string;
};

export type PokemonSpecies = {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
  capture_rate: number;
  base_happiness: number;
  egg_groups: { name: string }[];
  growth_rate: { name: string };
  habitat: { name: string } | null;
  gender_rate: number;
  is_legendary: boolean;
  is_mythical: boolean;
};

export type PokemonDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
};
