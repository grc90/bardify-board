import { useState } from "react";
import { Modal } from "../common/Modal";
import { useLibraryStore } from "../../stores/libraryStore";
import { useUIStore } from "../../stores/uiStore";
import { validateVideos } from "../../services/import/validate";
import { parseCsvVideos } from "../../services/import/csv";
import type { ImportResult } from "../../types";

interface LibraryImportModalProps {
  onClose: () => void;
}

export function LibraryImportModal({ onClose }: LibraryImportModalProps) {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<"add" | "replace">("add");
  const addVideos = useLibraryStore((s) => s.addVideos);
  const setLibrary = useLibraryStore((s) => s.setLibrary);
  const pushToast = useUIStore((s) => s.pushToast);

  async function handleFile(file: File) {
    setFileName(file.name);
    const text = await file.text();
    if (file.name.toLowerCase().endsWith(".csv")) {
      setResult(parseCsvVideos(text));
    } else {
      try {
        const json = JSON.parse(text);
        setResult(validateVideos(json));
      } catch {
        setResult({ videos: [], errors: [{ row: 0, message: "El archivo no contiene JSON válido." }], duplicates: [] });
      }
    }
  }

  async function handleConfirm() {
    if (!result || result.videos.length === 0) return;
    if (mode === "replace") {
      await setLibrary(result.videos, true);
      pushToast(`Biblioteca reemplazada con ${result.videos.length} videos.`);
    } else {
      const { added, skipped } = await addVideos(result.videos);
      pushToast(`${added} videos añadidos${skipped > 0 ? `, ${skipped} ya existían` : ""}.`);
    }
    onClose();
  }

  return (
    <Modal title="Importar biblioteca" onClose={onClose} widthClass="max-w-lg">
      {!result ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-neutral-400">
            Selecciona un archivo <span className="text-neutral-200">.json</span> (array de videos con id, title, url,
            thumbnailUrl, tags) o <span className="text-neutral-200">.csv</span> (columnas Título, URL, Tags normalizadas).
          </p>
          <input
            type="file"
            accept=".json,.csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            aria-label="Seleccionar archivo para importar"
            className="rounded-md border border-dashed border-neutral-700 bg-neutral-900 p-4 text-sm text-neutral-300 file:mr-3 file:rounded-md file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:text-white"
          />
        </div>
      ) : (
        <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto">
          <p className="text-sm text-neutral-300">
            <span className="font-medium text-neutral-100">{fileName}</span>: {result.videos.length} videos válidos
            {result.errors.length > 0 && `, ${result.errors.length} filas con problemas`}
            {result.duplicates.length > 0 && `, ${result.duplicates.length} duplicados omitidos`}.
          </p>

          {result.videos.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-md border border-neutral-800 p-2">
              <ul className="space-y-1 text-xs text-neutral-400">
                {result.videos.slice(0, 15).map((v) => (
                  <li key={v.id} className="truncate">
                    {v.title} · {v.tags.slice(0, 3).join(", ")}
                  </li>
                ))}
                {result.videos.length > 15 && <li>... y {result.videos.length - 15} más</li>}
              </ul>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="max-h-32 overflow-y-auto rounded-md border border-red-900/50 bg-red-950/20 p-2">
              <ul className="space-y-1 text-xs text-red-300">
                {result.errors.slice(0, 20).map((e, i) => (
                  <li key={i}>
                    Fila {e.row}: {e.message}
                  </li>
                ))}
                {result.errors.length > 20 && <li>... y {result.errors.length - 20} más</li>}
              </ul>
            </div>
          )}

          {result.videos.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-1.5">
                <input type="radio" checked={mode === "add"} onChange={() => setMode("add")} /> Añadir a la biblioteca actual
              </label>
              <label className="flex items-center gap-1.5">
                <input type="radio" checked={mode === "replace"} onChange={() => setMode("replace")} /> Reemplazar biblioteca
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setResult(null)}
              className="rounded-md px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              Elegir otro archivo
            </button>
            <button
              type="button"
              disabled={result.videos.length === 0}
              onClick={handleConfirm}
              className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
            >
              Confirmar importación
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
