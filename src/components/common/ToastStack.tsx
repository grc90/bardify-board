import { useUIStore } from "../../stores/uiStore";

const KIND_STYLES: Record<string, string> = {
  success: "border-emerald-700/60 bg-emerald-950/90 text-emerald-100",
  error: "border-red-700/60 bg-red-950/90 text-red-100",
  info: "border-neutral-700 bg-neutral-900/95 text-neutral-100",
};

export function ToastStack() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-24 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-6"
      aria-live="polite"
      role="status"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-toast-in rounded-lg border px-4 py-2.5 text-sm shadow-lg ${KIND_STYLES[t.kind]}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{t.text}</span>
            <button
              type="button"
              aria-label="Descartar notificación"
              onClick={() => dismissToast(t.id)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
