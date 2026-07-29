/**
 * Minimal surface of the YouTube IFrame Player API used by this app.
 *
 * The `youtube-player` package (used internally by react-youtube) wraps every
 * method so it resolves only once the underlying iframe player is ready —
 * every call, including getters, returns a Promise.
 */
export interface YTPlayerInstance {
  playVideo(): Promise<void>;
  pauseVideo(): Promise<void>;
  seekTo(seconds: number, allowSeekAhead?: boolean): Promise<void>;
  setVolume(volume: number): Promise<void>;
  mute(): Promise<void>;
  unMute(): Promise<void>;
  getCurrentTime(): Promise<number>;
  getDuration(): Promise<number>;
  getPlayerState(): Promise<number>;
}

export const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;
