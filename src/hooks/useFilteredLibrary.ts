import { useMemo } from "react";
import type { SoundVideo, TagMatchMode } from "../types";
import { matchesSearch, normalizeText } from "../utils/text";
import { useLibraryStore } from "../stores/libraryStore";
import { useUIStore } from "../stores/uiStore";
import { useFavoritesStore } from "../stores/favoritesStore";

export function matchesTagFilter(video: SoundVideo, tags: string[], mode: TagMatchMode): boolean {
  if (tags.length === 0) return true;
  const videoTags = new Set(video.tags.map(normalizeText));
  const normalizedTags = tags.map(normalizeText);
  return mode === "all" ? normalizedTags.every((t) => videoTags.has(t)) : normalizedTags.some((t) => videoTags.has(t));
}

interface FilteredLibraryResult {
  all: SoundVideo[];
  filtered: SoundVideo[];
  totalCount: number;
  resultCount: number;
}

/** Applies search, tag filters and favorites-only toggle to the active library. */
export function useFilteredLibrary(): FilteredLibraryResult {
  const videos = useLibraryStore((s) => s.videos);
  const search = useUIStore((s) => s.search);
  const selectedTags = useUIStore((s) => s.selectedTags);
  const tagMatchMode = useUIStore((s) => s.tagMatchMode);
  const favoritesOnly = useUIStore((s) => s.favoritesOnly);
  const favoriteIds = useFavoritesStore((s) => s.ids);

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      if (favoritesOnly && !favoriteIds.has(v.id)) return false;
      if (!matchesSearch([v.title, ...v.tags], search)) return false;
      if (!matchesTagFilter(v, selectedTags, tagMatchMode)) return false;
      return true;
    });
  }, [videos, search, selectedTags, tagMatchMode, favoritesOnly, favoriteIds]);

  return { all: videos, filtered, totalCount: videos.length, resultCount: filtered.length };
}
