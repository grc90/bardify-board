import { useEffect } from "react";
import { usePlaybackStore } from "../stores/playbackStore";
import { useUIStore } from "../stores/uiStore";
import { useFavoritesStore } from "../stores/favoritesStore";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable || tag === "select";
}

export function useKeyboardShortcuts(searchInputRef: React.RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      const playback = usePlaybackStore.getState();
      const ui = useUIStore.getState();

      switch (e.key) {
        case " ": {
          e.preventDefault();
          if (playback.currentItem()) playback.togglePlay();
          break;
        }
        case "ArrowRight":
          e.preventDefault();
          playback.next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          playback.prev();
          break;
        case "r":
        case "R":
          playback.cycleRepeat();
          break;
        case "s":
        case "S":
          playback.toggleShuffle();
          break;
        case "f":
        case "F": {
          const current = playback.currentItem();
          if (current) void useFavoritesStore.getState().toggle(current.videoId);
          break;
        }
        case "/":
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case "q":
        case "Q":
          ui.toggleQueuePanel();
          break;
        case "m":
        case "M":
          playback.toggleMute();
          break;
        case "Escape":
          if (ui.shortcutsHelpOpen) ui.setShortcutsHelpOpen(false);
          else if (ui.queuePanelOpen) ui.toggleQueuePanel(false);
          else if (ui.playerExpanded) ui.setPlayerExpanded(false);
          break;
        case "?":
          ui.setShortcutsHelpOpen(true);
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchInputRef]);
}
