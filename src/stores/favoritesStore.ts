import { create } from "zustand";
import { kvGet, kvSet } from "../services/storage/db";

interface FavoritesState {
  ids: Set<string>;
  loaded: boolean;
  init: () => Promise<void>;
  isFavorite: (videoId: string) => boolean;
  toggle: (videoId: string) => Promise<boolean>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: new Set(),
  loaded: false,

  init: async () => {
    const stored = await kvGet<string[]>("favorites");
    set({ ids: new Set(stored ?? []), loaded: true });
  },

  isFavorite: (videoId) => get().ids.has(videoId),

  toggle: async (videoId) => {
    const next = new Set(get().ids);
    let isNowFavorite: boolean;
    if (next.has(videoId)) {
      next.delete(videoId);
      isNowFavorite = false;
    } else {
      next.add(videoId);
      isNowFavorite = true;
    }
    set({ ids: next });
    await kvSet("favorites", Array.from(next));
    return isNowFavorite;
  },
}));
