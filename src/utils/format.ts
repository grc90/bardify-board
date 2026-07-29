export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function truncateTags(tags: string[], max: number): { visible: string[]; hidden: number } {
  if (tags.length <= max) return { visible: tags, hidden: 0 };
  return { visible: tags.slice(0, max), hidden: tags.length - max };
}
