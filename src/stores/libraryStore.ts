import { create } from "zustand";
import type { ImportRowError, SoundVideo } from "../types";
import { db } from "../services/storage/db";
import { validateVideos } from "../services/import/validate";
import defaultVideosRaw from "../data/bardify-videos.json";

interface LibraryState {
  videos: SoundVideo[];
  loading: boolean;
  error: string | null;
  loadErrors: ImportRowError[];
  isCustomLibrary: boolean;
  init: () => Promise<void>;
  setLibrary: (videos: SoundVideo[], custom: boolean) => Promise<void>;
  restoreDefault: () => Promise<void>;
  addVideos: (videos: SoundVideo[]) => Promise<{ added: number; skipped: number }>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  videos: [],
  loading: true,
  error: null,
  loadErrors: [],
  isCustomLibrary: false,

  init: async () => {
    set({ loading: true, error: null });
    try {
      const stored = await db.library.toArray();
      const meta = await db.kv.get("library-is-custom");
      if (stored.length > 0 && meta?.value) {
        set({ videos: stored, loading: false, isCustomLibrary: true, loadErrors: [] });
        return;
      }
      const { videos, errors } = validateVideos(defaultVideosRaw);
      if (videos.length === 0) {
        set({ loading: false, error: "La biblioteca predeterminada no contiene videos válidos.", loadErrors: errors });
        return;
      }
      if (errors.length > 0) {
        console.error("Errores al validar la biblioteca predeterminada:", errors);
      }
      await db.library.bulkPut(videos);
      set({ videos, loading: false, isCustomLibrary: false, loadErrors: errors });
    } catch (err) {
      console.error("Error al cargar la biblioteca:", err);
      set({ loading: false, error: "No se pudo cargar la biblioteca. Revisa la consola para más detalles." });
    }
  },

  setLibrary: async (videos, custom) => {
    try {
      await db.library.clear();
      await db.library.bulkPut(videos);
      await db.kv.put({ key: "library-is-custom", value: custom });
      set({ videos, isCustomLibrary: custom, error: null });
    } catch (err) {
      console.error("Error al guardar la biblioteca localmente:", err);
      set({ error: "No se pudo guardar la biblioteca localmente." });
    }
  },

  restoreDefault: async () => {
    const { videos, errors } = validateVideos(defaultVideosRaw);
    await get().setLibrary(videos, false);
    set({ loadErrors: errors });
  },

  addVideos: async (newVideos) => {
    const existing = get().videos;
    const existingIds = new Set(existing.map((v) => v.id));
    const toAdd = newVideos.filter((v) => !existingIds.has(v.id));
    const merged = [...existing, ...toAdd];
    await get().setLibrary(merged, true);
    return { added: toAdd.length, skipped: newVideos.length - toAdd.length };
  },
}));
