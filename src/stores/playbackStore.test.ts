import { beforeEach, describe, expect, it } from "vitest";
import { usePlaybackStore } from "./playbackStore";

function resetStore() {
  usePlaybackStore.setState({
    queue: [],
    currentIndex: -1,
    shuffleOrder: [],
    shufflePos: 0,
    playing: false,
    repeatMode: "off",
    shuffle: false,
    progress: 0,
    duration: 0,
    error: null,
  });
}

describe("playbackStore queue management", () => {
  beforeEach(resetStore);

  it("replaces the queue and starts at the given index", () => {
    usePlaybackStore.getState().replaceQueue(["a", "b", "c"], 1);
    const state = usePlaybackStore.getState();
    expect(state.queue.map((q) => q.videoId)).toEqual(["a", "b", "c"]);
    expect(state.currentIndex).toBe(1);
  });

  it("advances to the next track and stops at the end without repeat", () => {
    usePlaybackStore.getState().replaceQueue(["a", "b"], 0);
    usePlaybackStore.getState().next();
    expect(usePlaybackStore.getState().currentIndex).toBe(1);
    usePlaybackStore.getState().next();
    expect(usePlaybackStore.getState().currentIndex).toBe(1);
    expect(usePlaybackStore.getState().playing).toBe(false);
  });

  it("wraps around when repeat mode is 'all'", () => {
    usePlaybackStore.getState().replaceQueue(["a", "b"], 0);
    usePlaybackStore.setState({ repeatMode: "all" });
    usePlaybackStore.getState().next();
    usePlaybackStore.getState().next();
    expect(usePlaybackStore.getState().currentIndex).toBe(0);
  });

  it("toggles repeat mode between off and one (repeat only the current song)", () => {
    expect(usePlaybackStore.getState().repeatMode).toBe("off");
    usePlaybackStore.getState().cycleRepeat();
    expect(usePlaybackStore.getState().repeatMode).toBe("one");
    usePlaybackStore.getState().cycleRepeat();
    expect(usePlaybackStore.getState().repeatMode).toBe("off");
  });

  it("addNext inserts right after the current track", () => {
    usePlaybackStore.getState().replaceQueue(["a", "b"], 0);
    usePlaybackStore.getState().addNext("z");
    expect(usePlaybackStore.getState().queue.map((q) => q.videoId)).toEqual(["a", "z", "b"]);
  });

  it("removeFromQueue keeps currentIndex pointing at the same track", () => {
    usePlaybackStore.getState().replaceQueue(["a", "b", "c"], 2);
    const queueIdOfA = usePlaybackStore.getState().queue[0].queueId;
    usePlaybackStore.getState().removeFromQueue(queueIdOfA);
    const state = usePlaybackStore.getState();
    expect(state.queue.map((q) => q.videoId)).toEqual(["b", "c"]);
    expect(state.queue[state.currentIndex].videoId).toBe("c");
  });

  it("reorderQueue keeps the currently playing track selected", () => {
    usePlaybackStore.getState().replaceQueue(["a", "b", "c"], 0);
    usePlaybackStore.getState().reorderQueue(0, 2);
    const state = usePlaybackStore.getState();
    expect(state.queue.map((q) => q.videoId)).toEqual(["b", "c", "a"]);
    expect(state.queue[state.currentIndex].videoId).toBe("a");
  });

  it("shuffle never places the currently playing track first in the upcoming order", () => {
    usePlaybackStore.getState().replaceQueue(["a", "b", "c", "d", "e"], 0);
    usePlaybackStore.getState().toggleShuffle();
    const { shuffleOrder, queue, currentIndex } = usePlaybackStore.getState();
    expect(shuffleOrder[0]).toBe(queue[currentIndex].queueId);
  });

  it("clearQueue empties the queue and stops playback", () => {
    usePlaybackStore.getState().replaceQueue(["a", "b"], 0);
    usePlaybackStore.getState().clearQueue();
    const state = usePlaybackStore.getState();
    expect(state.queue).toHaveLength(0);
    expect(state.currentIndex).toBe(-1);
    expect(state.playing).toBe(false);
  });
});
