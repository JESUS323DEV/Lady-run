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

## Panel de usuario (avatar)

- [x] Botón circular en la pantalla principal, abre una pantalla de avatar (círculo grande + rejilla de perros desbloqueados para equipar como avatar, ligado a `profiles.avatar_dog_id` en Supabase). `LadyRunAvatarModal.jsx` + `useLadyRunProfile.equipAvatar`.
- [x] Arreglado (2026-09-14): el botón se ocultaba mal y tapaba la flecha "←" de Tienda/Ranking/la propia pantalla de avatar (mismo hueco fijo en pantalla, no se ocultaba mientras esos modales estaban abiertos). Ahora su condición incluye `!shopOpen && !rankingOpen && !avatarOpen`.
- [x] El Ranking ya muestra el avatar equipado en vez del círculo vacío cuando existe.
- Cambiar el ID sigue aparcado (no entra en esta versión, ver sección Auth/Usuarios).

## UI / Selector de perro

- Pendiente ajustar: en el selector de perro de Modo Libre, cada card muestra color de borde por rareza y fondo/icono por elemento (`dog-rarity-*`, `runner-dog-select-elembg-*`), pero en Modo Libre ninguno de los dos afecta al juego - son datos que solo tendrán sentido de verdad en Historia (combate, debilidades por elemento, etc.). De momento se deja tal cual porque quitarlo sin más deja las cards sin marco/cuadro visual. Falta decidir un tratamiento visual propio para Modo Libre antes de quitar la rareza/elemento de ahí.

## Gameplay / Balance

- Pendiente ajustar: `DOG_SIZE_TIER` en `RunnerScreen.jsx` (linea ~407) - cada perro tiene un porte (small/medium/large) que define su tamaño visual real (48/56/64px) y un margen extra de colision en Modo Libre (0/3/6px, mayor cuanto mas grande el perro). Sigue activo, se usa en la colision de verdad (linea ~2337), pero nunca se ha repasado si esos valores estan bien equilibrados entre perros.

## Idiomas / itch.io

- Idea: publicar en itch.io, donde el público en inglés juega más. Ahora mismo el traductor automático del navegador (Brave/Chrome) traduce bien la UI porque los botones no tienen ancho fijo (se adaptan al texto vía padding, no algo buscado a propósito), pero NO es una solución real: no todos los visitantes lo tienen activo (sobre todo en móvil), y traduciría mal cosas que son nombre propio/lore y no deberían tocarse (Chapas, Huesín, nombres de los perros).
- Si el público inglés importa de verdad para ese lanzamiento: i18n real más adelante (objeto de textos por idioma + toggle). No es prioridad ahora.

## Ideas locas

Divagaciones sin decidir, no hay compromiso de hacerlas, solo quedan apuntadas para no perderlas.

- Torneo 1v1: bracket de jugadores (aforo fijo tipo 4/8, no numero libre para que el bracket cuadre), cada uno juega su run normal de forma async (nada de sincronizar partidas en vivo), se compara distancia y el que gana avanza de ronda. Encajaria con la card "Torneo" ya reservada en la UI.
- Ghost del rival: en vez de un CPU en vivo, mostrar 2 cards (la tuya + la del rival) donde el rival reproduce con retraso una run real ya grabada. Requeriria grabar la timeline de la partida (saltos, esquives) y no solo el resultado final como ahora, es un cambio de que se guarda, no un simple añadido.
- Huecos vacios en el bracket rellenados con IA: reusar la logica de rival CPU que ya existe en Historia (boss) para generar una "run" de bot cuando faltan jugadores reales, asi el torneo nunca se queda colgado esperando gente.
- Version mas simple tipo battle royale (aforo 5/10/15): todos juegan su partida de forma independiente, no compite en tiempo real contra nadie, solo se muestra visualmente quien va perdiendo/cuantos quedan via Supabase Realtime. Mas facil que sincronizar partidas, pero mas dificil de definir bien quien "gana" al final.

## Seguridad

- [x] (2026-09-15) Las 3 monedas (chapas, tavernCoins, huesín) ya NO viven en localStorage editable. Ahora viven en `profiles` en Supabase, sin permiso de UPDATE directo desde el cliente - solo se pueden tocar via `earn_currency`/`spend_currency` (funciones RPC con el precio fijo dentro, ver `supabase/sql/008_profiles_currency.sql`). Perros desbloqueados y corazones en inventario siguen en local por ahora, sin cambiar.
- Pendiente: el ranking (tabla `runs`) sí va directo a Supabase desde el principio (nunca vivió en local, no tiene el mismo problema), pero el INSERT de una partida acepta cualquier `distance` que mande el cliente sin comprobar si es creíble. Arreglo mínimo pensado: una función `submit_run(...)` con un tope de distancia máxima razonable (ej. 50.000m) que rechace valores absurdos tipo 999999. No evita hacer trampa con un número "creíble", solo corta los casos tontos. Aparcado por ahora, decidido dejarlo tal cual.
