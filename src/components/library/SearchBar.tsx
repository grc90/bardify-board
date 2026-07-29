import { forwardRef } from "react";
import { useUIStore } from "../../stores/uiStore";

export const SearchBar = forwardRef<HTMLInputElement>(function SearchBar(_props, ref) {
  const search = useUIStore((s) => s.search);
  const setSearch = useUIStore((s) => s.setSearch);

  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden>
        🔍
      </span>
      <input
        ref={ref}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por título o tag... (/)"
        aria-label="Buscar en la biblioteca"
        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2 pl-9 pr-9 text-sm text-neutral-100 placeholder-neutral-500 focus:border-violet-500 focus:outline-none"
      />
      {search && (
        <button
          type="button"
          onClick={() => setSearch("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200"
        >
          ✕
        </button>
      )}
    </div>
  );
});
