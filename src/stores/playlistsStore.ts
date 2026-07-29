import { create } from "zustand";
import type { Playlist } from "../types";
import { db } from "../services/storage/db";
import { generateId } from "../utils/id";

interface PlaylistsState {
  playlists: Playlist[];
  loaded: boolean;
  init: () => Promise<void>;
  create: (name: string, description?: string, videoIds?: string[]) => Promise<Playlist>;
  rename: (id: string, name: string) => Promise<void>;
  setDescription: (id: string, description: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<void>;
  addVideo: (playlistId: string, videoId: string) => Promise<boolean>;
  addVideos: (playlistId: string, videoIds: string[]) => Promise<number>;
  removeVideo: (playlistId: string, videoId: string) => Promise<void>;
  reorderVideos: (playlistId: string, fromIndex: number, toIndex: number) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;
  importPlaylist: (playlist: Playlist, validVideoIds: Set<string>) => Promise<{ playlist: Playlist; missing: string[] }>;
}

async function persist(playlist: Playlist) {
  await db.playlists.put(playlist);
}

export const usePlaylistsStore = create<PlaylistsState>((set, get) => ({
  playlists: [],
  loaded: false,

  init: async () => {
    const stored = await db.playlists.toArray();
    stored.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    set({ playlists: stored, loaded: true });
  },

  create: async (name, description, videoIds = []) => {
    const now = new Date().toISOString();
    const playlist: Playlist = {
      id: generateId("pl"),
      name: name.trim() || "Playlist sin título",
      description: description?.trim() || undefined,
      videoIds,
      createdAt: now,
      updatedAt: now,
    };
    await persist(playlist);
    set({ playlists: [playlist, ...get().playlists] });
    return playlist;
  },

  rename: async (id, name) => {
    const playlists = get().playlists.map((p) =>
      p.id === id ? { ...p, name: name.trim() || p.name, updatedAt: new Date().toISOString() } : p,
    );
    set({ playlists });
    const updated = playlists.find((p) => p.id === id);
    if (updated) await persist(updated);
  },

  setDescription: async (id, description) => {
    const playlists = get().playlists.map((p) =>
      p.id === id ? { ...p, description: description.trim() || undefined, updatedAt: new Date().toISOString() } : p,
    );
    set({ playlists });
    const updated = playlists.find((p) => p.id === id);
    if (updated) await persist(updated);
  },

  remove: async (id) => {
    await db.playlists.delete(id);
    set({ playlists: get().playlists.filter((p) => p.id !== id) });
  },

  duplicate: async (id) => {
    const source = get().playlists.find((p) => p.id === id);
    if (!source) return;
    const now = new Date().toISOString();
    const copy: Playlist = {
      ...source,
      id: generateId("pl"),
      name: `${source.name} (copia)`,
      createdAt: now,
      updatedAt: now,
      pinned: false,
    };
    await persist(copy);
    set({ playlists: [copy, ...get().playlists] });
  },

  addVideo: async (playlistId, videoId) => {
    const playlist = get().playlists.find((p) => p.id === playlistId);
    if (!playlist) return false;
    if (playlist.videoIds.includes(videoId)) return false;
    const updated = { ...playlist, videoIds: [...playlist.videoIds, videoId], updatedAt: new Date().toISOString() };
    set({ playlists: get().playlists.map((p) => (p.id === playlistId ? updated : p)) });
    await persist(updated);
    return true;
  },

  addVideos: async (playlistId, videoIds) => {
    const playlist = get().playlists.find((p) => p.id === playlistId);
    if (!playlist) return 0;
    const existing = new Set(playlist.videoIds);
    const toAdd = videoIds.filter((id) => !existing.has(id));
    if (toAdd.length === 0) return 0;
    const updated = { ...playlist, videoIds: [...playlist.videoIds, ...toAdd], updatedAt: new Date().toISOString() };
    set({ playlists: get().playlists.map((p) => (p.id === playlistId ? updated : p)) });
    await persist(updated);
    return toAdd.length;
  },

  removeVideo: async (playlistId, videoId) => {
    const playlist = get().playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    const updated = {
      ...playlist,
      videoIds: playlist.videoIds.filter((id) => id !== videoId),
      updatedAt: new Date().toISOString(),
    };
    set({ playlists: get().playlists.map((p) => (p.id === playlistId ? updated : p)) });
    await persist(updated);
  },

  reorderVideos: async (playlistId, fromIndex, toIndex) => {
    const playlist = get().playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    const ids = [...playlist.videoIds];
    const [moved] = ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, moved);
    const updated = { ...playlist, videoIds: ids, updatedAt: new Date().toISOString() };
    set({ playlists: get().playlists.map((p) => (p.id === playlistId ? updated : p)) });
    await persist(updated);
  },

  togglePinned: async (id) => {
    const playlist = get().playlists.find((p) => p.id === id);
    if (!playlist) return;
    const updated = { ...playlist, pinned: !playlist.pinned, updatedAt: new Date().toISOString() };
    set({ playlists: get().playlists.map((p) => (p.id === id ? updated : p)) });
    await persist(updated);
  },

  importPlaylist: async (playlist, validVideoIds) => {
    const missing = playlist.videoIds.filter((id) => !validVideoIds.has(id));
    const now = new Date().toISOString();
    const cleaned: Playlist = {
      ...playlist,
      id: generateId("pl"),
      videoIds: playlist.videoIds.filter((id) => validVideoIds.has(id)),
      createdAt: now,
      updatedAt: now,
      pinned: false,
    };
    await persist(cleaned);
    set({ playlists: [cleaned, ...get().playlists] });
    return { playlist: cleaned, missing };
  },
}));
