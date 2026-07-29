import { forwardRef } from "react";
import { useFilteredLibrary } from "../../hooks/useFilteredLibrary";
import { useLibraryStore } from "../../stores/libraryStore";
import { useUIStore } from "../../stores/uiStore";
import { usePlaybackStore } from "../../stores/playbackStore";
import { SearchBar } from "./SearchBar";
import { TagFilterPanel } from "../filters/TagFilterPanel";
import { VideoCard } from "./VideoCard";
import { EmptyState } from "../common/EmptyState";

export const LibraryView = forwardRef<HTMLInputElement>(function LibraryView(_props, searchRef) {
  const { filtered, totalCount, resultCount } = useFilteredLibrary();
  const loading = useLibraryStore((s) => s.loading);
  const error = useLibraryStore((s) => s.error);
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const selectedTags = useUIStore((s) => s.selectedTags);
  const tagMatchMode = useUIStore((s) => s.tagMatchMode);
  const favoritesOnly = useUIStore((s) => s.favoritesOnly);
  const toggleFavoritesOnly = useUIStore((s) => s.toggleFavoritesOnly);
  const clearTags = useUIStore((s) => s.clearTags);
  const setSearch = useUIStore((s) => s.setSearch);
  const pushToast = useUIStore((s) => s.pushToast);
  const addManyToQueue = usePlaybackStore((s) => s.addManyToQueue);

  const visibleIds = filtered.map((v) => v.id);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-neutral-500">
        Cargando biblioteca musical...
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠"
        title="No se pudo cargar la biblioteca"
        description={error}
      />
    );
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        icon="🎵"
        title="La biblioteca está vacía"
        description="Importa una biblioteca en Configuración para empezar a añadir música."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar ref={searchRef} />
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleFavoritesOnly}
            aria-pressed={favoritesOnly}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              favoritesOnly
                ? "border-yellow-500/60 bg-yellow-500/10 text-yellow-300"
                : "border-neutral-800 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            ★ Favoritos
          </button>
          <div className="flex items-center gap-0.5 rounded-lg border border-neutral-800 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Vista de cuadrícula"
              aria-pressed={viewMode === "grid"}
              className={`rounded-md px-2.5 py-1.5 text-sm ${
                viewMode === "grid" ? "bg-neutral-800 text-white" : "text-neutral-400"
              }`}
            >
              ▦
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="Vista de lista compacta"
              aria-pressed={viewMode === "list"}
              className={`rounded-md px-2.5 py-1.5 text-sm ${
                viewMode === "list" ? "bg-neutral-800 text-white" : "text-neutral-400"
              }`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <TagFilterPanel />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
        <span>
          Mostrando <span className="text-neutral-200">{resultCount}</span> de {totalCount} videos
          {selectedTags.length > 0 && (
            <>
              {" "}
              · modo <span className="text-neutral-300">{tagMatchMode === "all" ? "todas" : "cualquiera"}</span>
            </>
          )}
        </span>
        {resultCount > 0 && (
          <button
            type="button"
            onClick={() => {
              addManyToQueue(visibleIds);
              pushToast(`${visibleIds.length} videos añadidos a la cola.`);
            }}
            className="text-violet-400 hover:text-violet-300"
          >
            + Añadir todos los resultados a la cola
          </button>
        )}
      </div>

      {resultCount === 0 ? (
        <EmptyState
          icon="🔎"
          title="Sin resultados"
          description="No hay videos que coincidan con la búsqueda o los filtros activos."
          action={{
            label: "Limpiar búsqueda y filtros",
            onClick: () => {
              setSearch("");
              clearTags();
            },
          }}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} visibleIds={visibleIds} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} visibleIds={visibleIds} compact />
          ))}
        </div>
      )}
    </div>
  );
});
