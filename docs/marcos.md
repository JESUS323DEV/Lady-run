# Marcos de avatar

El borde/decoración alrededor de la foto del perro en el avatar, visible en el Ranking. Catálogo en `ladyRunAvatarFramesCatalog.js`, picker en la pestaña "Marcos" de la pantalla Perfil (`LadyRunAvatarModal.jsx`).

## Cómo se define el catálogo

Igual que las skins: se lee la carpeta `src/assets/ui/marcos-avatar/` directamente (`import.meta.glob`), añadir un marco nuevo es solo poner el archivo.

## Dos grupos

- **Marco base** (`marco-base`): mismo precio para todas las variantes de pago (Marco-4/5/6 en adelante), Marco-1/2/3 gratis. El perro va centrado dentro del marco.
- **Marco Animado** (`marco-fondo`): cada variante tiene su propio precio individual (no hay un precio de grupo único, ver `docs/economia.md`). El perro se apoya abajo en vez de ir centrado, para respetar el paisaje de fondo del marco en vez de taparlo (`lady-run-avatar-preview-photo-bottom`).

## Sub-tabs en el Perfil

Dentro de la pestaña "Marcos" hay dos sub-tabs, **Base** y **Animados**, que filtran qué grupo se muestra (`marcosSubTab` en `LadyRunAvatarModal.jsx`) - por defecto se abre en "Base", ya que ahí están los 3 marcos gratis que un jugador nuevo puede usar sin pagar.

## Equipar

Se guarda en `avatar_frame_id` (columna propia en `profiles`, visible en el Ranking) y el desbloqueo en `ladyRunUnlockedFrames` (dentro de `progress`, ver `docs/progreso.md`).
