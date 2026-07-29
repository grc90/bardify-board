import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { usePlaybackStore } from "../stores/playbackStore";
import { useHistoryStore } from "../stores/historyStore";
import { useUIStore } from "../stores/uiStore";
import { YT_PLAYER_STATE, type YTPlayerInstance } from "../services/youtube/playerTypes";

interface PlayerControllerValue {
  requestNext: () => void;
  requestPrev: () => void;
  requestJump: (index: number) => void;
  requestPlayImmediate: (videoId: string) => void;
  requestBuildQueueFrom: (videoIds: string[], startVideoId: string) => void;
  requestReplaceQueue: (videoIds: string[], startIndex?: number) => void;
  requestSeek: (seconds: number) => void;
  openInYouTube: () => void;
}

const PlayerControllerContext = createContext<PlayerControllerValue | null>(null);

const ERROR_MESSAGES: Record<number, string> = {
  2: "El ID del video no es válido.",
  5: "Este video no se puede reproducir en el reproductor embebido.",
  100: "El video no está disponible o fue eliminado.",
  101: "El propietario no permite la reproducción embebida de este video.",
  150: "El propietario no permite la reproducción embebida de este video.",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function PlayerControllerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<YouTube | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const recordedQueueIdRef = useRef<string | null>(null);
  const fadingRef = useRef(false);

  const opts = useMemo(
    () => ({
      height: "0",
      width: "0",
      playerVars: {
        autoplay: 1 as const,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        fs: 0,
        disablekb: 1,
        playsinline: 1,
      },
    }),
    [],
  );

  const currentItem = usePlaybackStore((s) => (s.queue[s.currentIndex] ? s.queue[s.currentIndex] : null));
  const videoId = currentItem?.videoId;

  const getPlayer = useCallback((): YTPlayerInstance | null => {
    return (playerRef.current?.getInternalPlayer() as unknown as YTPlayerInstance | null) ?? null;
  }, []);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    progressTimerRef.current = window.setInterval(() => {
      const player = getPlayer();
      if (!player) return;
      Promise.all([player.getCurrentTime(), player.getDuration()])
        .then(([current, duration]) => {
          if (Number.isFinite(duration) && Number.isFinite(current)) {
            usePlaybackStore.getState().setProgress(current, duration);
          }
        })
        .catch(() => {
          // player not ready yet
        });
    }, 500);
  }, [getPlayer, stopProgressTimer]);

  useEffect(() => stopProgressTimer, [stopProgressTimer]);

  // Sync play/pause state imperatively.
  const playing = usePlaybackStore((s) => s.playing);
  useEffect(() => {
    const player = getPlayer();
    if (!player || fadingRef.current) return;
    try {
      if (playing) {
        player.playVideo();
        startProgressTimer();
      } else {
        player.pauseVideo();
        stopProgressTimer();
      }
    } catch {
      // player not ready
    }
  }, [playing, videoId, getPlayer, startProgressTimer, stopProgressTimer]);

  // Sync volume/mute.
  const volume = usePlaybackStore((s) => s.volume);
  const muted = usePlaybackStore((s) => s.muted);
  useEffect(() => {
    const player = getPlayer();
    if (!player || fadingRef.current) return;
    try {
      player.setVolume(volume);
      if (muted) player.mute();
      else player.unMute();
    } catch {
      // player not ready
    }
  }, [volume, muted, getPlayer]);

  const fadeOutIfPlaying = useCallback(
    async (fadeSeconds: number) => {
      const player = getPlayer();
      if (!player || fadeSeconds <= 0) return;
      const state = usePlaybackStore.getState();
      if (!state.playing || state.muted) return;
      fadingRef.current = true;
      try {
        const steps = 6;
        const stepMs = (fadeSeconds * 1000) / steps;
        for (let i = steps - 1; i >= 0; i--) {
          player.setVolume(Math.round((state.volume * i) / steps));
          await sleep(stepMs);
        }
      } catch {
        // ignore fade errors
      } finally {
        fadingRef.current = false;
      }
    },
    [getPlayer],
  );

  const requestNext = useCallback(() => {
    const state = usePlaybackStore.getState();
    fadeOutIfPlaying(state.fadeSeconds).then(() => state.next());
  }, [fadeOutIfPlaying]);

  const requestPrev = useCallback(() => {
    const state = usePlaybackStore.getState();
    fadeOutIfPlaying(state.fadeSeconds).then(() => state.prev());
  }, [fadeOutIfPlaying]);

  const requestJump = useCallback(
    (index: number) => {
      const state = usePlaybackStore.getState();
      fadeOutIfPlaying(state.fadeSeconds).then(() => state.jumpTo(index));
    },
    [fadeOutIfPlaying],
  );

  const requestPlayImmediate = useCallback(
    (id: string) => {
      const state = usePlaybackStore.getState();
      fadeOutIfPlaying(state.fadeSeconds).then(() => state.playImmediately(id));
    },
    [fadeOutIfPlaying],
  );

  const requestBuildQueueFrom = useCallback(
    (videoIds: string[], startVideoId: string) => {
      const state = usePlaybackStore.getState();
      fadeOutIfPlaying(state.fadeSeconds).then(() => state.buildQueueFrom(videoIds, startVideoId));
    },
    [fadeOutIfPlaying],
  );

  const requestReplaceQueue = useCallback(
    (videoIds: string[], startIndex?: number) => {
      const state = usePlaybackStore.getState();
      fadeOutIfPlaying(state.fadeSeconds).then(() => state.replaceQueue(videoIds, startIndex));
    },
    [fadeOutIfPlaying],
  );

  const requestSeek = useCallback(
    (seconds: number) => {
      const player = getPlayer();
      try {
        player?.seekTo(seconds, true);
        usePlaybackStore.getState().setProgress(seconds, usePlaybackStore.getState().duration);
      } catch {
        // ignore
      }
    },
    [getPlayer],
  );

  const openInYouTube = useCallback(() => {
    const item = usePlaybackStore.getState().currentItem();
    if (item) window.open(`https://www.youtube.com/watch?v=${item.videoId}`, "_blank", "noopener,noreferrer");
  }, []);

  const handleReady = useCallback(
    (event: YouTubeEvent) => {
      const player = event.target as unknown as YTPlayerInstance;
      const state = usePlaybackStore.getState();
      try {
        player.setVolume(state.volume);
        if (state.muted) player.mute();
      } catch {
        // ignore
      }
    },
    [],
  );

  const handleStateChange = useCallback((event: YouTubeEvent<number>) => {
    const state = usePlaybackStore.getState();
    const item = state.currentItem();
    if (event.data === YT_PLAYER_STATE.PLAYING) {
      if (!state.playing) usePlaybackStore.setState({ playing: true });
      startProgressTimer();
      if (item && recordedQueueIdRef.current !== item.queueId) {
        recordedQueueIdRef.current = item.queueId;
        void useHistoryStore.getState().recordPlay(item.videoId);
      }
      if (state.error) state.setError(null);
    } else if (event.data === YT_PLAYER_STATE.PAUSED) {
      stopProgressTimer();
    }
  }, [startProgressTimer, stopProgressTimer]);

  const handleEnd = useCallback(() => {
    const state = usePlaybackStore.getState();
    stopProgressTimer();
    if (state.repeatMode === "one") {
      recordedQueueIdRef.current = null;
      const player = getPlayer();
      try {
        player?.seekTo(0, true);
        player?.playVideo();
      } catch {
        // ignore
      }
      return;
    }
    state.onEnded();
  }, [getPlayer, stopProgressTimer]);

  const handleError = useCallback(
    (event: YouTubeEvent<number>) => {
      const message = ERROR_MESSAGES[event.data] ?? "No se pudo reproducir este video.";
      const state = usePlaybackStore.getState();
      state.setError(message);
      useUIStore.getState().pushToast(message, "error");
      window.setTimeout(() => {
        const current = usePlaybackStore.getState();
        if (current.queue.length > 1) current.next();
        else current.setPlaying(false);
      }, 1500);
    },
    [],
  );

  const value = useMemo<PlayerControllerValue>(
    () => ({
      requestNext,
      requestPrev,
      requestJump,
      requestPlayImmediate,
      requestBuildQueueFrom,
      requestReplaceQueue,
      requestSeek,
      openInYouTube,
    }),
    [
      requestNext,
      requestPrev,
      requestJump,
      requestPlayImmediate,
      requestBuildQueueFrom,
      requestReplaceQueue,
      requestSeek,
      openInYouTube,
    ],
  );

  return (
    <PlayerControllerContext.Provider value={value}>
      {children}
      <div className="sr-only" aria-hidden="true">
        {videoId && (
          <YouTube
            ref={playerRef}
            videoId={videoId}
            opts={opts}
            onReady={handleReady}
            onStateChange={handleStateChange}
            onEnd={handleEnd}
            onError={handleError}
          />
        )}
      </div>
    </PlayerControllerContext.Provider>
  );
}

export function usePlayerController(): PlayerControllerValue {
  const ctx = useContext(PlayerControllerContext);
  if (!ctx) throw new Error("usePlayerController must be used within PlayerControllerProvider");
  return ctx;
}
