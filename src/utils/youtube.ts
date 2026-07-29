const YT_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/** Extracts an 11-character YouTube video ID from a full URL, short URL, or bare ID. */
export function extractYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (YT_ID_RE.test(value)) return value;

  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace(/^\//, "").split("/")[0];
      return YT_ID_RE.test(id) ? id : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && YT_ID_RE.test(v)) return v;
      const shortsMatch = url.pathname.match(/\/(shorts|embed)\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[2];
    }
  } catch {
    // not a URL, fall through
  }
  return null;
}

export function thumbnailUrlFor(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function watchUrlFor(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
