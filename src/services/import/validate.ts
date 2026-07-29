import type { ImportResult, ImportRowError, SoundVideo } from "../../types";
import { extractYouTubeId, thumbnailUrlFor } from "../../utils/youtube";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** Validates a loosely-typed array of candidate video records into clean SoundVideo entries. */
export function validateVideos(raw: unknown): ImportResult {
  const errors: ImportRowError[] = [];
  const duplicates: string[] = [];
  const seen = new Set<string>();
  const videos: SoundVideo[] = [];

  if (!Array.isArray(raw)) {
    return { videos: [], errors: [{ row: 0, message: "El archivo no contiene un array de videos." }], duplicates: [] };
  }

  raw.forEach((item, index) => {
    const row = index + 1;
    if (!item || typeof item !== "object") {
      errors.push({ row, message: "Elemento inválido: no es un objeto." });
      return;
    }
    const obj = item as Record<string, unknown>;
    if (!isNonEmptyString(obj.id)) {
      errors.push({ row, message: "Falta el campo 'id'." });
      return;
    }
    if (!isNonEmptyString(obj.title)) {
      errors.push({ row, message: `Video '${obj.id}': falta el campo 'title'.` });
      return;
    }
    if (!isNonEmptyString(obj.url)) {
      errors.push({ row, message: `Video '${obj.id}': falta el campo 'url'.` });
      return;
    }
    if (!Array.isArray(obj.tags) || !obj.tags.every((t) => typeof t === "string")) {
      errors.push({ row, message: `Video '${obj.id}': 'tags' debe ser un array de strings.` });
      return;
    }
    const id = obj.id.trim();
    if (seen.has(id)) {
      duplicates.push(id);
      errors.push({ row, message: `Video '${id}' duplicado, se omite.` });
      return;
    }
    const thumbnailUrl = isNonEmptyString(obj.thumbnailUrl) ? obj.thumbnailUrl : thumbnailUrlFor(extractYouTubeId(obj.url) ?? id);
    seen.add(id);
    videos.push({
      id,
      title: obj.title.trim(),
      url: obj.url.trim(),
      thumbnailUrl,
      tags: obj.tags.map((t) => t.trim()).filter(Boolean),
    });
  });

  return { videos, errors, duplicates };
}
