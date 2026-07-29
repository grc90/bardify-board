import { create } from "zustand";
import type { LibraryViewMode, TagMatchMode, TagSortMode, ToastMessage } from "../types";
import { prefs } from "../services/storage/prefs";
import { generateId } from "../utils/id";

export type Section = "library" | "playlists" | "favorites" | "history" | "settings";

interface UIState {
  section: Section;
  setSection: (s: Section) => void;

  search: string;
  setSearch: (v: string) => void;

  selectedTags: string[];
  toggleTag: (tag: string) => void;
  clearTags: () => void;

  tagMatchMode: TagMatchMode;
  setTagMatchMode: (m: TagMatchMode) => void;

  tagSortMode: TagSortMode;
  setTagSortMode: (m: TagSortMode) => void;

  tagSearch: string;
  setTagSearch: (v: string) => void;

  viewMode: LibraryViewMode;
  setViewMode: (m: LibraryViewMode) => void;

  filtersOpen: boolean;
  toggleFilters: () => void;

  queuePanelOpen: boolean;
  toggleQueuePanel: (force?: boolean) => void;

  playerExpanded: boolean;
  setPlayerExpanded: (v: boolean) => void;

  sessionMode: boolean;
  toggleSessionMode: () => void;

  favoritesOnly: boolean;
  toggleFavoritesOnly: () => void;

  shortcutsHelpOpen: boolean;
  setShortcutsHelpOpen: (v: boolean) => void;

  toasts: ToastMessage[];
  pushToast: (text: string, kind?: ToastMessage["kind"]) => void;
  dismissToast: (id: string) => void;

  init: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  section: "library",
  setSection: (section) => set({ section }),

  search: "",
  setSearch: (search) => set({ search }),

  selectedTags: [],
  toggleTag: (tag) => {
    const { selectedTags } = get();
    set({
      selectedTags: selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag],
    });
  },
  clearTags: () => set({ selectedTags: [] }),

  tagMatchMode: "all",
  setTagMatchMode: (tagMatchMode) => {
    set({ tagMatchMode });
    prefs.tagMatchMode.set(tagMatchMode);
  },

  tagSortMode: "frequency",
  setTagSortMode: (tagSortMode) => {
    set({ tagSortMode });
    prefs.tagSortMode.set(tagSortMode);
  },

  tagSearch: "",
  setTagSearch: (tagSearch) => set({ tagSearch }),

  viewMode: "grid",
  setViewMode: (viewMode) => {
    set({ viewMode });
    prefs.viewMode.set(viewMode);
  },

  filtersOpen: true,
  toggleFilters: () => {
    const filtersOpen = !get().filtersOpen;
    set({ filtersOpen });
    prefs.filtersOpen.set(filtersOpen);
  },

  queuePanelOpen: false,
  toggleQueuePanel: (force) => {
    const queuePanelOpen = force ?? !get().queuePanelOpen;
    set({ queuePanelOpen });
    prefs.queuePanelOpen.set(queuePanelOpen);
  },

  playerExpanded: false,
  setPlayerExpanded: (playerExpanded) => set({ playerExpanded }),

  sessionMode: false,
  toggleSessionMode: () => {
    const sessionMode = !get().sessionMode;
    set({ sessionMode });
    prefs.sessionMode.set(sessionMode);
  },

  favoritesOnly: false,
  toggleFavoritesOnly: () => set({ favoritesOnly: !get().favoritesOnly }),

  shortcutsHelpOpen: false,
  setShortcutsHelpOpen: (shortcutsHelpOpen) => set({ shortcutsHelpOpen }),

  toasts: [],
  pushToast: (text, kind = "success") => {
    const id = generateId("toast");
    set({ toasts: [...get().toasts, { id, text, kind }] });
    setTimeout(() => get().dismissToast(id), 3200);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  init: () => {
    set({
      tagMatchMode: prefs.tagMatchMode.get(),
      tagSortMode: prefs.tagSortMode.get(),
      viewMode: prefs.viewMode.get(),
      filtersOpen: prefs.filtersOpen.get(),
      queuePanelOpen: prefs.queuePanelOpen.get(),
      sessionMode: prefs.sessionMode.get(),
    });
  },
}));
