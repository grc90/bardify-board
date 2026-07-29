const DIACRITICS_RE = new RegExp("[̀-ͯ]", "g");

/** Lowercases, strips diacritics and collapses whitespace for search matching. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function matchesSearch(haystacks: string[], query: string): boolean {
  const q = normalizeText(query);
  if (!q) return true;
  return haystacks.some((h) => normalizeText(h).includes(q));
}
