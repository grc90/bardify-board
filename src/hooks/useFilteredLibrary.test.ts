import { describe, expect, it } from "vitest";
import { matchesTagFilter } from "./useFilteredLibrary";
import type { SoundVideo } from "../types";

const video: SoundVideo = {
  id: "1",
  title: "Battle Arena",
  url: "https://www.youtube.com/watch?v=1",
  thumbnailUrl: "https://img.youtube.com/vi/1/hqdefault.jpg",
  tags: ["combate", "épico", "intenso"],
};

describe("matchesTagFilter", () => {
  it("returns true when no tags are selected", () => {
    expect(matchesTagFilter(video, [], "all")).toBe(true);
  });

  it("mode 'all' requires every selected tag to be present", () => {
    expect(matchesTagFilter(video, ["combate", "épico"], "all")).toBe(true);
    expect(matchesTagFilter(video, ["combate", "taberna"], "all")).toBe(false);
  });

  it("mode 'any' requires at least one selected tag to be present", () => {
    expect(matchesTagFilter(video, ["taberna", "épico"], "any")).toBe(true);
    expect(matchesTagFilter(video, ["taberna", "viaje"], "any")).toBe(false);
  });

  it("is accent- and case-insensitive", () => {
    expect(matchesTagFilter(video, ["EPICO"], "all")).toBe(true);
  });
});
