import { describe, expect, it } from "vitest";
import { extractYouTubeId, thumbnailUrlFor } from "./youtube";

describe("extractYouTubeId", () => {
  it("extracts from a standard watch URL", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=3YO67uD8TAo")).toBe("3YO67uD8TAo");
  });

  it("extracts from a short youtu.be URL", () => {
    expect(extractYouTubeId("https://youtu.be/3YO67uD8TAo")).toBe("3YO67uD8TAo");
  });

  it("extracts from an embed URL", () => {
    expect(extractYouTubeId("https://www.youtube.com/embed/3YO67uD8TAo")).toBe("3YO67uD8TAo");
  });

  it("accepts a bare 11-character ID", () => {
    expect(extractYouTubeId("3YO67uD8TAo")).toBe("3YO67uD8TAo");
  });

  it("returns null for invalid input", () => {
    expect(extractYouTubeId("not a url")).toBeNull();
    expect(extractYouTubeId("")).toBeNull();
  });
});

describe("thumbnailUrlFor", () => {
  it("builds the hqdefault thumbnail URL", () => {
    expect(thumbnailUrlFor("abc")).toBe("https://img.youtube.com/vi/abc/hqdefault.jpg");
  });
});
