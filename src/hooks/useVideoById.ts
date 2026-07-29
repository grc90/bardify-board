import { useMemo } from "react";
import { useLibraryStore } from "../stores/libraryStore";
import type { SoundVideo } from "../types";

export function useVideoMap(): Map<string, SoundVideo> {
  const videos = useLibraryStore((s) => s.videos);
  return useMemo(() => new Map(videos.map((v) => [v.id, v])), [videos]);
}

export function useVideoById(id: string | undefined | null): SoundVideo | null {
  const map = useVideoMap();
  if (!id) return null;
  return map.get(id) ?? null;
}
