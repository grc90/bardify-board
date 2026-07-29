import { create } from "zustand";
import type { QueueItem, RepeatMode } from "../types";
import { kvGet, kvSet } from "../services/storage/db";
import { prefs } from "../services/storage/prefs";
import { generateId } from "../utils/id";

interface QueueSnapshot {
  items: QueueItem[];
  currentIndex: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface PlaybackState {
  queue: QueueItem[];
  currentIndex: number;
  shuffleOrder: string[];
  shufflePos: number;

  playing: boolean;
  volume: number;
  muted: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  fadeSeconds: number;

  progress: number;
  duration: number;
  error: string | null;
  hydrated: boolean;

  init: () => Promise<void>;

  currentItem: () => QueueItem | null;

  addToQueue: (videoId: string) => void;
  addNext: (videoId: string) => void;
  addManyToQueue: (videoIds: string[]) => void;
  playImmediately: (videoId: string) => void;
  buildQueueFrom: (videoIds: string[], startVideoId: string) => void;
  removeFromQueue: (queueId: string) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  jumpTo: (index: number) => void;
  replaceQueue: (videoIds: string[], startIndex?: number) => void;

  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  next: () => void;
  prev: () => void;
  onEnded: () => "repeat" | "advanced" | "stopped";
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setFadeSeconds: (s: number) => void;
  setProgress: (p: number, d: number) => void;
  setError: (err: string | null) => void;
}

function persistQueue(items: QueueItem[], currentIndex: number) {
  void kvSet<QueueSnapshot>("queue", { items, currentIndex });
}

function buildShuffleOrder(queue: QueueItem[], keepFirstQueueId?: string): string[] {
  const ids = queue.map((q) => q.queueId);
  if (ids.length <= 1) return ids;
  if (keepFirstQueueId && ids.includes(keepFirstQueueId)) {
    const rest = ids.filter((id) => id !== keepFirstQueueId);
    return [keepFirstQueueId, ...shuffleArray(rest)];
  }
  return shuffleArray(ids);
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  shuffleOrder: [],
  shufflePos: 0,

  playing: false,
  volume: 70,
  muted: false,
  repeatMode: "off",
  shuffle: false,
  fadeSeconds: 2,

  progress: 0,
  duration: 0,
  error: null,
  hydrated: false,

  init: async () => {
    const snapshot = await kvGet<QueueSnapshot>("queue");
    const volume = prefs.volume.get();
    const muted = prefs.muted.get();
    const repeatMode = prefs.repeatMode.get();
    const shuffle = prefs.shuffle.get();
    const fadeSeconds = prefs.fadeSeconds.get();
    const queue = snapshot?.items ?? [];
    const currentIndex = snapshot?.currentIndex ?? -1;
    const shuffleOrder = shuffle ? buildShuffleOrder(queue, queue[currentIndex]?.queueId) : [];
    set({
      queue,
      currentIndex,
      volume,
      muted,
      repeatMode,
      shuffle,
      fadeSeconds,
      shuffleOrder,
      shufflePos: 0,
      hydrated: true,
    });
  },

  currentItem: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] ?? null;
  },

  addToQueue: (videoId) => {
    const item: QueueItem = { videoId, queueId: generateId("q"), addedAt: new Date().toISOString() };
    const queue = [...get().queue, item];
    set({ queue });
    if (get().shuffle) set({ shuffleOrder: [...get().shuffleOrder, item.queueId] });
    persistQueue(queue, get().currentIndex);
  },

  addNext: (videoId) => {
    const { queue, currentIndex } = get();
    const item: QueueItem = { videoId, queueId: generateId("q"), addedAt: new Date().toISOString() };
    const insertAt = currentIndex + 1;
    const next = [...queue.slice(0, insertAt), item, ...queue.slice(insertAt)];
    set({ queue: next });
    if (get().shuffle) {
      const order = [...get().shuffleOrder];
      order.splice(get().shufflePos + 1, 0, item.queueId);
      set({ shuffleOrder: order });
    }
    persistQueue(next, currentIndex);
  },

  addManyToQueue: (videoIds) => {
    const items: QueueItem[] = videoIds.map((videoId) => ({
      videoId,
      queueId: generateId("q"),
      addedAt: new Date().toISOString(),
    }));
    const queue = [...get().queue, ...items];
    set({ queue });
    if (get().shuffle) set({ shuffleOrder: [...get().shuffleOrder, ...items.map((i) => i.queueId)] });
    persistQueue(queue, get().currentIndex);
  },

  playImmediately: (videoId) => {
    const { queue, currentIndex } = get();
    const item: QueueItem = { videoId, queueId: generateId("q"), addedAt: new Date().toISOString() };
    const insertAt = currentIndex + 1;
    const next = [...queue.slice(0, insertAt), item, ...queue.slice(insertAt)];
    set({ queue: next, currentIndex: insertAt, playing: true, error: null });
    if (get().shuffle) {
      const order = [...get().shuffleOrder];
      const pos = get().shufflePos;
      order.splice(pos + 1, 0, item.queueId);
      set({ shuffleOrder: order, shufflePos: pos + 1 });
    }
    persistQueue(next, insertAt);
  },

  buildQueueFrom: (videoIds, startVideoId) => {
    const items: QueueItem[] = videoIds.map((videoId) => ({
      videoId,
      queueId: generateId("q"),
      addedAt: new Date().toISOString(),
    }));
    const startIndex = Math.max(
      0,
      items.findIndex((i) => i.videoId === startVideoId),
    );
    set({ queue: items, currentIndex: startIndex, playing: true, error: null });
    if (get().shuffle) {
      set({ shuffleOrder: buildShuffleOrder(items, items[startIndex]?.queueId), shufflePos: 0 });
    }
    persistQueue(items, startIndex);
  },

  replaceQueue: (videoIds, startIndex = 0) => {
    const items: QueueItem[] = videoIds.map((videoId) => ({
      videoId,
      queueId: generateId("q"),
      addedAt: new Date().toISOString(),
    }));
    set({ queue: items, currentIndex: startIndex, playing: items.length > 0, error: null });
    if (get().shuffle) {
      set({ shuffleOrder: buildShuffleOrder(items, items[startIndex]?.queueId), shufflePos: 0 });
    }
    persistQueue(items, startIndex);
  },

  removeFromQueue: (queueId) => {
    const { queue, currentIndex } = get();
    const removedIndex = queue.findIndex((q) => q.queueId === queueId);
    if (removedIndex === -1) return;
    const nextQueue = queue.filter((q) => q.queueId !== queueId);
    let nextIndex = currentIndex;
    if (removedIndex < currentIndex) nextIndex = currentIndex - 1;
    else if (removedIndex === currentIndex) nextIndex = Math.min(currentIndex, nextQueue.length - 1);
    set({
      queue: nextQueue,
      currentIndex: nextIndex,
      shuffleOrder: get().shuffleOrder.filter((id) => id !== queueId),
    });
    persistQueue(nextQueue, nextIndex);
  },

  clearQueue: () => {
    set({ queue: [], currentIndex: -1, playing: false, shuffleOrder: [], shufflePos: 0 });
    persistQueue([], -1);
  },

  reorderQueue: (fromIndex, toIndex) => {
    const { queue, currentIndex } = get();
    const currentQueueId = queue[currentIndex]?.queueId;
    const items = [...queue];
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    const nextIndex = currentQueueId ? items.findIndex((q) => q.queueId === currentQueueId) : currentIndex;
    set({ queue: items, currentIndex: nextIndex });
    persistQueue(items, nextIndex);
  },

  jumpTo: (index) => {
    const { queue } = get();
    if (index < 0 || index >= queue.length) return;
    set({ currentIndex: index, playing: true, error: null });
    if (get().shuffle) {
      const queueId = queue[index].queueId;
      const pos = get().shuffleOrder.indexOf(queueId);
      set({ shufflePos: pos === -1 ? 0 : pos });
    }
    persistQueue(queue, index);
  },

  togglePlay: () => set({ playing: !get().playing }),
  setPlaying: (playing) => set({ playing }),

  next: () => {
    const { queue, currentIndex, shuffle, repeatMode } = get();
    if (queue.length === 0) return;
    if (shuffle) {
      const { shuffleOrder, shufflePos } = get();
      if (shufflePos + 1 < shuffleOrder.length) {
        const nextPos = shufflePos + 1;
        const queueId = shuffleOrder[nextPos];
        const idx = queue.findIndex((q) => q.queueId === queueId);
        set({ shufflePos: nextPos, currentIndex: idx, playing: true, error: null });
        persistQueue(queue, idx);
      } else if (repeatMode === "all") {
        const order = buildShuffleOrder(queue, queue[currentIndex]?.queueId);
        const nextPos = order.length > 1 ? 1 : 0;
        const idx = queue.findIndex((q) => q.queueId === order[nextPos]);
        set({ shuffleOrder: order, shufflePos: nextPos, currentIndex: idx, playing: true, error: null });
        persistQueue(queue, idx);
      } else {
        set({ playing: false });
      }
      return;
    }
    if (currentIndex + 1 < queue.length) {
      const idx = currentIndex + 1;
      set({ currentIndex: idx, playing: true, error: null });
      persistQueue(queue, idx);
    } else if (repeatMode === "all") {
      set({ currentIndex: 0, playing: true, error: null });
      persistQueue(queue, 0);
    } else {
      set({ playing: false });
    }
  },

  prev: () => {
    const { queue, currentIndex, shuffle, repeatMode } = get();
    if (queue.length === 0) return;
    if (get().progress > 3) {
      set({ progress: 0 });
      return;
    }
    if (shuffle) {
      const { shuffleOrder, shufflePos } = get();
      if (shufflePos > 0) {
        const prevPos = shufflePos - 1;
        const queueId = shuffleOrder[prevPos];
        const idx = queue.findIndex((q) => q.queueId === queueId);
        set({ shufflePos: prevPos, currentIndex: idx, playing: true, error: null });
        persistQueue(queue, idx);
      }
      return;
    }
    if (currentIndex > 0) {
      const idx = currentIndex - 1;
      set({ currentIndex: idx, playing: true, error: null });
      persistQueue(queue, idx);
    } else if (repeatMode === "all") {
      const idx = queue.length - 1;
      set({ currentIndex: idx, playing: true, error: null });
      persistQueue(queue, idx);
    }
  },

  onEnded: () => {
    const { repeatMode } = get();
    if (repeatMode === "one") {
      set({ progress: 0 });
      return "repeat";
    }
    const before = get().currentIndex;
    get().next();
    return get().currentIndex !== before || get().playing ? "advanced" : "stopped";
  },

  cycleRepeat: () => {
    const next: RepeatMode = get().repeatMode === "one" ? "off" : "one";
    set({ repeatMode: next });
    prefs.repeatMode.set(next);
  },

  toggleShuffle: () => {
    const nextShuffle = !get().shuffle;
    if (nextShuffle) {
      const { queue, currentIndex } = get();
      set({ shuffle: true, shuffleOrder: buildShuffleOrder(queue, queue[currentIndex]?.queueId), shufflePos: 0 });
    } else {
      set({ shuffle: false, shuffleOrder: [], shufflePos: 0 });
    }
    prefs.shuffle.set(nextShuffle);
  },

  setVolume: (v) => {
    const volume = Math.max(0, Math.min(100, v));
    set({ volume, muted: volume === 0 ? get().muted : false });
    prefs.volume.set(volume);
  },

  toggleMute: () => {
    const muted = !get().muted;
    set({ muted });
    prefs.muted.set(muted);
  },

  setFadeSeconds: (s) => {
    const fadeSeconds = Math.max(0, Math.min(10, s));
    set({ fadeSeconds });
    prefs.fadeSeconds.set(fadeSeconds);
  },

  setProgress: (progress, duration) => set({ progress, duration }),
  setError: (error) => set({ error }),
}));
