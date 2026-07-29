import { describe, expect, it } from "vitest";
import { validateVideos } from "./validate";

describe("validateVideos", () => {
  it("accepts well-formed videos", () => {
    const result = validateVideos([
      { id: "a", title: "A", url: "https://youtube.com/watch?v=a", thumbnailUrl: "x", tags: ["combate"] },
    ]);
    expect(result.videos).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects rows missing required fields without blocking the rest", () => {
    const result = validateVideos([
      { id: "a", title: "A", url: "https://youtube.com/watch?v=a", tags: ["combate"] },
      { title: "Missing id", url: "https://youtube.com/watch?v=b", tags: [] },
      { id: "c", title: "C", url: "https://youtube.com/watch?v=c", tags: ["taberna"] },
    ]);
    expect(result.videos.map((v) => v.id)).toEqual(["a", "c"]);
    expect(result.errors).toHaveLength(1);
  });

  it("rejects tags that are not an array of strings", () => {
    const result = validateVideos([{ id: "a", title: "A", url: "https://youtube.com/watch?v=a", tags: "combate" }]);
    expect(result.videos).toHaveLength(0);
    expect(result.errors[0].message).toMatch(/tags/);
  });

  it("drops duplicate ids and reports them", () => {
    const result = validateVideos([
      { id: "a", title: "A", url: "https://youtube.com/watch?v=a", tags: [] },
      { id: "a", title: "A dup", url: "https://youtube.com/watch?v=a2", tags: [] },
    ]);
    expect(result.videos).toHaveLength(1);
    expect(result.duplicates).toEqual(["a"]);
  });

  it("returns an error when the input is not an array", () => {
    const result = validateVideos({ not: "an array" });
    expect(result.videos).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
  });
});
