import Dexie, { type Table } from "dexie";
import type { Playlist, PlaybackHistoryEntry, HistoryLogEntry, SoundVideo } from "../../types";

export interface KVEntry {
  key: string;
  value: unknown;
}

export interface QueueRecord {
  key: "queue";
  items: { videoId: string; queueId: string; addedAt: string }[];
  currentIndex: number;
}

export interface FavoritesRecord {
  key: "favorites";
  ids: string[];
}

class BardifyDB extends Dexie {
  library!: Table<SoundVideo, string>;
  playlists!: Table<Playlist, string>;
  historyEntries!: Table<PlaybackHistoryEntry, string>;
  historyLog!: Table<HistoryLogEntry, string>;
  kv!: Table<KVEntry, string>;

  constructor() {
    super("bardify-board");
    this.version(1).stores({
      library: "id",
      playlists: "id, updatedAt",
      historyEntries: "videoId, lastPlayedAt",
      historyLog: "id, playedAt",
      kv: "key",
    });
  }
}

export const db = new BardifyDB();

export async function kvGet<T>(key: string): Promise<T | undefined> {
  const row = await db.kv.get(key);
  return row?.value as T | undefined;
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  await db.kv.put({ key, value });
}
