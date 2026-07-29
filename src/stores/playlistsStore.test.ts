import { beforeEach, describe, expect, it } from "vitest";
import { usePlaylistsStore } from "./playlistsStore";
import { db } from "../services/storage/db";

describe("playlistsStore persistence", () => {
  beforeEach(async () => {
    await db.playlists.clear();
    usePlaylistsStore.setState({ playlists: [], loaded: false });
  });

  it("creates a playlist and persists it to IndexedDB", async () => {
    const playlist = await usePlaylistsStore.getState().create("Combate", "Música de batalla", ["a", "b"]);
    expect(usePlaylistsStore.getState().playlists).toHaveLength(1);

    const stored = await db.playlists.get(playlist.id);
    expect(stored?.name).toBe("Combate");
    expect(stored?.videoIds).toEqual(["a", "b"]);
  });

  it("rehydrates playlists from IndexedDB on init", async () => {
    await usePlaylistsStore.getState().create("Taberna", undefined, ["x"]);
    usePlaylistsStore.setState({ playlists: [], loaded: false });

    await usePlaylistsStore.getState().init();
    expect(usePlaylistsStore.getState().playlists).toHaveLength(1);
    expect(usePlaylistsStore.getState().playlists[0].name).toBe("Taberna");
  });

  it("does not add a duplicate video to the same playlist", async () => {
    const playlist = await usePlaylistsStore.getState().create("Viaje", undefined, ["a"]);
    const added = await usePlaylistsStore.getState().addVideo(playlist.id, "a");
    expect(added).toBe(false);
    expect(usePlaylistsStore.getState().playlists[0].videoIds).toEqual(["a"]);
  });

  it("reorders videos within a playlist", async () => {
    const playlist = await usePlaylistsStore.getState().create("Orden", undefined, ["a", "b", "c"]);
    await usePlaylistsStore.getState().reorderVideos(playlist.id, 0, 2);
    const stored = await db.playlists.get(playlist.id);
    expect(stored?.videoIds).toEqual(["b", "c", "a"]);
  });
});
