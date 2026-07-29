import { useTagStats } from "../../hooks/useTagStats";
import { useUIStore } from "../../stores/uiStore";

export function TagFilterPanel() {
  const stats = useTagStats();
  const selectedTags = useUIStore((s) => s.selectedTags);
  const toggleTag = useUIStore((s) => s.toggleTag);
  const clearTags = useUIStore((s) => s.clearTags);
  const tagMatchMode = useUIStore((s) => s.tagMatchMode);
  const setTagMatchMode = useUIStore((s) => s.setTagMatchMode);
  const tagSortMode = useUIStore((s) => s.tagSortMode);
  const setTagSortMode = useUIStore((s) => s.setTagSortMode);
  const tagSearch = useUIStore((s) => s.tagSearch);
  const setTagSearch = useUIStore((s) => s.setTagSearch);
  const filtersOpen = useUIStore((s) => s.filtersOpen);
  const toggleFilters = useUIStore((s) => s.toggleFilters);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50">
      <button
        type="button"
        onClick={toggleFilters}
        aria-expanded={filtersOpen}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-neutral-100">
          Filtros por tags {selectedTags.length > 0 && <span className="text-violet-400">({selectedTags.length})</span>}
        </span>
        <span className="text-neutral-500" aria-hidden>
          {filtersOpen ? "▾" : "▸"}
        </span>
      </button>

      {filtersOpen && (
        <div className="border-t border-neutral-800 p-4">
          {selectedTags.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-violet-500"
                >
                  {tag} <span aria-hidden>✕</span>
                </button>
              ))}
              <button
                type="button"
                onClick={clearTags}
                className="ml-1 text-xs text-neutral-400 underline hover:text-neutral-200"
              >
                Limpiar todo
              </button>
            </div>
          )}

          <div className="mb-3 flex items-center gap-1 rounded-lg bg-neutral-800/60 p-1 text-xs">
            <button
              type="button"
              onClick={() => setTagMatchMode("all")}
              className={`flex-1 rounded-md py-1.5 font-medium ${
                tagMatchMode === "all" ? "bg-violet-600 text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Coincidir con todas
            </button>
            <button
              type="button"
              onClick={() => setTagMatchMode("any")}
              className={`flex-1 rounded-md py-1.5 font-medium ${
                tagMatchMode === "any" ? "bg-violet-600 text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Coincidir con cualquiera
            </button>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Buscar tags..."
              aria-label="Buscar tags"
              className="flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-violet-500 focus:outline-none"
            />
            <div className="flex items-center gap-1 rounded-md bg-neutral-800/60 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setTagSortMode("frequency")}
                title="Ordenar por frecuencia"
                className={`rounded px-2 py-1 ${
                  tagSortMode === "frequency" ? "bg-neutral-700 text-white" : "text-neutral-400"
                }`}
              >
                #
              </button>
              <button
                type="button"
                onClick={() => setTagSortMode("alpha")}
                title="Ordenar alfabéticamente"
                className={`rounded px-2 py-1 ${
                  tagSortMode === "alpha" ? "bg-neutral-700 text-white" : "text-neutral-400"
                }`}
              >
                A-Z
              </button>
            </div>
          </div>

          <div className="flex max-h-64 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {stats.length === 0 && <p className="text-xs text-neutral-500">Sin tags que coincidan.</p>}
            {stats.map((s) => (
              <button
                key={s.tag}
                type="button"
                onClick={() => toggleTag(s.tag)}
                aria-pressed={s.selected}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  s.selected
                    ? "bg-violet-600 text-white"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                }`}
              >
                {s.tag} <span className="opacity-60">{s.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
