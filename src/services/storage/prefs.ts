const PREFIX = "bardify-board:";

function readPref<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`No se pudo leer la preferencia '${key}'.`, err);
    return fallback;
  }
}

function writePref<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`No se pudo guardar la preferencia '${key}'.`, err);
  }
}

export const prefs = {
  volume: { get: () => readPref("volume", 70), set: (v: number) => writePref("volume", v) },
  muted: { get: () => readPref("muted", false), set: (v: boolean) => writePref("muted", v) },
  repeatMode: {
    get: () => readPref<"off" | "one" | "all">("repeatMode", "off"),
    set: (v: "off" | "one" | "all") => writePref("repeatMode", v),
  },
  shuffle: { get: () => readPref("shuffle", false), set: (v: boolean) => writePref("shuffle", v) },
  fadeSeconds: { get: () => readPref("fadeSeconds", 2), set: (v: number) => writePref("fadeSeconds", v) },
  viewMode: {
    get: () => readPref<"grid" | "list">("viewMode", "grid"),
    set: (v: "grid" | "list") => writePref("viewMode", v),
  },
  tagMatchMode: {
    get: () => readPref<"all" | "any">("tagMatchMode", "all"),
    set: (v: "all" | "any") => writePref("tagMatchMode", v),
  },
  tagSortMode: {
    get: () => readPref<"alpha" | "frequency">("tagSortMode", "frequency"),
    set: (v: "alpha" | "frequency") => writePref("tagSortMode", v),
  },
  filtersOpen: { get: () => readPref("filtersOpen", true), set: (v: boolean) => writePref("filtersOpen", v) },
  queuePanelOpen: { get: () => readPref("queuePanelOpen", false), set: (v: boolean) => writePref("queuePanelOpen", v) },
  sessionMode: { get: () => readPref("sessionMode", false), set: (v: boolean) => writePref("sessionMode", v) },
};
