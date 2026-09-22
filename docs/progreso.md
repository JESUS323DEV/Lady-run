# Progreso (`profiles.progress`)

## Qué es

Una columna `jsonb` en `profiles` (ver `supabase/sql/022_progress_sync.sql`) que guarda TODO el progreso del jugador que no son ni las 3 monedas ni el avatar equipado (esas viven en sus propias columnas). Antes de esta migración, todo esto vivía SOLO en `localStorage`, aislado por navegador - ahora viaja con la cuenta.

## Qué guarda, por clave

- `ladyRunTutorial` / `ladyRunLibreTutorial` / `ladyRunRunTutorial`: `{ completed: true/false }` de cada uno de los 3 tutoriales (ver `docs/tutorial.md`).
- `ladyRunUnlockedFrames`: array de ids de marcos de avatar desbloqueados.
- `ladyRunUnlockedDogs`: array de ids de perros desbloqueados.
- `ladyRunOwnedSkins`: `{ [dogId]: [skinId, ...] }`, skins compradas por perro.
- `ladyRunEquippedSkinByDog`: `{ [dogId]: skinId }`, skin equipada por perro.
- `ladyRunPendingHearts` / `ladyRunMagicHearts` / `ladyRunGreenHearts`: corazones en inventario (extra/mágico/verde).
- `ladyRunDailyFreeClaimedAt`: `{ [itemId]: timestamp }`, para el corazón gratis diario.
- `ladyRunDailyRuns` / `ladyRunDailyTramos`: contadores diarios por dificultad, con `rotationKey` para saber si ya tocó resetearlos (ver `dateRotation.js`).
- `ladyRunBestDistance`: récord LOCAL por perro (`{ [dogId]: metros }`) - **no es el récord real del Ranking**, es un tracker reservado para una futura tarjeta de estadísticas por perro. El récord real siempre sale de `getLadyRunBestDistance()` contra la tabla `runs`.
- `ladyRunEventosNodesDone` / `ladyRunEventosClaimedNodes`: progreso del modo Eventos (bloqueado, sin contenido todavía).

## Cómo se lee/escribe desde el código

`useLadyRunProfile.js` expone `updateProgress(updater)`: mismo patrón que un `useState` funcional (`prev => ({...prev, x: y})`), pero en vez de guardar en memoria local, actualiza el estado optimista Y persiste en Supabase de fondo (`supabase.from('profiles').update({ progress })`). En `LadyRunStandalone.jsx`, `gameState`/`setGameState` son alias de `profile?.progress` / `updateProgress`, para no tener que reescribir cada sitio que ya usaba ese patrón cuando esto vivía en localStorage.

## Migración de progreso viejo

Si un jugador tenía progreso en `localStorage` de antes de esta migración y su `profiles.progress` en la nube llega vacío, un `useEffect` en `LadyRunStandalone.jsx` lo sube tal cual una sola vez (`migratedRef`), para no perder nada al pasar a Supabase. A partir de ahí, `localStorage` deja de leerse - Supabase es la única fuente de verdad.
