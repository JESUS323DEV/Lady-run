# Ranking

## Cómo se guarda una partida

Cada carrera de Modo Libre terminada inserta una fila en la tabla `runs` (Supabase): `profile_id`, `dog_id`, `biome`, `difficulty`, `distance`. Va directo a Supabase desde el principio, nunca vivió en local.

## La vista `leaderboard`

Una fila por **jugador + dificultad** (no por escenario), con la mejor distancia (`MAX`) de ese jugador en esa dificultad, más el avatar equipado y el último perro usado en esa dificultad. Se recalcula sola al consultarla, no hay que mantenerla a mano.

```sql
select profile_id, username, avatar_dog_id, difficulty, best_distance, last_dog_id
from leaderboard
```

## Cómo se usa en el cliente

- **Pantalla de Ranking** (`LadyRunRankingModal.jsx`): lista ordenada de mayor a menor `best_distance`, filtrable por dificultad.
- **`getLadyRunBestDistance({ difficulty })`** (`ladyRunOnlineRuns.js`): tu propia mejor distancia en esa dificultad, usada para decidir "¡Nuevo récord!" en el game over y para el HUD de metros en vivo (récord mostrado junto a la distancia actual). Esta es la única fuente real de "tu récord" - nunca el tracker local `ladyRunBestDistance` (ver `docs/progreso.md`).

## Bloqueo hasta terminar el tutorial

El botón de Ranking queda bloqueado hasta completar el tutorial de dentro de la carrera (`ladyRunRunTutorialCompleted`, ver `docs/tutorial.md`).

## Hueco de seguridad conocido

El `insert` en `runs` acepta cualquier `distance` que mande el cliente, sin comprobar si es creíble (nadie valida un tope máximo razonable). Arreglo pensado pero no hecho: una función `submit_run(...)` con un límite tipo 50.000m que rechace valores absurdos. Aparcado, ver `FEATURES.md`.
