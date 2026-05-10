import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export type FavoriteItem = { id: string; name: string };

type FavoritesCtx = {
  favorites: FavoriteItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
};

const Ctx = createContext<FavoritesCtx>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
});

const KEY = "@pokedex_favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((val) => {
        if (hydrated.current) return;
        hydrated.current = true;
        try {
          if (val) setFavorites(JSON.parse(val));
        } catch {}
      })
      .catch(() => { hydrated.current = true; });
  }, []);

  const toggleFavorite = (item: FavoriteItem) => {
    hydrated.current = true;
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id);
      const next = exists ? prev.filter((f) => f.id !== item.id) : [item, ...prev];
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  return <Ctx.Provider value={{ favorites, isFavorite, toggleFavorite }}>{children}</Ctx.Provider>;
}

export const useFavorites = () => useContext(Ctx);
