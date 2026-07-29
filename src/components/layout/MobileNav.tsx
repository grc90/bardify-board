import type { Section } from "../../stores/uiStore";
import { useUIStore } from "../../stores/uiStore";

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "library", label: "Música", icon: "🎵" },
  { id: "playlists", label: "Listas", icon: "📚" },
  { id: "favorites", label: "Favs", icon: "★" },
  { id: "history", label: "Historial", icon: "🕓" },
  { id: "settings", label: "Ajustes", icon: "⚙" },
];

export function MobileNav() {
  const section = useUIStore((s) => s.section);
  const setSection = useUIStore((s) => s.setSection);
  const sessionMode = useUIStore((s) => s.sessionMode);

  const items = sessionMode ? NAV_ITEMS.filter((i) => i.id === "library" || i.id === "playlists") : NAV_ITEMS;

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-800 bg-neutral-950/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setSection(item.id)}
          aria-current={section === item.id ? "page" : undefined}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
            section === item.id ? "text-violet-400" : "text-neutral-400"
          }`}
        >
          <span className="text-lg" aria-hidden>
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
