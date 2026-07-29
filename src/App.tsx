import { useEffect, useRef } from "react";
import { useLibraryStore } from "./stores/libraryStore";
import { useFavoritesStore } from "./stores/favoritesStore";
import { usePlaylistsStore } from "./stores/playlistsStore";
import { useHistoryStore } from "./stores/historyStore";
import { usePlaybackStore } from "./stores/playbackStore";
import { useUIStore } from "./stores/uiStore";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { PlayerControllerProvider } from "./context/PlayerControllerContext";

import { Sidebar } from "./components/layout/Sidebar";
import { MobileNav } from "./components/layout/MobileNav";
import { LibraryView } from "./components/library/LibraryView";
import { PlaylistsView } from "./components/playlists/PlaylistsView";
import { FavoritesView } from "./components/favorites/FavoritesView";
import { HistoryView } from "./components/history/HistoryView";
import { SettingsView } from "./components/settings/SettingsView";
import { PlayerBar } from "./components/player/PlayerBar";
import { ExpandedPlayer } from "./components/player/ExpandedPlayer";
import { QueuePanel } from "./components/queue/QueuePanel";
import { ToastStack } from "./components/common/ToastStack";
import { ShortcutsHelpModal } from "./components/common/ShortcutsHelpModal";

function SectionContent({ searchRef }: { searchRef: React.RefObject<HTMLInputElement | null> }) {
  const section = useUIStore((s) => s.section);
  switch (section) {
    case "library":
      return <LibraryView ref={searchRef} />;
    case "playlists":
      return <PlaylistsView />;
    case "favorites":
      return <FavoritesView />;
    case "history":
      return <HistoryView />;
    case "settings":
      return <SettingsView />;
    default:
      return null;
  }
}

function TopBar() {
  const sessionMode = useUIStore((s) => s.sessionMode);
  const toggleSessionMode = useUIStore((s) => s.toggleSessionMode);

  return (
    <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2.5 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <span className="text-xl" aria-hidden>
          🪕
        </span>
        <span className="text-sm font-semibold text-neutral-100">Bardify Board</span>
      </div>
      <div className="hidden md:block" />
      <button
        type="button"
        onClick={toggleSessionMode}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          sessionMode
            ? "bg-violet-600 text-white hover:bg-violet-500"
            : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
        }`}
      >
        {sessionMode ? "✕ Salir del modo sesión" : "🎭 Modo sesión"}
      </button>
    </div>
  );
}

export default function App() {
  const searchRef = useRef<HTMLInputElement | null>(null);
  const sessionMode = useUIStore((s) => s.sessionMode);

  useEffect(() => {
    useUIStore.getState().init();
    void useLibraryStore.getState().init();
    void useFavoritesStore.getState().init();
    void usePlaylistsStore.getState().init();
    void useHistoryStore.getState().init();
    void usePlaybackStore.getState().init();
  }, []);

  useKeyboardShortcuts(searchRef);

  return (
    <PlayerControllerProvider>
      <div className="flex h-screen min-h-screen flex-col bg-neutral-950 text-neutral-100">
        <div className="flex flex-1 overflow-hidden">
          {!sessionMode && <Sidebar />}
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto px-4 pb-40 pt-4 md:px-6 md:pb-28">
              <SectionContent searchRef={searchRef} />
            </main>
          </div>
        </div>

        {!sessionMode && <MobileNav />}
        <PlayerBar />
        <QueuePanel />
        <ExpandedPlayer />
        <ToastStack />
        <ShortcutsHelpModal />
      </div>
    </PlayerControllerProvider>
  );
}
