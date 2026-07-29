import type { ImportResult, ImportRowError, SoundVideo } from "../../types";
import { extractYouTubeId, thumbnailUrlFor } from "../../utils/youtube";

/** Minimal RFC4180-ish CSV line parser supporting quoted fields with commas/escaped quotes. */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function parseCsvRows(text: string): string[][] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  return lines.filter((l) => l.length > 0).map(parseCsvLine);
}

const HEADER_ALIASES: Record<string, string[]> = {
  title: ["título", "titulo", "title"],
  url: ["url"],
  tags: ["tags normalizadas (10)", "tags", "tag"],
};

function findColumn(headers: string[], key: keyof typeof HEADER_ALIASES): number {
  const normalized = headers.map((h) => h.trim().toLowerCase());
  const aliases = HEADER_ALIASES[key];
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseCsvVideos(text: string): ImportResult {
  const rows = parseCsvRows(text);
  const errors: ImportRowError[] = [];
  const duplicates: string[] = [];

  if (rows.length === 0) {
    return { videos: [], errors: [{ row: 0, message: "El archivo CSV está vacío." }], duplicates: [] };
  }

  const headers = rows[0];
  const titleCol = findColumn(headers, "title");
  const urlCol = findColumn(headers, "url");
  const tagsCol = findColumn(headers, "tags");

  if (titleCol === -1 || urlCol === -1 || tagsCol === -1) {
    return {
      videos: [],
      errors: [{ row: 0, message: "El CSV debe incluir columnas de título, URL y tags." }],
      duplicates: [],
    };
  }

  const seen = new Set<string>();
  const videos: SoundVideo[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    if (row.every((cell) => cell.trim() === "")) continue;

    const title = row[titleCol]?.trim() ?? "";
    const url = row[urlCol]?.trim() ?? "";
    const tagsRaw = row[tagsCol]?.trim() ?? "";

    if (!title) {
      errors.push({ row: rowNum, message: "Falta el título." });
      continue;
    }
    if (!url) {
      errors.push({ row: rowNum, message: `Fila '${title}': falta la URL.` });
      continue;
    }
    const id = extractYouTubeId(url);
    if (!id) {
      errors.push({ row: rowNum, message: `Fila '${title}': no se pudo extraer el ID de YouTube de la URL.` });
      continue;
    }
    if (seen.has(id)) {
      duplicates.push(id);
      errors.push({ row: rowNum, message: `Video '${id}' duplicado, se omite.` });
      continue;
    }
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    seen.add(id);
    videos.push({
      id,
      title,
      url,
      thumbnailUrl: thumbnailUrlFor(id),
      tags,
    });
  }

  return { videos, errors, duplicates };
}
