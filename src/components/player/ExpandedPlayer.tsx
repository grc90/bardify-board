import { usePlaybackStore } from "../../stores/playbackStore";
import { usePlayerController } from "../../context/PlayerControllerContext";
import { useUIStore } from "../../stores/uiStore";
import { useVideoById, useVideoMap } from "../../hooks/useVideoById";
import { formatTime } from "../../utils/format";
import { FavoriteButton } from "../common/FavoriteButton";
import { IconButton } from "../common/IconButton";
import { RepeatShuffleButtons } from "./RepeatShuffleButtons";

export function ExpandedPlayer() {
  const playerExpanded = useUIStore((s) => s.playerExpanded);
  const setPlayerExpanded = useUIStore((s) => s.setPlayerExpanded);
  const currentItem = usePlaybackStore((s) => (s.currentIndex >= 0 ? s.queue[s.currentIndex] : null));
  const queue = usePlaybackStore((s) => s.queue);
  const currentIndex = usePlaybackStore((s) => s.currentIndex);
  const playing = usePlaybackStore((s) => s.playing);
  const progress = usePlaybackStore((s) => s.progress);
  const duration = usePlaybackStore((s) => s.duration);
  const togglePlay = usePlaybackStore((s) => s.togglePlay);
  const controller = usePlayerController();
  const video = useVideoById(currentItem?.videoId);
  const videoMap = useVideoMap();

  if (!playerExpanded || !video || !currentItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-neutral-400">Reproduciendo ahora</span>
        <IconButton label="Cerrar reproductor expandido" onClick={() => setPlayerExpanded(false)}>
          ✕
        </IconButton>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-8 md:flex-row md:gap-8 md:px-10">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 md:mx-0 md:max-w-none md:flex-1">
          <img
            src={video.thumbnailUrl}
            alt={`Miniatura de ${video.title}`}
            className="aspect-video w-full max-w-md rounded-xl object-cover shadow-2xl"
          />
          <div className="w-full max-w-md text-center md:text-left">
            <h2 className="text-xl font-semibold text-neutral-100">{video.title}</h2>
            <div className="mt-1 flex flex-wrap justify-center gap-1 md:justify-start">
              {video.tags.map((t) => (
                <span key={t} className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-400">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md">
            <input
              type="range"
              min={0}
              max={Math.max(duration, 1)}
              value={progress}
              onChange={(e) => controller.requestSeek(Number(e.target.value))}
              aria-label="Progreso de la reproducción"
              className="h-1 w-full cursor-pointer accent-violet-500"
            />
            <div className="mt-1 flex justify-between text-xs text-neutral-500">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RepeatShuffleButtons />
            <IconButton label="Anterior" size="lg" onClick={controller.requestPrev}>
              ⏮
            </IconButton>
            <IconButton label={playing ? "Pausar" : "Reproducir"} size="lg" onClick={togglePlay}>
              <span className="text-2xl" aria-hidden>
                {playing ? "⏸" : "▶"}
              </span>
            </IconButton>
            <IconButton label="Siguiente" size="lg" onClick={controller.requestNext}>
              ⏭
            </IconButton>
            <FavoriteButton videoId={video.id} videoTitle={video.title} />
          </div>
          <button
            type="button"
            onClick={controller.openInYouTube}
            className="text-xs text-neutral-500 underline hover:text-neutral-300"
          >
            Abrir en YouTube ↗
          </button>
        </div>

        <div className="mt-8 w-full md:mt-0 md:w-96">
          <h3 className="mb-2 text-sm font-semibold text-neutral-300">Cola ({queue.length})</h3>
          <ul className="space-y-1">
            {queue.map((item, index) => {
              const v = videoMap.get(item.videoId);
              if (!v) return null;
              return (
                <li key={item.queueId}>
                  <button
                    type="button"
                    onClick={() => controller.requestJump(index)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left ${
                      index === currentIndex ? "bg-violet-950/40 text-violet-300" : "text-neutral-300 hover:bg-neutral-900"
                    }`}
                  >
                    <img src={v.thumbnailUrl} alt="" className="h-8 w-12 shrink-0 rounded object-cover" />
                    <span className="truncate text-xs">{v.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
