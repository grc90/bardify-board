import { describe, expect, it } from "vitest";
import { parseCsvVideos } from "./csv";

describe("parseCsvVideos", () => {
  it("parses rows using the Spanish header names", () => {
    const csv = [
      "Título,URL,Tags normalizadas (10)",
      "Batalla,https://www.youtube.com/watch?v=3YO67uD8TAo,\"combate, épico, intenso\"",
    ].join("\n");

    const result = parseCsvVideos(csv);
    expect(result.videos).toHaveLength(1);
    expect(result.videos[0]).toMatchObject({
      id: "3YO67uD8TAo",
      title: "Batalla",
      tags: ["combate", "épico", "intenso"],
      thumbnailUrl: "https://img.youtube.com/vi/3YO67uD8TAo/hqdefault.jpg",
    });
  });

  it("also accepts simple English header aliases", () => {
    const csv = ["title,url,tags", "Tavern,https://youtu.be/orgikrTCKTc,taberna, acogedor"].join("\n");
    const result = parseCsvVideos(csv);
    expect(result.videos).toHaveLength(1);
    expect(result.videos[0].id).toBe("orgikrTCKTc");
  });

  it("skips empty rows", () => {
    const csv = ["title,url,tags", "", "Tavern,https://youtu.be/orgikrTCKTc,taberna"].join("\n");
    const result = parseCsvVideos(csv);
    expect(result.videos).toHaveLength(1);
  });

  it("reports rows with an unresolvable YouTube URL", () => {
    const csv = ["title,url,tags", "Broken,not-a-url,taberna"].join("\n");
    const result = parseCsvVideos(csv);
    expect(result.videos).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
  });

  it("detects duplicate ids across rows", () => {
    const csv = [
      "title,url,tags",
      "A,https://youtu.be/orgikrTCKTc,taberna",
      "B,https://youtu.be/orgikrTCKTc,taberna",
    ].join("\n");
    const result = parseCsvVideos(csv);
    expect(result.videos).toHaveLength(1);
    expect(result.duplicates).toEqual(["orgikrTCKTc"]);
  });

  it("errors out when required columns are missing", () => {
    const csv = ["foo,bar", "1,2"].join("\n");
    const result = parseCsvVideos(csv);
    expect(result.videos).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
  });
});
