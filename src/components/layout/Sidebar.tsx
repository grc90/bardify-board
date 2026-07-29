import type { Section } from "../../stores/uiStore";
import { useUIStore } from "../../stores/uiStore";

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "library", label: "Biblioteca", icon: "🎵" },
  { id: "playlists", label: "Playlists", icon: "📚" },
  { id: "favorites", label: "Favoritos", icon: "★" },
  { id: "history", label: "Historial", icon: "🕓" },
  { id: "settings", label: "Configuración", icon: "⚙" },
];

export function Sidebar() {
  const section = useUIStore((s) => s.section);
  const setSection = useUIStore((s) => s.setSection);
  const sessionMode = useUIStore((s) => s.sessionMode);
  const toggleQueuePanel = useUIStore((s) => s.toggleQueuePanel);
  const queuePanelOpen = useUIStore((s) => s.queuePanelOpen);

  const items = sessionMode ? NAV_ITEMS.filter((i) => i.id === "library" || i.id === "playlists") : NAV_ITEMS;

  return (
    <nav
      aria-label="Navegación principal"
      className="hidden w-56 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950/60 p-4 md:flex"
    >
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="text-2xl" aria-hidden>
          🪕
        </span>
        <span className="text-lg font-semibold tracking-tight text-neutral-100">Bardify Board</span>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setSection(item.id)}
              aria-current={section === item.id ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                section === item.id
                  ? "bg-violet-600/90 text-white"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <button
          type="button"
          onClick={() => toggleQueuePanel()}
          className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
            queuePanelOpen ? "bg-neutral-800 text-white" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
          }`}
        >
          <span aria-hidden>▤</span> Cola
        </button>
      </div>
    </nav>
  );
}
