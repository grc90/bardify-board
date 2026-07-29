import { useState } from "react";
import { usePlaylistsStore } from "../../stores/playlistsStore";
import { useUIStore } from "../../stores/uiStore";
import { PlaylistCard } from "./PlaylistCard";
import { PlaylistDetail } from "./PlaylistDetail";
import { EmptyState } from "../common/EmptyState";

export function PlaylistsView() {
  const playlists = usePlaylistsStore((s) => s.playlists);
  const create = usePlaylistsStore((s) => s.create);
  const togglePinned = usePlaylistsStore((s) => s.togglePinned);
  const pushToast = useUIStore((s) => s.pushToast);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  if (selectedId) {
    return <PlaylistDetail playlistId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const pinned = playlists.filter((p) => p.pinned);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const playlist = await create(name);
    pushToast(`Playlist "${playlist.name}" creada.`);
    setNewName("");
    setCreating(false);
    setSelectedId(playlist.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-100">Playlists</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          + Nueva playlist
        </button>
      </div>

      {creating && (
        <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Nombre de la playlist (ej. Combate, Taberna, Viaje...)"
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-violet-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
          >
            Crear
          </button>
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="rounded-md px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800"
          >
            Cancelar
          </button>
        </div>
      )}

      {pinned.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-neutral-400">Acceso rápido</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {pinned.map((p) => (
              <PlaylistCard key={p.id} playlist={p} onOpen={() => setSelectedId(p.id)} onTogglePin={() => togglePinned(p.id)} compact />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-neutral-400">Todas las playlists</h2>
        {playlists.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Aún no tienes playlists"
            description='Crea playlists para organizar tus escenas, por ejemplo "Combate", "Taberna" o "Viaje", y fíjalas para acceso rápido durante la partida.'
            action={{ label: "Crear la primera playlist", onClick: () => setCreating(true) }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {playlists.map((p) => (
              <PlaylistCard key={p.id} playlist={p} onOpen={() => setSelectedId(p.id)} onTogglePin={() => togglePinned(p.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
