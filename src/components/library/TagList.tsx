import { useState } from "react";
import { useUIStore } from "../../stores/uiStore";
import { truncateTags } from "../../utils/format";

interface TagListProps {
  tags: string[];
  max?: number;
}

export function TagList({ tags, max = 3 }: TagListProps) {
  const [expanded, setExpanded] = useState(false);
  const toggleTag = useUIStore((s) => s.toggleTag);
  const selectedTags = useUIStore((s) => s.selectedTags);

  const { visible, hidden } = expanded ? { visible: tags, hidden: 0 } : truncateTags(tags, max);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((tag) => {
        const selected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTag(tag);
            }}
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
              selected
                ? "bg-violet-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
            }`}
            title={`Filtrar por "${tag}"`}
          >
            {tag}
          </button>
        );
      })}
      {hidden > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
          className="rounded-full bg-neutral-800/70 px-2 py-0.5 text-[11px] font-medium text-neutral-400 hover:bg-neutral-700 hover:text-white"
          title={tags.slice(max).join(", ")}
        >
          +{hidden}
        </button>
      )}
      {expanded && tags.length > max && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(false);
          }}
          className="rounded-full bg-neutral-800/70 px-2 py-0.5 text-[11px] font-medium text-neutral-400 hover:bg-neutral-700 hover:text-white"
        >
          ver menos
        </button>
      )}
    </div>
  );
}
