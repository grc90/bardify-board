import { useState } from "react";
import type { SoundVideo } from "../../types";
import { usePlaybackStore } from "../../stores/playbackStore";
import { usePlayerController } from "../../context/PlayerControllerContext";
import { useUIStore } from "../../stores/uiStore";
import { FavoriteButton } from "../common/FavoriteButton";
import { IconButton } from "../common/IconButton";
import { DropdownMenu } from "../common/DropdownMenu";
import { TagList } from "./TagList";
import { AddToPlaylistModal } from "../playlists/AddToPlaylistModal";

interface VideoCardProps {
  video: SoundVideo;
  visibleIds: string[];
  compact?: boolean;
}

export function VideoCard({ video, visibleIds, compact = false }: VideoCardProps) {
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const currentVideoId = usePlaybackStore((s) => s.queue[s.currentIndex]?.videoId);
  const playing = usePlaybackStore((s) => s.playing);
  const addToQueue = usePlaybackStore((s) => s.addToQueue);
  const addNext = usePlaybackStore((s) => s.addNext);
  const queueLength = usePlaybackStore((s) => s.queue.length);
  const controller = usePlayerController();
  const pushToast = useUIStore((s) => s.pushToast);

  const isCurrent = currentVideoId === video.id;

  function handlePlay() {
    if (queueLength === 0) {
      controller.requestBuildQueueFrom(visibleIds, video.id);
    } else {
      controller.requestPlayImmediate(video.id);
    }
  }

  if (compact) {
    return (
      <>
        <div
          className={`group flex items-center gap-3 rounded-lg border px-2 py-1.5 transition-colors ${
            isCurrent ? "border-violet-600/60 bg-violet-950/30" : "border-transparent hover:bg-neutral-900"
          }`}
        >
          <button
            type="button"
            onClick={handlePlay}
            className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-800"
            aria-label={`Reproducir ${video.title}`}
          >
            <img src={video.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
            {isCurrent && playing && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-violet-300" aria-hidden>
                ♪
              </span>
            )}
          </button>
          <button type="button" onClick={handlePlay} className="min-w-0 flex-1 text-left">
            <p className={`truncate text-sm font-medium ${isCurrent ? "text-violet-300" : "text-neutral-100"}`}>
              {video.title}
            </p>
            <p className="truncate text-xs text-neutral-500">{video.tags.slice(0, 3).join(" · ")}</p>
          </button>
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
            <FavoriteButton videoId={video.id} videoTitle={video.title} size="sm" />
            <IconButton label="Añadir a la cola" size="sm" onClick={() => { addToQueue(video.id); pushToast("Añadido a la cola."); }}>
              <span aria-hidden>➕</span>
            </IconButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className={`group flex flex-col overflow-hidden rounded-xl border bg-neutral-900/60 transition-colors ${
          isCurrent ? "border-violet-600/70 ring-1 ring-violet-600/40" : "border-neutral-800 hover:border-neutral-700"
        }`}
      >
        <button
          type="button"
          onClick={handlePlay}
          className="group/thumb relative aspect-video w-full overflow-hidden bg-neutral-800"
          aria-label={`Reproducir ${video.title}`}
        >
          <img
            src={video.thumbnailUrl}
            alt={`Miniatura de ${video.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover/thumb:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-3xl text-white opacity-0 transition-opacity group-hover/thumb:bg-black/30 group-hover/thumb:opacity-100">
            ▶
          </span>
          {isCurrent && (
            <span
              className={`absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${
                playing ? "bg-violet-600" : "bg-neutral-700"
              }`}
            >
              {playing ? "♪ Sonando" : "Pausado"}
            </span>
          )}
        </button>

        <div className="flex flex-1 flex-col gap-2 p-3">
          <button type="button" onClick={handlePlay} className="text-left">
            <h3 className="line-clamp-1 text-sm font-semibold text-neutral-100" title={video.title}>
              {video.title}
            </h3>
          </button>

          <TagList tags={video.tags} max={3} />

          <div className="mt-auto flex items-center justify-between pt-1">
            <div className="flex items-center gap-0.5">
              <IconButton label="Reproducir" size="sm" onClick={handlePlay}>
                <span aria-hidden>▶</span>
              </IconButton>
              <IconButton
                label="Añadir a la cola"
                size="sm"
                onClick={() => {
                  addToQueue(video.id);
                  pushToast(`"${video.title}" añadido a la cola.`);
                }}
              >
                <span aria-hidden>➕</span>
              </IconButton>
              <IconButton
                label="Reproducir a continuación"
                size="sm"
                onClick={() => {
                  addNext(video.id);
                  pushToast(`"${video.title}" reproducirá a continuación.`);
                }}
              >
                <span aria-hidden>⏭</span>
              </IconButton>
              <IconButton label="Añadir a playlist" size="sm" onClick={() => setPlaylistModalOpen(true)}>
                <span aria-hidden>📚</span>
              </IconButton>
            </div>
            <div className="flex items-center gap-0.5">
              <FavoriteButton videoId={video.id} videoTitle={video.title} size="sm" />
              <DropdownMenu
                label="Más acciones"
                trigger={<span aria-hidden>⋯</span>}
                items={[
                  {
                    label: "Abrir en YouTube",
                    onClick: () => window.open(video.url, "_blank", "noopener,noreferrer"),
                  },
                  {
                    label: "Copiar enlace",
                    onClick: () => {
                      navigator.clipboard?.writeText(video.url);
                      pushToast("Enlace copiado.");
                    },
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {playlistModalOpen && (
        <AddToPlaylistModal videoId={video.id} videoTitle={video.title} onClose={() => setPlaylistModalOpen(false)} />
      )}
    </>
  );
}
