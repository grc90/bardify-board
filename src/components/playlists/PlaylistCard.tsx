import type { Playlist } from "../../types";
import { useVideoMap } from "../../hooks/useVideoById";

interface PlaylistCardProps {
  playlist: Playlist;
  onOpen: () => void;
  onTogglePin: () => void;
  compact?: boolean;
}

export function PlaylistCard({ playlist, onOpen, onTogglePin, compact = false }: PlaylistCardProps) {
  const videoMap = useVideoMap();
  const thumbs = playlist.videoIds
    .map((id) => videoMap.get(id)?.thumbnailUrl)
    .filter((t): t is string => Boolean(t))
    .slice(0, 4);

  if (compact) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 hover:border-violet-600/60"
        style={{ width: 128 }}
      >
        <div className="grid h-16 w-16 grid-cols-2 gap-0.5 overflow-hidden rounded-lg bg-neutral-800">
          {thumbs.length > 0 ? (
            thumbs.map((t, i) => <img key={i} src={t} alt="" className="h-full w-full object-cover" />)
          ) : (
            <span className="col-span-2 flex items-center justify-center text-lg" aria-hidden>
              📚
            </span>
          )}
        </div>
        <span className="line-clamp-1 w-full text-center text-xs font-medium text-neutral-200">{playlist.name}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700">
      <button type="button" onClick={onOpen} className="grid aspect-video grid-cols-2 gap-0.5 bg-neutral-800 text-left">
        {thumbs.length > 0 ? (
          thumbs.map((t, i) => <img key={i} src={t} alt="" className="h-full w-full object-cover" />)
        ) : (
          <span className="col-span-2 flex items-center justify-center text-3xl" aria-hidden>
            📚
          </span>
        )}
      </button>
      <div className="flex items-start justify-between gap-2 p-3">
        <button type="button" onClick={onOpen} className="min-w-0 text-left">
          <h3 className="truncate text-sm font-semibold text-neutral-100">{playlist.name}</h3>
          <p className="text-xs text-neutral-500">{playlist.videoIds.length} videos</p>
        </button>
        <button
          type="button"
          onClick={onTogglePin}
          aria-pressed={playlist.pinned}
          aria-label={playlist.pinned ? "Quitar de acceso rápido" : "Fijar en acceso rápido"}
          className={`shrink-0 text-lg ${playlist.pinned ? "text-violet-400" : "text-neutral-600 hover:text-neutral-300"}`}
        >
          📌
        </button>
      </div>
    </div>
  );
}
