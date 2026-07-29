import { useMemo } from "react";
import type { SoundVideo } from "../types";
import { matchesSearch, normalizeText } from "../utils/text";
import { matchesTagFilter } from "./useFilteredLibrary";
import { useLibraryStore } from "../stores/libraryStore";
import { useUIStore } from "../stores/uiStore";
import { useFavoritesStore } from "../stores/favoritesStore";

export interface TagStat {
  tag: string;
  count: number;
  selected: boolean;
}

/** Computes tag chip stats, reacting to search/favorites/other-selected-tags but not to the tag's own selection. */
export function useTagStats(): TagStat[] {
  const videos = useLibraryStore((s) => s.videos);
  const search = useUIStore((s) => s.search);
  const selectedTags = useUIStore((s) => s.selectedTags);
  const tagMatchMode = useUIStore((s) => s.tagMatchMode);
  const tagSortMode = useUIStore((s) => s.tagSortMode);
  const tagSearch = useUIStore((s) => s.tagSearch);
  const favoritesOnly = useUIStore((s) => s.favoritesOnly);
  const favoriteIds = useFavoritesStore((s) => s.ids);

  return useMemo(() => {
    const base: SoundVideo[] = videos.filter((v) => {
      if (favoritesOnly && !favoriteIds.has(v.id)) return false;
      return matchesSearch([v.title, ...v.tags], search);
    });

    const allTags = new Map<string, string>();
    for (const v of videos) {
      for (const t of v.tags) allTags.set(normalizeText(t), t);
    }

    const selectedSet = new Set(selectedTags.map(normalizeText));

    let stats: TagStat[] = Array.from(allTags.entries()).map(([norm, original]) => {
      const otherSelected = selectedTags.filter((t) => normalizeText(t) !== norm);
      const count = base.filter(
        (v) => v.tags.some((t) => normalizeText(t) === norm) && matchesTagFilter(v, otherSelected, tagMatchMode),
      ).length;
      return { tag: original, count, selected: selectedSet.has(norm) };
    });

    if (tagSearch.trim()) {
      stats = stats.filter((s) => matchesSearch([s.tag], tagSearch));
    }

    stats = stats.filter((s) => s.count > 0 || s.selected);

    stats.sort((a, b) => {
      if (a.selected !== b.selected) return a.selected ? -1 : 1;
      if (tagSortMode === "alpha") return normalizeText(a.tag).localeCompare(normalizeText(b.tag));
      return b.count - a.count || normalizeText(a.tag).localeCompare(normalizeText(b.tag));
    });

    return stats;
  }, [videos, search, selectedTags, tagMatchMode, tagSortMode, tagSearch, favoritesOnly, favoriteIds]);
}
