import { useRef, useState } from "react";
import { usePlaylistsStore } from "../../stores/playlistsStore";
import { usePlaybackStore } from "../../stores/playbackStore";
import { usePlayerController } from "../../context/PlayerControllerContext";
import { useUIStore } from "../../stores/uiStore";
import { useVideoMap } from "../../hooks/useVideoById";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { IconButton } from "../common/IconButton";
import { EmptyState } from "../common/EmptyState";
import { FavoriteButton } from "../common/FavoriteButton";
import { downloadJson } from "../../services/export";

interface PlaylistDetailProps {
  playlistId: string;
  onBack: () => void;
}

export function PlaylistDetail({ playlistId, onBack }: PlaylistDetailProps) {
  const playlist = usePlaylistsStore((s) => s.playlists.find((p) => p.id === playlistId));
  const rename = usePlaylistsStore((s) => s.rename);
  const setDescription = usePlaylistsStore((s) => s.setDescription);
  const remove = usePlaylistsStore((s) => s.remove);
  const duplicate = usePlaylistsStore((s) => s.duplicate);
  const removeVideo = usePlaylistsStore((s) => s.removeVideo);
  const reorderVideos = usePlaylistsStore((s) => s.reorderVideos);
  const togglePinned = usePlaylistsStore((s) => s.togglePinned);

  const videoMap = useVideoMap();
  const controller = usePlayerController();
  const addManyToQueue = usePlaybackStore((s) => s.addManyToQueue);
  const shuffle = usePlaybackStore((s) => s.shuffle);
  const toggleShuffle = usePlaybackStore((s) => s.toggleShuffle);
  const pushToast = useUIStore((s) => s.pushToast);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(playlist?.name ?? "");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(playlist?.description ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dragIndex = useRef<number | null>(null);

  if (!playlist) {
    return (
      <EmptyState
        icon="📚"
        title="Playlist no encontrada"
        description="Puede que haya sido eliminada."
        action={{ label: "Volver a playlists", onClick: onBack }}
      />
    );
  }

  const videos = playlist.videoIds.map((id) => videoMap.get(id)).filter((v): v is NonNullable<typeof v> => Boolean(v));

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={onBack} className="w-fit text-sm text-neutral-400 hover:text-neutral-200">
        ← Volver a playlists
      </button>

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        <div className="flex items-start justify-between gap-3">
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => {
                rename(playlist.id, nameDraft);
                setEditingName(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-lg font-semibold text-neutral-100 focus:border-violet-500 focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setNameDraft(playlist.name);
                setEditingName(true);
              }}
              className="text-left text-lg font-semibold text-neutral-100 hover:text-violet-300"
              title="Renombrar"
            >
              {playlist.name}
            </button>
          )}
          <button
            type="button"
            onClick={() => togglePinned(playlist.id)}
            aria-pressed={playlist.pinned}
            className={`shrink-0 text-xl ${playlist.pinned ? "text-violet-400" : "text-neutral-600 hover:text-neutral-300"}`}
            aria-label={playlist.pinned ? "Quitar de acceso rápido" : "Fijar en acceso rápido"}
          >
            📌
          </button>
        </div>

        {editingDesc ? (
          <textarea
            autoFocus
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={() => {
              setDescription(playlist.id, descDraft);
              setEditingDesc(false);
            }}
            rows={2}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-200 focus:border-violet-500 focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDescDraft(playlist.description ?? "");
              setEditingDesc(true);
            }}
            className="text-left text-sm text-neutral-400 hover:text-neutral-200"
          >
            {playlist.description || "Añadir descripción..."}
          </button>
        )}

        <p className="text-xs text-neutral-500">{videos.length} videos</p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            disabled={videos.length === 0}
            onClick={() => controller.requestBuildQueueFrom(playlist.videoIds, playlist.videoIds[0])}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
          >
            ▶ Reproducir completa
          </button>
          <button
            type="button"
            disabled={videos.length === 0}
            onClick={() => {
              if (!shuffle) toggleShuffle();
              controller.requestBuildQueueFrom(playlist.videoIds, playlist.videoIds[0]);
            }}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
          >
            🔀 Reproducir aleatoria
          </button>
          <button
            type="button"
            disabled={videos.length === 0}
            onClick={() => {
              addManyToQueue(playlist.videoIds);
              pushToast("Playlist añadida a la cola.");
            }}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
          >
            + Añadir a la cola
          </button>
          <button
            type="button"
            disabled={videos.length === 0}
            onClick={() => {
              controller.requestReplaceQueue(playlist.videoIds);
              pushToast("Cola reemplazada por la playlist.");
            }}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
          >
            ⇄ Reemplazar cola
          </button>
          <button
            type="button"
            onClick={() => {
              duplicate(playlist.id);
              pushToast("Playlist duplicada.");
            }}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Duplicar
          </button>
          <button
            type="button"
            onClick={() => {
              downloadJson(`${playlist.name.replace(/[^a-z0-9-_ ]/gi, "").trim() || "playlist"}.json`, playlist);
              pushToast("Playlist exportada como JSON.");
            }}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Exportar
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg border border-red-900/60 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950/40"
          >
            Eliminar
          </button>
        </div>
      </div>

      {videos.length === 0 ? (
        <EmptyState icon="🎵" title="Playlist vacía" description="Añade videos desde la biblioteca con 'Añadir a playlist'." />
      ) : (
        <ul className="flex flex-col gap-1">
          {videos.map((video, index) => (
            <li
              key={video.id}
              draggable
              onDragStart={() => (dragIndex.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex.current !== null && dragIndex.current !== index) {
                  reorderVideos(playlist.id, dragIndex.current, index);
                }
                dragIndex.current = null;
              }}
              className="group flex cursor-grab items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-neutral-900 active:cursor-grabbing"
            >
              <span className="w-4 text-center text-[10px] text-neutral-600" aria-hidden>
                ⠿
              </span>
              <span className="w-5 text-center text-xs text-neutral-600">{index + 1}</span>
              <button
                type="button"
                onClick={() => controller.requestBuildQueueFrom(playlist.videoIds, video.id)}
                className="h-10 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-800"
                aria-label={`Reproducir ${video.title}`}
              >
                <img src={video.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
              <button
                type="button"
                onClick={() => controller.requestBuildQueueFrom(playlist.videoIds, video.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-neutral-100">{video.title}</p>
                <p className="truncate text-xs text-neutral-500">{video.tags.slice(0, 3).join(" · ")}</p>
              </button>
              <FavoriteButton videoId={video.id} videoTitle={video.title} size="sm" />
              <IconButton
                label={`Quitar ${video.title} de la playlist`}
                size="sm"
                className="opacity-0 group-hover:opacity-100"
                onClick={() => removeVideo(playlist.id, video.id)}
              >
                ✕
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Eliminar playlist"
          message={`¿Seguro que quieres eliminar "${playlist.name}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={() => {
            remove(playlist.id);
            setConfirmDelete(false);
            onBack();
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
