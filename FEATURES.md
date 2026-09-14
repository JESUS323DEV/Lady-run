# Features pendientes - Lady Run

Lista de ideas/features en marcha o por hacer. Se va actualizando según avanzamos.

## Online / Ranking

- [x] Botón "Ranking" junto a "Tienda", abre `LadyRunRankingModal`.
- [x] Pantalla de Ranking (v1): un único ranking global por mayor recorrido de Modo Libre, sin separar por escenario. Cada fila: icono circular vacío (hueco reservado para avatar futuro) + ID del jugador + mejor recorrido, ordenado de mayor a menor.
- [x] Tabla `runs` en Supabase (1 fila por partida de Modo Libre terminada: `dog_id`, `biome`, `difficulty`, `distance`) + vista `leaderboard` (MAX por jugador) que alimenta el ranking.
- Card "Online" (en la fila junto a "Skins"): sigue bloqueada/"Próximamente", sin uso decidido todavía.
- Más adelante: avatar de jugador de verdad, rankings por escenario (la tabla `runs` ya lo soporta, solo falta la query+UI), torneos.

## Auth / Usuarios

- [x] Cuenta anónima de Supabase + ID elegido por el jugador (sin password), ya en el flujo real (`useLadyRunProfile` + `LadyRunUsernameScreen`, gatea la entrada a la app).
- Pendiente: el username tiene unique constraint sensible a mayúsculas ("Yisus" vs "YISUS" cuentan como distintos) - hacerlo case-insensitive en algún momento para evitar duplicados tontos.
- Pendiente: cada dispositivo/navegador crea su PROPIA cuenta anónima, no hay forma de compartir progreso/ranking entre movil y PC del mismo jugador. Solución pensada (sin perder la sencillez del ID, sin email real): añadir un campo de contraseña opcional para "reclamar" la cuenta anónima (Supabase `updateUser`) y poder iniciar sesión con el mismo ID+contraseña desde otro dispositivo, conservando el mismo historial. Decidido dejarlo aparcado por ahora: el juego está enfocado a móvil, no es prioridad.

## UI / Selector de perro

- Pendiente ajustar: en el selector de perro de Modo Libre, cada card muestra color de borde por rareza y fondo/icono por elemento (`dog-rarity-*`, `runner-dog-select-elembg-*`), pero en Modo Libre ninguno de los dos afecta al juego - son datos que solo tendrán sentido de verdad en Historia (combate, debilidades por elemento, etc.). De momento se deja tal cual porque quitarlo sin más deja las cards sin marco/cuadro visual. Falta decidir un tratamiento visual propio para Modo Libre antes de quitar la rareza/elemento de ahí.

## Idiomas / itch.io

- Idea: publicar en itch.io, donde el público en inglés juega más. Ahora mismo el traductor automático del navegador (Brave/Chrome) traduce bien la UI porque los botones no tienen ancho fijo (se adaptan al texto vía padding, no algo buscado a propósito), pero NO es una solución real: no todos los visitantes lo tienen activo (sobre todo en móvil), y traduciría mal cosas que son nombre propio/lore y no deberían tocarse (Chapas, Huesín, nombres de los perros).
- Si el público inglés importa de verdad para ese lanzamiento: i18n real más adelante (objeto de textos por idioma + toggle). No es prioridad ahora.

## Seguridad

- Ahora mismo TODO el progreso (chapas, tavernCoins, huesín, perros desbloqueados, corazones...) vive en localStorage, editable a mano desde la consola del navegador. Cuando se mueva a Supabase, hacerlo bien: RLS bloqueando el UPDATE directo de esos valores desde el cliente, y que las subidas de moneda pasen por una función RPC de Postgres con la lógica del juego (no un UPDATE libre a la fila propia), si no el mismo problema solo cambia de sitio (se podría hacer desde la consola con la sesión de Supabase en vez de con localStorage).
- Decidido por ahora: no es prioridad, se deja para más adelante. Riesgo bajo mientras esto no tenga tráfico real.
