import { create } from "zustand";
import type { HistoryLogEntry, PlaybackHistoryEntry } from "../types";
import { db } from "../services/storage/db";
import { generateId } from "../utils/id";

const MAX_LOG_ENTRIES = 200;

interface HistoryState {
  entries: Record<string, PlaybackHistoryEntry>;
  log: HistoryLogEntry[];
  loaded: boolean;
  init: () => Promise<void>;
  recordPlay: (videoId: string) => Promise<void>;
  removeLogEntry: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: {},
  log: [],
  loaded: false,

  init: async () => {
    const [entries, log] = await Promise.all([db.historyEntries.toArray(), db.historyLog.toArray()]);
    const entryMap: Record<string, PlaybackHistoryEntry> = {};
    for (const e of entries) entryMap[e.videoId] = e;
    log.sort((a, b) => b.playedAt.localeCompare(a.playedAt));
    set({ entries: entryMap, log, loaded: true });
  },

  recordPlay: async (videoId) => {
    const now = new Date().toISOString();
    const existing = get().entries[videoId];
    const updatedEntry: PlaybackHistoryEntry = existing
      ? { ...existing, playCount: existing.playCount + 1, lastPlayedAt: now }
      : { videoId, playCount: 1, lastPlayedAt: now, firstPlayedAt: now };

    const logEntry: HistoryLogEntry = { id: generateId("log"), videoId, playedAt: now };
    const nextLog = [logEntry, ...get().log].slice(0, MAX_LOG_ENTRIES);

    set({ entries: { ...get().entries, [videoId]: updatedEntry }, log: nextLog });

    await db.historyEntries.put(updatedEntry);
    await db.historyLog.put(logEntry);
    const overflow = await db.historyLog.orderBy("playedAt").reverse().offset(MAX_LOG_ENTRIES).toArray();
    if (overflow.length > 0) {
      await db.historyLog.bulkDelete(overflow.map((o) => o.id));
    }
  },

  removeLogEntry: async (id) => {
    await db.historyLog.delete(id);
    set({ log: get().log.filter((l) => l.id !== id) });
  },

  clearAll: async () => {
    await db.historyEntries.clear();
    await db.historyLog.clear();
    set({ entries: {}, log: [] });
  },
}));
