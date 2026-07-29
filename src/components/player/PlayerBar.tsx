import { useState } from "react";
import { usePlaybackStore } from "../../stores/playbackStore";
import { usePlayerController } from "../../context/PlayerControllerContext";
import { useUIStore } from "../../stores/uiStore";
import { useVideoById } from "../../hooks/useVideoById";
import { formatTime } from "../../utils/format";
import { FavoriteButton } from "../common/FavoriteButton";
import { IconButton } from "../common/IconButton";
import { RepeatShuffleButtons } from "./RepeatShuffleButtons";
import { AddToPlaylistModal } from "../playlists/AddToPlaylistModal";

export function PlayerBar() {
  const currentItem = usePlaybackStore((s) => (s.currentIndex >= 0 ? s.queue[s.currentIndex] : null));
  const playing = usePlaybackStore((s) => s.playing);
  const progress = usePlaybackStore((s) => s.progress);
  const duration = usePlaybackStore((s) => s.duration);
  const volume = usePlaybackStore((s) => s.volume);
  const muted = usePlaybackStore((s) => s.muted);
  const error = usePlaybackStore((s) => s.error);
  const setVolume = usePlaybackStore((s) => s.setVolume);
  const toggleMute = usePlaybackStore((s) => s.toggleMute);
  const togglePlay = usePlaybackStore((s) => s.togglePlay);
  const queueLength = usePlaybackStore((s) => s.queue.length);

  const controller = usePlayerController();
  const video = useVideoById(currentItem?.videoId);
  const toggleQueuePanel = useUIStore((s) => s.toggleQueuePanel);
  const setPlayerExpanded = useUIStore((s) => s.setPlayerExpanded);

  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);

  if (!video || !currentItem) {
    return (
      <div className="fixed inset-x-0 bottom-14 z-20 flex h-16 items-center justify-center border-t border-neutral-800 bg-neutral-950/95 px-4 text-xs text-neutral-500 backdrop-blur md:bottom-0">
        Selecciona un video de la biblioteca para empezar a reproducir música.
      </div>
    );
  }

  const shownProgress = dragProgress ?? progress;

  return (
    <>
      <div className="fixed inset-x-0 bottom-14 z-20 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur md:bottom-0">
        {error && (
          <div className="border-b border-red-900/50 bg-red-950/60 px-4 py-1 text-center text-xs text-red-300">{error}</div>
        )}
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 md:gap-4 md:px-6 md:py-3">
          <button
            type="button"
            onClick={() => setPlayerExpanded(true)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left md:flex-initial md:w-64"
            aria-label="Expandir reproductor"
          >
            <img
              src={video.thumbnailUrl}
              alt={`Miniatura de ${video.title}`}
              className="h-11 w-16 shrink-0 rounded-md object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-neutral-100">{video.title}</span>
              <span className="block truncate text-xs text-neutral-500">{video.tags.slice(0, 2).join(" · ")}</span>
            </span>
          </button>

          <div className="hidden flex-col items-center gap-1 md:flex md:flex-1">
            <div className="flex items-center gap-1">
              <RepeatShuffleButtons size="sm" />
              <IconButton label="Anterior" size="sm" onClick={controller.requestPrev} disabled={queueLength === 0}>
                ⏮
              </IconButton>
              <IconButton label={playing ? "Pausar" : "Reproducir"} onClick={togglePlay}>
                <span aria-hidden>{playing ? "⏸" : "▶"}</span>
              </IconButton>
              <IconButton label="Siguiente" size="sm" onClick={controller.requestNext} disabled={queueLength === 0}>
                ⏭
              </IconButton>
              <FavoriteButton videoId={video.id} videoTitle={video.title} size="sm" />
            </div>
            <div className="flex w-full items-center gap-2">
              <span className="w-9 text-right text-[10px] tabular-nums text-neutral-500">{formatTime(shownProgress)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(duration, 1)}
                value={shownProgress}
                onChange={(e) => setDragProgress(Number(e.target.value))}
                onMouseUp={(e) => {
                  controller.requestSeek(Number((e.target as HTMLInputElement).value));
                  setDragProgress(null);
                }}
                onTouchEnd={(e) => {
                  controller.requestSeek(Number((e.target as HTMLInputElement).value));
                  setDragProgress(null);
                }}
                aria-label="Progreso de la reproducción"
                className="h-1 flex-1 cursor-pointer accent-violet-500"
              />
              <span className="w-9 text-[10px] tabular-nums text-neutral-500">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <IconButton label={playing ? "Pausar" : "Reproducir"} onClick={togglePlay}>
              <span aria-hidden>{playing ? "⏸" : "▶"}</span>
            </IconButton>
            <IconButton label="Siguiente" size="sm" onClick={controller.requestNext} disabled={queueLength === 0}>
              ⏭
            </IconButton>
          </div>

          <div className="hidden items-center gap-1 md:flex md:w-64 md:justify-end">
            <IconButton label={muted ? "Activar sonido" : "Silenciar"} size="sm" onClick={toggleMute}>
              <span aria-hidden>{muted || volume === 0 ? "🔇" : "🔊"}</span>
            </IconButton>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volumen"
              className="h-1 w-20 cursor-pointer accent-violet-500"
            />
            <IconButton label="Añadir a playlist" size="sm" onClick={() => setPlaylistModalOpen(true)}>
              📚
            </IconButton>
            <IconButton label="Abrir en YouTube" size="sm" onClick={controller.openInYouTube}>
              ↗
            </IconButton>
            <IconButton label="Ver cola" size="sm" onClick={() => toggleQueuePanel()}>
              ▤
            </IconButton>
          </div>
        </div>
      </div>

      {playlistModalOpen && (
        <AddToPlaylistModal videoId={video.id} videoTitle={video.title} onClose={() => setPlaylistModalOpen(false)} />
      )}
    </>
  );
}
