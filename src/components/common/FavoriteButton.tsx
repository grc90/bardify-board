import { useFavoritesStore } from "../../stores/favoritesStore";
import { useUIStore } from "../../stores/uiStore";
import { IconButton } from "./IconButton";

interface FavoriteButtonProps {
  videoId: string;
  videoTitle: string;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({ videoId, videoTitle, size = "md" }: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((s) => s.ids.has(videoId));
  const toggle = useFavoritesStore((s) => s.toggle);
  const pushToast = useUIStore((s) => s.pushToast);

  return (
    <IconButton
      label={isFavorite ? `Quitar "${videoTitle}" de favoritos` : `Añadir "${videoTitle}" a favoritos`}
      size={size}
      active={isFavorite}
      onClick={async (e) => {
        e.stopPropagation();
        const nowFavorite = await toggle(videoId);
        pushToast(nowFavorite ? "Añadido a favoritos." : "Quitado de favoritos.", "success");
      }}
    >
      <span aria-hidden className={isFavorite ? "text-yellow-400" : ""}>
        {isFavorite ? "★" : "☆"}
      </span>
    </IconButton>
  );
}
