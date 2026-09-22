# Modo Libre

El único modo jugable hoy (Historia, Eventos, Torneo están bloqueados/"Próximamente").

## Flujo

1. Elegir escenario (ruleta lateral) y dificultad.
2. Empezar a correr: esquivar obstáculos, recoger huesos y corazones, la distancia sube sola con el tiempo.
3. Game over al chocar - se muestra la distancia final, si es nuevo récord (contra `getLadyRunBestDistance`, ver `docs/ranking.md`), y las recompensas ganadas.

## Dificultades

`facil`, `medio`, `dificil` (`DIFFICULTY_ORDER` en `RunnerScreen.jsx`) - afectan velocidad, frecuencia de obstáculos, y cuándo aparece el primer corazón en pista.

## Escenarios / biomas

`bosque`, `ciudad`, `desierto`, `minas`, `pradera`, `hielo` (`LIBRE_SCENE_STATIC_IMGS`). Cada uno tiene su propio fondo estático, usado también como fondo de pantalla completo durante la carrera y en el game over (`.runner-screen-scene-bg`).

## Corazones (vidas)

Tres tipos, todos en inventario (`profiles.progress`, ver `docs/progreso.md`), comprables en la Tienda (ver `docs/tienda.md`):

- **Corazón extra**: una vida de más para la próxima carrera.
- **Corazón mágico**: invulnerabilidad temporal al usarse en pista (máx. 2 en inventario).
- **Corazón verde** (escudo): protege de un choque (máx. 5 en inventario).

## Contadores diarios

`ladyRunDailyRuns` / `ladyRunDailyTramos` en `profiles.progress`, con una `rotationKey` (ver `dateRotation.js`) para saber si el día ya rotó y hay que resetear el contador. Limitan cuántas carreras con recompensa completa (loot) se pueden hacer al día por dificultad.

## Récord local vs récord real

`ladyRunBestDistance` (en `progress`) es un tracker LOCAL por perro, reservado para una futura tarjeta de estadísticas - **nunca se usa para decidir "¡Nuevo récord!"**. Esa comparación siempre usa `getLadyRunBestDistance({ difficulty })` (`ladyRunOnlineRuns.js`), que consulta la tabla `runs` de Supabase, tu mejor distancia real en esa dificultad, contando todos tus perros.
