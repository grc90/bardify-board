import { useState } from "react";
import { Modal } from "../common/Modal";
import { usePlaylistsStore } from "../../stores/playlistsStore";
import { useUIStore } from "../../stores/uiStore";

interface AddToPlaylistModalProps {
  videoId: string;
  videoTitle: string;
  onClose: () => void;
}

export function AddToPlaylistModal({ videoId, videoTitle, onClose }: AddToPlaylistModalProps) {
  const playlists = usePlaylistsStore((s) => s.playlists);
  const addVideo = usePlaylistsStore((s) => s.addVideo);
  const create = usePlaylistsStore((s) => s.create);
  const pushToast = useUIStore((s) => s.pushToast);

  const [creatingNew, setCreatingNew] = useState(playlists.length === 0);
  const [newName, setNewName] = useState("");

  async function handleAdd(playlistId: string, playlistName: string) {
    const added = await addVideo(playlistId, videoId);
    pushToast(
      added ? `"${videoTitle}" añadido a "${playlistName}".` : `Ya estaba en "${playlistName}".`,
      added ? "success" : "info",
    );
    onClose();
  }

  async function handleCreateAndAdd() {
    const name = newName.trim();
    if (!name) return;
    const playlist = await create(name, undefined, [videoId]);
    pushToast(`Playlist "${playlist.name}" creada con "${videoTitle}".`, "success");
    onClose();
  }

  return (
    <Modal title="Añadir a playlist" onClose={onClose}>
      <div className="mb-3 text-sm text-neutral-400">
        Añadiendo <span className="text-neutral-200">{videoTitle}</span>
      </div>

      {playlists.length > 0 && (
        <ul className="mb-4 max-h-56 space-y-1 overflow-y-auto">
          {playlists.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => handleAdd(p.id, p.name)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
              >
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {p.videoIds.includes(videoId) ? "Añadido" : `${p.videoIds.length} videos`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {creatingNew ? (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
            placeholder="Nombre de la nueva playlist"
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-violet-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCreateAndAdd}
            disabled={!newName.trim()}
            className="rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
          >
            Crear
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreatingNew(true)}
          className="w-full rounded-md border border-dashed border-neutral-700 px-3 py-2 text-sm text-neutral-400 hover:border-violet-500 hover:text-violet-300"
        >
          + Crear nueva playlist
        </button>
      )}
    </Modal>
  );
}
