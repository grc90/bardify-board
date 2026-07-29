import { useFavoritesStore } from "../../stores/favoritesStore";
import { useLibraryStore } from "../../stores/libraryStore";
import { usePlaybackStore } from "../../stores/playbackStore";
import { usePlayerController } from "../../context/PlayerControllerContext";
import { useUIStore } from "../../stores/uiStore";
import { VideoCard } from "../library/VideoCard";
import { EmptyState } from "../common/EmptyState";

export function FavoritesView() {
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const videos = useLibraryStore((s) => s.videos);
  const addManyToQueue = usePlaybackStore((s) => s.addManyToQueue);
  const controller = usePlayerController();
  const pushToast = useUIStore((s) => s.pushToast);

  const favoriteVideos = videos.filter((v) => favoriteIds.has(v.id));
  const ids = favoriteVideos.map((v) => v.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-100">Favoritos ({favoriteVideos.length})</h1>
        {favoriteVideos.length > 0 && (
          <div className="flex gap-3 text-sm">
            <button
              type="button"
              onClick={() => controller.requestBuildQueueFrom(ids, ids[0])}
              className="text-violet-400 hover:text-violet-300"
            >
              ▶ Reproducir todos
            </button>
            <button
              type="button"
              onClick={() => {
                addManyToQueue(ids);
                pushToast("Favoritos añadidos a la cola.");
              }}
              className="text-neutral-400 hover:text-neutral-200"
            >
              + Añadir a la cola
            </button>
          </div>
        )}
      </div>

      {favoriteVideos.length === 0 ? (
        <EmptyState
          icon="★"
          title="Sin favoritos todavía"
          description="Marca videos como favoritos desde la biblioteca o el reproductor para encontrarlos aquí rápidamente."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoriteVideos.map((v) => (
            <VideoCard key={v.id} video={v} visibleIds={ids} />
          ))}
        </div>
      )}
    </div>
  );
}
