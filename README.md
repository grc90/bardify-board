# Bardify Board

Soundboard musical para ambientar partidas de rol de mesa. Permite explorar una
biblioteca de música ambiental de YouTube, buscarla y filtrarla por tags,
armar playlists por escena ("Combate", "Taberna", "Viaje"...), gestionar una
cola de reproducción y llevar un historial de lo reproducido — todo pensado
para usarse cómodamente mientras se dirige una sesión.

## Objetivo

Dar a quien dirige la partida un control rápido de la música ambiental:
pocos clics para reproducir, cambiar de escena o encontrar la pista correcta
en mitad de la sesión, sin depender de pestañas sueltas de YouTube.

## Stack técnico

- **React 19 + TypeScript** sobre **Vite**
- **Tailwind CSS 4** para estilos
- **Zustand** para estado global (biblioteca, reproducción, cola, playlists,
  favoritos, historial, UI)
- **Dexie (IndexedDB)** para datos persistentes (biblioteca, playlists, cola,
  favoritos, historial)
- **localStorage** para preferencias ligeras (volumen, mute, repeat, shuffle,
  vista, modo de coincidencia de tags, paneles abiertos, modo sesión)
- **react-youtube** (YouTube IFrame Player API) para una única instancia de
  reproductor persistente
- **Vitest** para pruebas de la lógica principal

## Instalación y ejecución

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # compila TypeScript y genera el build de producción en dist/
npm run preview   # sirve el build de producción localmente
npm run test      # ejecuta la suite de Vitest
npm run lint      # ejecuta oxlint
```

## Biblioteca musical

La biblioteca por defecto vive en [`src/data/bardify-videos.json`](src/data/bardify-videos.json),
un array de objetos:

```ts
interface SoundVideo {
  id: string;           // ID de video de YouTube
  title: string;
  url: string;
  thumbnailUrl: string;
  tags: string[];        // usadas tal cual, sin normalizar ni traducir
}
```

Al iniciar, la app carga este JSON automáticamente y lo valida (campos
obligatorios, `tags` como array, IDs duplicados). Las filas inválidas se
omiten y se informan en consola y, cuando aplica, en la interfaz —no bloquean
el resto de la biblioteca.

### Reemplazar la biblioteca

Desde **Configuración → Biblioteca musical** se puede:

- **Importar** un archivo `.json` (mismo formato que arriba) o `.csv` con
  columnas `Título` / `URL` / `Tags normalizadas (10)` (también acepta
  `title` / `url` / `tags`). El importador muestra una vista previa con los
  videos válidos y los errores por fila antes de confirmar, y deja elegir
  entre **añadir** a la biblioteca actual o **reemplazarla**.
- **Exportar** la biblioteca activa como JSON.
- **Restaurar** la biblioteca predeterminada si se había importado una
  personalizada (queda guardada en IndexedDB y se recarga sola en futuras
  visitas mientras exista).

Al importar CSV, el ID de YouTube se extrae de la URL y el thumbnail se
genera como `https://img.youtube.com/vi/{ID}/hqdefault.jpg`.

## Playlists, cola y repeat

- Las **playlists** son permanentes (IndexedDB): crear, renombrar, describir,
  duplicar, eliminar, reordenar por drag & drop, fijar como acceso rápido y
  exportar/importar en JSON (individual o en lote). Al importar se valida que
  los `videoIds` existan en la biblioteca activa y se informa cuántos faltan.
- La **cola** es temporal e independiente de las playlists: añadir al final,
  reproducir a continuación, reordenar por drag & drop, vaciar (con
  confirmación si tiene varios elementos) y guardar como playlist nueva. Si
  se reproduce un video desde la biblioteca sin cola activa, se arma una cola
  con los resultados visibles en ese momento, empezando por ese video.
- **Repeat** es un interruptor simple: repite en bucle la canción que está
  sonando (no toda la cola). **Shuffle** se puede activar sin perder el
  orden original de la cola. Ambos se recuerdan entre sesiones (localStorage).

## Atajos de teclado

| Tecla | Acción |
|---|---|
| `Espacio` | Reproducir / pausar |
| `→` / `←` | Siguiente / anterior |
| `R` | Cambiar modo de repeat |
| `S` | Alternar shuffle |
| `F` | Marcar / desmarcar favorito |
| `/` | Enfocar el buscador |
| `Q` | Abrir / cerrar la cola |
| `M` | Silenciar / activar sonido |
| `Esc` | Cerrar modal, drawer o panel activo |

No se activan mientras se escribe en un campo de texto. La ventana de ayuda
(**Configuración → Ver atajos de teclado**) los lista en pantalla.

## Modo sesión

Botón "🎭 Modo sesión" en la barra superior: oculta la navegación a
Favoritos/Historial/Configuración y reduce distracciones para dejar más
espacio a la biblioteca, las playlists fijadas y el reproductor durante la
partida. Se sale con el mismo botón ("✕ Salir del modo sesión").

## Limitaciones conocidas de YouTube

- **Autoplay**: los navegadores exigen una interacción del usuario antes de
  reproducir audio. La primera reproducción de la sesión requiere un clic
  (por ejemplo, sobre una tarjeta de la biblioteca); a partir de ahí, los
  cambios de pista dentro de la misma sesión de navegación autorreproducen
  con normalidad.
- **Crossfade real no es viable**: la IFrame API de YouTube no permite
  reproducir (ni precargar con sonido) dos videos a la vez de forma
  confiable entre dominios. En su lugar, se aplica un **fade-out** configurable
  (0–6s, en Configuración) antes de cambiar de pista y el volumen se
  restablece al iniciar la siguiente.
- **Videos privados, eliminados o sin permiso de reproducción embebida**:
  la API reporta un error (códigos 100/101/150) que se muestra como toast y
  en el reproductor; la app intenta continuar automáticamente con el
  siguiente elemento de la cola.
- Solo existe **una instancia** del reproductor de YouTube en toda la app
  (oculta, controlada de forma imperativa); las tarjetas nunca incrustan un
  iframe propio, solo su thumbnail estático.

## Estructura del proyecto

```text
src/
  components/     # UI: library, player, playlists, queue, filters, layout, favorites, history, settings, common
  context/         # PlayerControllerContext: puente entre el store de reproducción y react-youtube
  data/            # bardify-videos.json (biblioteca por defecto)
  hooks/           # useFilteredLibrary, useTagStats, useKeyboardShortcuts, useVideoById...
  services/
    storage/       # Dexie (db.ts) y preferencias en localStorage (prefs.ts)
    import/        # validación de JSON y parsing de CSV
    youtube/        # tipos del reproductor de YouTube
    export.ts       # descarga de JSON (biblioteca/playlists)
  stores/          # Zustand: library, playback (cola+reproductor), playlists, favorites, history, ui
  types/           # SoundVideo, Playlist, QueueItem, RepeatMode, TagMatchMode, PlaybackHistoryEntry...
  utils/           # normalización de texto, extracción de ID de YouTube, formato de tiempo/tags
```

## Pruebas

`npm run test` cubre la lógica que no depende del DOM ni de la red:
normalización de búsqueda, filtrado por tags (`all`/`any`), extracción de ID
de YouTube, validación e importación de JSON/CSV, gestión de cola (orden,
reordenado, next/prev, repeat, shuffle) y persistencia de playlists en
IndexedDB (vía `fake-indexeddb`).

## Qué queda para una v2

- Duración real de las playlists (requiere consultar la duración de cada
  video, no incluida en los datos de origen).
- Reordenamiento de cola/playlists accesible por teclado además de
  drag & drop.
- Sincronización/backend opcional para compartir bibliotecas y playlists
  entre dispositivos.
