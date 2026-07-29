import { describe, expect, it } from "vitest";
import { matchesSearch, normalizeText } from "./text";

describe("normalizeText", () => {
  it("lowercases and strips accents", () => {
    expect(normalizeText("Épico Mágico")).toBe("epico magico");
  });

  it("collapses extra whitespace and trims", () => {
    expect(normalizeText("  taberna   oscura  ")).toBe("taberna oscura");
  });

  it("handles empty strings", () => {
    expect(normalizeText("")).toBe("");
  });
});

describe("matchesSearch", () => {
  it("matches regardless of accents and case", () => {
    expect(matchesSearch(["Exploración", "Bosque"], "exploracion")).toBe(true);
  });

  it("returns true for empty query", () => {
    expect(matchesSearch(["Taberna"], "   ")).toBe(true);
  });

  it("returns false when nothing matches", () => {
    expect(matchesSearch(["Taberna", "Cerveza"], "combate")).toBe(false);
  });
});
