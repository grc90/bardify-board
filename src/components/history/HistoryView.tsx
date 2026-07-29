import { useState } from "react";
import { useHistoryStore } from "../../stores/historyStore";
import { useVideoMap } from "../../hooks/useVideoById";
import { usePlayerController } from "../../context/PlayerControllerContext";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { IconButton } from "../common/IconButton";
import { EmptyState } from "../common/EmptyState";

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function HistoryView() {
  const log = useHistoryStore((s) => s.log);
  const entries = useHistoryStore((s) => s.entries);
  const removeLogEntry = useHistoryStore((s) => s.removeLogEntry);
  const clearAll = useHistoryStore((s) => s.clearAll);
  const videoMap = useVideoMap();
  const controller = usePlayerController();
  const [confirmClear, setConfirmClear] = useState(false);

  const mostPlayed = Object.values(entries)
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 8);

  if (log.length === 0) {
    return (
      <EmptyState
        icon="🕓"
        title="El historial está vacío"
        description="Aquí verás los videos que reproduzcas durante tus sesiones."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-100">Historial</h1>
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Limpiar historial
        </button>
      </div>

      {mostPlayed.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-neutral-400">Más reproducidos</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {mostPlayed.map((entry) => {
              const video = videoMap.get(entry.videoId);
              if (!video) return null;
              return (
                <button
                  key={entry.videoId}
                  type="button"
                  onClick={() => controller.requestPlayImmediate(video.id)}
                  className="flex w-32 shrink-0 flex-col gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-2 text-left hover:border-violet-600/60"
                >
                  <img src={video.thumbnailUrl} alt="" className="aspect-video w-full rounded-md object-cover" />
                  <span className="line-clamp-1 text-xs font-medium text-neutral-200">{video.title}</span>
                  <span className="text-[11px] text-neutral-500">{entry.playCount} reproducciones</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-neutral-400">Reproducciones recientes</h2>
        <ul className="flex flex-col gap-1">
          {log.map((logEntry) => {
            const video = videoMap.get(logEntry.videoId);
            const stats = entries[logEntry.videoId];
            if (!video) return null;
            return (
              <li
                key={logEntry.id}
                className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-neutral-900"
              >
                <img src={video.thumbnailUrl} alt="" className="h-10 w-16 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-100">{video.title}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {formatDateTime(logEntry.playedAt)}
                    {stats && ` · ${stats.playCount} reproducciones totales`}
                  </p>
                </div>
                <IconButton label={`Reproducir ${video.title}`} size="sm" onClick={() => controller.requestPlayImmediate(video.id)}>
                  ▶
                </IconButton>
                <IconButton
                  label="Eliminar del historial"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => removeLogEntry(logEntry.id)}
                >
                  ✕
                </IconButton>
              </li>
            );
          })}
        </ul>
      </div>

      {confirmClear && (
        <ConfirmDialog
          title="Limpiar historial"
          message="Se eliminará todo el historial de reproducción y los contadores asociados. Esta acción no se puede deshacer."
          confirmLabel="Limpiar"
          onConfirm={() => {
            clearAll();
            setConfirmClear(false);
          }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}
