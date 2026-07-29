import { usePlaybackStore } from "../../stores/playbackStore";
import { IconButton } from "../common/IconButton";

const REPEAT_LABEL: Record<string, string> = {
  off: "Repetir canción (desactivado)",
  one: "Repetir canción (activo)",
  all: "Repetir canción (activo)",
};

export function RepeatShuffleButtons({ size = "md" as const }: { size?: "sm" | "md" }) {
  const repeatMode = usePlaybackStore((s) => s.repeatMode);
  const shuffle = usePlaybackStore((s) => s.shuffle);
  const cycleRepeat = usePlaybackStore((s) => s.cycleRepeat);
  const toggleShuffle = usePlaybackStore((s) => s.toggleShuffle);

  return (
    <>
      <IconButton label="Aleatorio" size={size} active={shuffle} onClick={toggleShuffle}>
        <span aria-hidden>🔀</span>
      </IconButton>
      <IconButton label={REPEAT_LABEL[repeatMode]} size={size} active={repeatMode === "one"} onClick={cycleRepeat}>
        <span aria-hidden>🔂</span>
      </IconButton>
    </>
  );
}
