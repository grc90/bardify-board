import { useRef, useState } from "react";
import { useLibraryStore } from "../../stores/libraryStore";
import { usePlaylistsStore } from "../../stores/playlistsStore";
import { usePlaybackStore } from "../../stores/playbackStore";
import { useUIStore } from "../../stores/uiStore";
import { downloadJson } from "../../services/export";
import { LibraryImportModal } from "./LibraryImportModal";
import { ConfirmDialog } from "../common/ConfirmDialog";
import type { Playlist } from "../../types";

function isPlaylistLike(v: unknown): v is Playlist {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  return typeof p.name === "string" && Array.isArray(p.videoIds);
}

export function SettingsView() {
  const videos = useLibraryStore((s) => s.videos);
  const isCustomLibrary = useLibraryStore((s) => s.isCustomLibrary);
  const restoreDefault = useLibraryStore((s) => s.restoreDefault);
  const loadErrors = useLibraryStore((s) => s.loadErrors);

  const playlists = usePlaylistsStore((s) => s.playlists);
  const importPlaylist = usePlaylistsStore((s) => s.importPlaylist);

  const fadeSeconds = usePlaybackStore((s) => s.fadeSeconds);
  const setFadeSeconds = usePlaybackStore((s) => s.setFadeSeconds);

  const pushToast = useUIStore((s) => s.pushToast);
  const setShortcutsHelpOpen = useUIStore((s) => s.setShortcutsHelpOpen);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const playlistFileRef = useRef<HTMLInputElement>(null);

  async function handleImportPlaylists(file: File) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const items: unknown[] = Array.isArray(json) ? json : [json];
      const validIds = new Set(videos.map((v) => v.id));
      let imported = 0;
      let missingTotal = 0;
      for (const item of items) {
        if (!isPlaylistLike(item)) continue;
        const { missing } = await importPlaylist(item, validIds);
        imported++;
        missingTotal += missing.length;
      }
      if (imported === 0) {
        pushToast("El archivo no contiene playlists válidas.", "error");
      } else {
        pushToast(
          `${imported} playlist(s) importada(s)${missingTotal > 0 ? `. ${missingTotal} videos no encontrados en la biblioteca.` : "."}`,
        );
      }
    } catch {
      pushToast("No se pudo leer el archivo de playlists.", "error");
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-lg font-semibold text-neutral-100">Configuración</h1>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-200">Biblioteca musical</h2>
        <p className="mb-1 text-sm text-neutral-400">
          {videos.length} videos cargados · fuente: {isCustomLibrary ? "biblioteca importada" : "bardify-videos.json (predeterminada)"}
        </p>
        {loadErrors.length > 0 && (
          <p className="mb-2 text-xs text-amber-400">
            {loadErrors.length} filas se omitieron al cargar por errores de formato (revisa la consola).
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500"
          >
            Importar biblioteca (JSON/CSV)
          </button>
          <button
            type="button"
            onClick={() => downloadJson("bardify-library-export.json", videos)}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Exportar biblioteca (JSON)
          </button>
          {isCustomLibrary && (
            <button
              type="button"
              onClick={() => setConfirmRestore(true)}
              className="rounded-lg border border-amber-800/60 px-3 py-1.5 text-sm text-amber-300 hover:bg-amber-950/30"
            >
              Restaurar biblioteca predeterminada
            </button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-200">Playlists</h2>
        <p className="mb-3 text-sm text-neutral-400">{playlists.length} playlists guardadas.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadJson("bardify-playlists-export.json", playlists)}
            disabled={playlists.length === 0}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
          >
            Exportar todas (JSON)
          </button>
          <button
            type="button"
            onClick={() => playlistFileRef.current?.click()}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Importar playlist(s) (JSON)
          </button>
          <input
            ref={playlistFileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportPlaylists(file);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-200">Transiciones de audio</h2>
        <p className="mb-3 text-sm text-neutral-400">
          Antes de cambiar de pista se aplica un fundido de salida. YouTube no permite reproducir dos videos a la vez, así
          que un crossfade real no es viable: usamos fade-out + cambio de pista.
        </p>
        <label className="flex items-center gap-3 text-sm text-neutral-300">
          Duración del fade: <span className="tabular-nums text-neutral-100">{fadeSeconds}s</span>
          <input
            type="range"
            min={0}
            max={6}
            step={1}
            value={fadeSeconds}
            onChange={(e) => setFadeSeconds(Number(e.target.value))}
            className="w-40 accent-violet-500"
          />
        </label>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-200">Ayuda</h2>
        <button
          type="button"
          onClick={() => setShortcutsHelpOpen(true)}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
        >
          Ver atajos de teclado
        </button>
      </section>

      {importModalOpen && <LibraryImportModal onClose={() => setImportModalOpen(false)} />}
      {confirmRestore && (
        <ConfirmDialog
          title="Restaurar biblioteca predeterminada"
          message="Se reemplazará tu biblioteca importada por bardify-videos.json. Tus playlists conservarán referencias a videos que ya no existan como 'no encontrados'."
          confirmLabel="Restaurar"
          onConfirm={() => {
            restoreDefault();
            setConfirmRestore(false);
            pushToast("Biblioteca predeterminada restaurada.");
          }}
          onCancel={() => setConfirmRestore(false)}
        />
      )}
    </div>
  );
}
