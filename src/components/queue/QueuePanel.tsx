import { useRef, useState } from "react";
import { usePlaybackStore } from "../../stores/playbackStore";
import { usePlayerController } from "../../context/PlayerControllerContext";
import { useUIStore } from "../../stores/uiStore";
import { useVideoMap } from "../../hooks/useVideoById";
import { usePlaylistsStore } from "../../stores/playlistsStore";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { IconButton } from "../common/IconButton";
import { EmptyState } from "../common/EmptyState";

export function QueuePanel() {
  const queuePanelOpen = useUIStore((s) => s.queuePanelOpen);
  const toggleQueuePanel = useUIStore((s) => s.toggleQueuePanel);
  const queue = usePlaybackStore((s) => s.queue);
  const currentIndex = usePlaybackStore((s) => s.currentIndex);
  const removeFromQueue = usePlaybackStore((s) => s.removeFromQueue);
  const clearQueue = usePlaybackStore((s) => s.clearQueue);
  const reorderQueue = usePlaybackStore((s) => s.reorderQueue);
  const controller = usePlayerController();
  const videoMap = useVideoMap();
  const createPlaylist = usePlaylistsStore((s) => s.create);
  const pushToast = useUIStore((s) => s.pushToast);

  const [confirmClear, setConfirmClear] = useState(false);
  const [savingAsPlaylist, setSavingAsPlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const dragIndex = useRef<number | null>(null);

  if (!queuePanelOpen) return null;

  async function handleSavePlaylist() {
    const name = playlistName.trim();
    if (!name) return;
    await createPlaylist(
      name,
      undefined,
      queue.map((q) => q.videoId),
    );
    pushToast(`Playlist "${name}" creada desde la cola.`);
    setSavingAsPlaylist(false);
    setPlaylistName("");
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end md:inset-auto md:bottom-24 md:right-4 md:top-4 md:w-96">
      <div className="absolute inset-0 bg-black/50 md:hidden" onClick={() => toggleQueuePanel(false)} />
      <div className="relative flex h-full w-full max-w-sm flex-col rounded-l-xl border border-neutral-800 bg-neutral-950 shadow-2xl md:h-full md:max-w-none md:rounded-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-100">Cola de reproducción ({queue.length})</h2>
          <IconButton label="Cerrar cola" size="sm" onClick={() => toggleQueuePanel(false)}>
            ✕
          </IconButton>
        </div>

        {queue.length === 0 ? (
          <div className="p-4">
            <EmptyState icon="🗒" title="La cola está vacía" description="Añade videos desde la biblioteca o una playlist." />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2">
              <button
                type="button"
                onClick={() => setSavingAsPlaylist(true)}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                Guardar como playlist
              </button>
              <span className="text-neutral-700">·</span>
              <button
                type="button"
                onClick={() => (queue.length > 1 ? setConfirmClear(true) : clearQueue())}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Vaciar cola
              </button>
            </div>

            {savingAsPlaylist && (
              <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2">
                <input
                  autoFocus
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSavePlaylist()}
                  placeholder="Nombre de la playlist"
                  className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-100 focus:border-violet-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSavePlaylist}
                  className="rounded-md bg-violet-600 px-2 py-1 text-xs font-medium text-white hover:bg-violet-500"
                >
                  Guardar
                </button>
              </div>
            )}

            <ul className="flex-1 overflow-y-auto p-2">
              {queue.map((item, index) => {
                const video = videoMap.get(item.videoId);
                if (!video) return null;
                const isCurrent = index === currentIndex;
                const isNext = index === currentIndex + 1;
                return (
                  <li
                    key={item.queueId}
                    draggable
                    onDragStart={() => (dragIndex.current = index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragIndex.current !== null && dragIndex.current !== index) {
                        reorderQueue(dragIndex.current, index);
                      }
                      dragIndex.current = null;
                    }}
                    className={`group mb-1 flex cursor-grab items-center gap-2 rounded-lg px-2 py-1.5 active:cursor-grabbing ${
                      isCurrent ? "bg-violet-950/40 ring-1 ring-violet-700/50" : "hover:bg-neutral-900"
                    }`}
                  >
                    <span className="w-4 shrink-0 text-center text-[10px] text-neutral-600" aria-hidden>
                      ⠿
                    </span>
                    <button
                      type="button"
                      onClick={() => controller.requestJump(index)}
                      className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-800"
                      aria-label={`Reproducir ${video.title}`}
                    >
                      <img src={video.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </button>
                    <button type="button" onClick={() => controller.requestJump(index)} className="min-w-0 flex-1 text-left">
                      <p className={`truncate text-xs font-medium ${isCurrent ? "text-violet-300" : "text-neutral-200"}`}>
                        {video.title}
                      </p>
                      <p className="truncate text-[10px] text-neutral-500">
                        {isCurrent ? "Sonando ahora" : isNext ? "Siguiente" : ""}
                      </p>
                    </button>
                    <IconButton
                      label={`Quitar ${video.title} de la cola`}
                      size="sm"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => removeFromQueue(item.queueId)}
                    >
                      ✕
                    </IconButton>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {confirmClear && (
        <ConfirmDialog
          title="Vaciar la cola"
          message={`Se eliminarán ${queue.length} videos de la cola. Esta acción no se puede deshacer.`}
          confirmLabel="Vaciar"
          onConfirm={() => {
            clearQueue();
            setConfirmClear(false);
          }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}
