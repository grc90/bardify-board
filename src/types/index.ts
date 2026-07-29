export interface SoundVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  tags: string[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  videoIds: string[];
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
}

export interface QueueItem {
  videoId: string;
  queueId: string;
  addedAt: string;
}

export type RepeatMode = "off" | "one" | "all";

export type TagMatchMode = "all" | "any";

export interface PlaybackHistoryEntry {
  videoId: string;
  playCount: number;
  lastPlayedAt: string;
  firstPlayedAt: string;
}

export interface HistoryLogEntry {
  id: string;
  videoId: string;
  playedAt: string;
}

export type TagSortMode = "alpha" | "frequency";

export type LibraryViewMode = "grid" | "list";

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportResult {
  videos: SoundVideo[];
  errors: ImportRowError[];
  duplicates: string[];
}

export interface ToastMessage {
  id: string;
  text: string;
  kind: "success" | "error" | "info";
}
