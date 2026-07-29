import { Modal } from "./Modal";
import { useUIStore } from "../../stores/uiStore";

const SHORTCUTS: [string, string][] = [
  ["Espacio", "Reproducir / pausar"],
  ["→", "Siguiente pista"],
  ["←", "Pista anterior"],
  ["R", "Repetir la canción actual (activar/desactivar)"],
  ["S", "Activar / desactivar aleatorio"],
  ["F", "Marcar / desmarcar favorito"],
  ["/", "Enfocar el buscador"],
  ["Q", "Abrir / cerrar la cola"],
  ["M", "Silenciar / activar sonido"],
  ["Esc", "Cerrar modal, panel o drawer activo"],
];

export function ShortcutsHelpModal() {
  const open = useUIStore((s) => s.shortcutsHelpOpen);
  const setOpen = useUIStore((s) => s.setShortcutsHelpOpen);

  if (!open) return null;

  return (
    <Modal title="Atajos de teclado" onClose={() => setOpen(false)}>
      <ul className="flex flex-col gap-2">
        {SHORTCUTS.map(([key, desc]) => (
          <li key={key} className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">{desc}</span>
            <kbd className="rounded-md border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-mono text-xs text-neutral-200">
              {key}
            </kbd>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-neutral-500">
        Los atajos no se activan mientras escribes en un campo de texto.
      </p>
    </Modal>
  );
}
