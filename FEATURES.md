# Features pendientes - Lady Run

Lista de ideas/features en marcha o por hacer. Se va actualizando según avanzamos.

## Online / Ranking

- [x] Botón "Ranking" junto a "Tienda", abre `LadyRunRankingModal`.
- [x] Pantalla de Ranking (v1): un único ranking global por mayor recorrido de Modo Libre, sin separar por escenario. Cada fila: icono circular vacío (hueco reservado para avatar futuro) + ID del jugador + mejor recorrido, ordenado de mayor a menor.
- [x] Tabla `runs` en Supabase (1 fila por partida de Modo Libre terminada: `dog_id`, `biome`, `difficulty`, `distance`) + vista `leaderboard` (MAX por jugador) que alimenta el ranking.
- Card "Online" (en la fila donde estaba "Skins", ver sección Skins más abajo): sigue bloqueada/"Próximamente", sin uso decidido todavía.
- Más adelante: avatar de jugador de verdad, rankings por escenario (la tabla `runs` ya lo soporta, solo falta la query+UI), torneos.

## Auth / Usuarios

- [x] Cuenta anónima de Supabase + ID elegido por el jugador (sin password), ya en el flujo real (`useLadyRunProfile` + `LadyRunUsernameScreen`, gatea la entrada a la app).
- Pendiente: el username tiene unique constraint sensible a mayúsculas ("Yisus" vs "YISUS" cuentan como distintos) - hacerlo case-insensitive en algún momento para evitar duplicados tontos.
- [x] Login con Google (vincular la cuenta anónima existente, o iniciar sesión con una ya vinculada desde otro dispositivo) - `linkGoogleAccount`/`signInWithGoogleAccount` en `useLadyRunProfile.js`, botones en `LadyRunUsernameScreen.jsx` (pantalla inicial) y `LadyRunSoundSettings.jsx` (Ajustes). Todo el progreso (no solo monedas) vive en `profiles.progress` (jsonb, ver `022_progress_sync.sql`), así que viaja con la cuenta entre dispositivos. Pendiente real: la app de Google sigue en "modo de prueba" (máx. 100 usuarios añadidos a mano) hasta publicarla - necesita Política de Privacidad/Condiciones (ya creadas en `/privacidad` y `/terminos`, falta pegarlas en Google Cloud y publicar).
- Pendiente: botón "Cerrar sesión" ya existe en Ajustes (`signOut` en `useLadyRunProfile.js`), pero la sección "Cuenta" de Ajustes necesita un repaso visual (alineación/estilo del badge "Vinculada con Google", ver `LadyRunSoundSettings.css`), quedó a medias tras varias vueltas sin decidir el diseño final.

## Panel de usuario (avatar)

- [x] Botón circular en la pantalla principal, abre una pantalla de avatar (círculo grande + rejilla de perros desbloqueados para equipar como avatar, ligado a `profiles.avatar_dog_id` en Supabase). `LadyRunAvatarModal.jsx` + `useLadyRunProfile.equipAvatar`.
- [x] Arreglado (2026-09-14): el botón se ocultaba mal y tapaba la flecha "←" de Tienda/Ranking/la propia pantalla de avatar (mismo hueco fijo en pantalla, no se ocultaba mientras esos modales estaban abiertos). Ahora su condición incluye `!shopOpen && !rankingOpen && !avatarOpen`.
- [x] El Ranking ya muestra el avatar equipado en vez del círculo vacío cuando existe.
- Cambiar el ID sigue aparcado (no entra en esta versión, ver sección Auth/Usuarios).
- Bug confirmado, solo en iPhone/móvil (2026-09-18): en el paso `avatar_marcos` del tutorial, el popover de Marcos a veces se cierra (X o tocar fuera) sin que el tutorial avance, dejando el paso atascado para siempre (nunca aparece la flecha de volver, que solo sale en `avatar_volver`). En Android funciona bien. Se metieron dos arreglos en `LadyRunAvatarModal.jsx`: una red de seguridad (si el popover se cierra estando ya listo, fuerza el avance igual) y una cabecera sticky con la X más grande (teoría: fallo conocido de iOS Safari donde el primer toque justo después de hacer scroll en un contenedor a veces no dispara el evento de click). La prima del usuario lo seguía reportando en su iPhone tras ambos arreglos. Un segundo familiar (Antony) lo probó primero en su Mac (Safari de escritorio, con ratón) y ahí funcionaba bien; al probarlo en su iPhone (móvil) le pasó lo mismo que a Vanessa - confirma que el bug es especifico de móvil/táctil (Safari Y Chrome-iOS en el propio iPhone), no de escritorio, lo cual encaja con la teoria del toque perdido tras el scroll (un fallo tactil, no tendria sentido con raton). Sigue sin arreglo confirmado, pendiente de una grabación de pantalla real del movil para diagnosticar mejor. Actualización (2026-09-19): un video real de Antony confirma que ni tocar fuera de la rejilla, ni la X, ni equipar un marco (probado varias veces, distintos marcos) hacen aparecer la flecha - descartadas esas 3 teorias de "que accion cuenta". Se probo tambien devolver el tutorial del avatar entero desactivado temporalmente en un deploy aparte de `dev` en Netlify (branch deploy), para ver si el mismo fallo tactil afecta a otras pantallas con el mismo sistema de highlight (Tienda, Skins) o es exclusivo de este paso - pendiente de respuesta. Nueva teoria sin probar (2026-09-19): quizas el problema no es que el paso nunca cambie de estado, sino que el boton de la flecha, al aparecer recien insertado en el DOM justo en el momento en que se necesita, no responde bien al primer toque en iOS (distinto a los fallos de scroll ya descartados). Propuesta: que la flecha este siempre presente en el DOM desde el principio del paso (aunque no interactiva/sin brillo), y que unicamente se active al llegar a `avatar_volver`, en vez de aparecer de la nada. Aparcada hasta confirmar si el fallo es exclusivo de este paso o afecta a Tienda/Skins tambien (mismo sistema de highlight en los 3 sitios).

## UI / Selector de perro

- Pendiente ajustar: en el selector de perro de Modo Libre, cada card muestra color de borde por rareza y fondo/icono por elemento (`dog-rarity-*`, `runner-dog-select-elembg-*`), pero en Modo Libre ninguno de los dos afecta al juego - son datos que solo tendrán sentido de verdad en Historia (combate, debilidades por elemento, etc.). De momento se deja tal cual porque quitarlo sin más deja las cards sin marco/cuadro visual. Falta decidir un tratamiento visual propio para Modo Libre antes de quitar la rareza/elemento de ahí.

## Gameplay / Balance

- Pendiente ajustar: `DOG_SIZE_TIER` en `RunnerScreen.jsx` (linea ~407) - cada perro tiene un porte (small/medium/large) que define su tamaño visual real (48/56/64px) y un margen extra de colision en Modo Libre (0/3/6px, mayor cuanto mas grande el perro). Sigue activo, se usa en la colision de verdad (linea ~2337), pero nunca se ha repasado si esos valores estan bien equilibrados entre perros.

## Pantalla de carga

- [x] (2026-09-22) `usePreloadImages`/`prefetchImages` fuerzan `image.decode()` ademas de la descarga, y los obstaculos de Mina/Ciudad se movieron a la precarga bloqueante (antes solo en la de Historia, de fondo) - arregla obstaculos que "saltaban" a mitad de pantalla en las primeras partidas de una sesion nueva (bug real, confirmado en movil de produccion).
- Pendiente: con mas imagenes ahora en el grupo bloqueante, la pantalla de carga inicial tarda un poco mas - vale la pena curar visualmente esa pantalla (spinner/animacion propia en vez de lo generico actual), ya que el usuario va a pasar mas tiempo mirandola.

## Skins

- [x] (2026-09-15) Tienda de Skins desbloqueada (card que antes estaba en "Próximamente"), catálogo generado solo leyendo `src/assets/ui/dog-skins` (`ladyRunSkinsCatalog.js`) - meter un archivo nuevo ahí ya aparece en la tienda, no hace falta tocar código. Preview grande al tocar una skin con marco por rareza, partículas y animación de compra (fundido + giro), inspirado en la tienda de Pata y Pico. Sin la fase de "el perro corriendo" del original (de momento).
- [x] Comprar una skin cuesta huesín de verdad (protegido, `spend_currency`), pero **ahora mismo a precio 0/gratis (temporal)** mientras se prueban las primeras skins con sprite real - ver `supabase/sql/010_skins_gratis_temporal.sql` y `SKIN_PRICES` en `LadyRunSkinsModal.jsx`. Pendiente: volver a poner precio real (15 normal / 40 ultimate era el plan) cuando se decida.
- [x] Equipar NO se hace desde la tienda: se hace tocando tu perro YA seleccionado en la rejilla de Modo Libre, que abre el inventario de skins de ese perro (`LadyRunSkinEquipModal.jsx`, solo muestra lo que ya tienes). La primera skin que compras para un perro se equipa sola automáticamente.
- [x] La mayoría de skins siguen siendo solo icono (sin efecto en partida). Las 3 primeras de Lady (gafas/pirata/reina) y las 3 de Nupito (mago/rey/sherif) ya traen sprite de correr+salto real y sí cambian el aspecto en pista al equiparlas (carpeta `dog-skins/<perro>/skins/<perro>-<skin>/`, campos `runImg`/`jumpImg` en el catálogo). Según lleguen más animadas, solo hace falta poner los archivos con ese mismo patrón de carpetas.
- [x] Animación de comprar completa (fundido -> el perro corriendo con pose propia de la skin o los 4 frames base del perro -> revelado con giro), usando `dog-skins-run-card/` (renombrado a un patrón consistente `<perro>-run-<skin>.webp`).
- Nota: `dog-skins/ui-skins/marco-skin-ultimate.webp` NO es un asset de skin (es un marco para otra cosa, ver idea de marcos de perfil más abajo) - no debe usarse en nada de Skins ni en la rejilla de perros.

## Idiomas / itch.io

- Idea: publicar en itch.io, donde el público en inglés juega más. Ahora mismo el traductor automático del navegador (Brave/Chrome) traduce bien la UI porque los botones no tienen ancho fijo (se adaptan al texto vía padding, no algo buscado a propósito), pero NO es una solución real: no todos los visitantes lo tienen activo (sobre todo en móvil), y traduciría mal cosas que son nombre propio/lore y no deberían tocarse (Chapas, Huesín, nombres de los perros).
- Si el público inglés importa de verdad para ese lanzamiento: i18n real más adelante (objeto de textos por idioma + toggle). No es prioridad ahora.

## Ideas locas

Divagaciones sin decidir, no hay compromiso de hacerlas, solo quedan apuntadas para no perderlas.

- Torneo 1v1: bracket de jugadores (aforo fijo tipo 4/8, no numero libre para que el bracket cuadre), cada uno juega su run normal de forma async (nada de sincronizar partidas en vivo), se compara distancia y el que gana avanza de ronda. Encajaria con la card "Torneo" ya reservada en la UI.
- Marcos de perfil vendibles: en vez de (o ademas de) skins de perro, vender marcos decorativos para el circulo de avatar del panel de usuario, que se verian tambien en el Ranking. Ya existe el asset `dog-skins/ui-skins/marco-skin-ultimate.webp` pensado para esto (no para skins).
- Ghost del rival: en vez de un CPU en vivo, mostrar 2 cards (la tuya + la del rival) donde el rival reproduce con retraso una run real ya grabada. Requeriria grabar la timeline de la partida (saltos, esquives) y no solo el resultado final como ahora, es un cambio de que se guarda, no un simple añadido. (2026-09-16) Ahora es mas facil de lo que parecia: Eventos ya tiene el motor de "2 distancias comparandose en la misma barra" (eventosPlayerDistanceRef/eventosCpuDistanceRef, ver RunnerScreen.jsx) - reusarlo cambiando el CPU en vivo por la reproduccion de una run grabada seria la parte que menos curro da, lo gordo sigue siendo decidir que se graba y como se guarda en Supabase.
- Reto diario: todos los jugadores corren el mismo tramo (seed fija por dia, no aleatoria), con un ranking aparte tipo "hoy" comparando distancia/tiempo. Reusaria el motor de carrera-a-meta de Eventos casi tal cual, solo cambia de donde sale la meta/dificultad (fija por dia en vez de por nodo).
- Amigos en el Ranking: como `profiles.username` ya es unico por jugador, anadir un "seguir a X" sencillo (tabla de relacion en Supabase) y resaltar a los amigos seguidos en la lista de Ranking que ya existe, en vez de tener que buscarlos entre todos.
- Perfil de corredor en el Ranking: al tocar una card de la lista (`LadyRunRankingModal.jsx`) se abre una pantalla con toda la info de ese jugador - mejores records, mejores numeros/estadisticas, perros mas usados, etc. Para esto serviria `bestDistanceByDog`/`gameState.ladyRunBestDistance` (record local por perro, ya trackeado en `RunnerScreen.jsx`), reservado para esta card - no se usa para comparar records de verdad en ningun sitio. El Ranking/game-over/HUD en vivo SIEMPRE comparan contra `getLadyRunBestDistance({ difficulty })` (`ladyRunOnlineRuns.js`), tu mejor distancia real en Supabase con todos los perros juntos por dificultad, nunca contra el dato local por perro (2026-09-21).
- Pantalla de Recompensas (ya hay una card bloqueada reservada en el menu principal): daria Huesin por cumplir ciertas condiciones/logros, sin definir cuales todavia.
- Huecos vacios en el bracket rellenados con IA: reusar la logica de rival CPU que ya existe en Historia (boss) para generar una "run" de bot cuando faltan jugadores reales, asi el torneo nunca se queda colgado esperando gente.
- Version mas simple tipo battle royale (aforo 5/10/15): todos juegan su partida de forma independiente, no compite en tiempo real contra nadie, solo se muestra visualmente quien va perdiendo/cuantos quedan via Supabase Realtime. Mas facil que sincronizar partidas, pero mas dificil de definir bien quien "gana" al final.
- Sabotaje de Eventos, poderes por skin/tienda: ahora mismo (2026-09-24) el sabotaje de Eventos usa un sprite de poder al azar entre los 5 que ya existian para Historia (fuego/electrico/agua/tierra/oscuro), fijo para toda la run (`eventosPowerElementRef` en `RunnerScreen.jsx`), igual para el jugador y la CPU - no depende de ningun perro ni skin. Mas adelante se podria conectar esto a una tienda de skins de poder (comprables, distintas entre jugadores) o dejar que cada perro tenga el suyo propio, sin decidir nada de eso todavia.

## Seguridad

- [x] (2026-09-15) Las 3 monedas (chapas, tavernCoins, huesín) ya NO viven en localStorage editable. Ahora viven en `profiles` en Supabase, sin permiso de UPDATE directo desde el cliente - solo se pueden tocar via `earn_currency`/`spend_currency` (funciones RPC con el precio fijo dentro, ver `supabase/sql/008_profiles_currency.sql`). Perros desbloqueados y corazones en inventario siguen en local por ahora, sin cambiar.
- Pendiente: el ranking (tabla `runs`) sí va directo a Supabase desde el principio (nunca vivió en local, no tiene el mismo problema), pero el INSERT de una partida acepta cualquier `distance` que mande el cliente sin comprobar si es creíble. Arreglo mínimo pensado: una función `submit_run(...)` con un tope de distancia máxima razonable (ej. 50.000m) que rechace valores absurdos tipo 999999. No evita hacer trampa con un número "creíble", solo corta los casos tontos. Aparcado por ahora, decidido dejarlo tal cual.

## Mantenimiento / código

- Pendiente (2026-09-17): reorganizar `src/screens/modalRunner/` en subcarpetas, igual que ya está `src/styles/` (`components/`, `modals/`, `standalone/`). Ahora mismo los 10 archivos están todos sueltos en la misma carpeta. Estructura propuesta:
  ```
  src/screens/modalRunner/
  ├── RunnerScreen.jsx              (se queda aquí, pantalla principal que da nombre a la carpeta)
  ├── runnerMusic.js
  ├── runnerPreloadAssets.js
  ├── modals/
  │   ├── LadyRunAvatarModal.jsx
  │   ├── LadyRunRankingModal.jsx
  │   ├── LadyRunShopModal.jsx
  │   ├── LadyRunSkinEquipModal.jsx
  │   └── LadyRunSkinsModal.jsx
  └── catalogs/
      ├── ladyRunAvatarFramesCatalog.js
      └── ladyRunSkinsCatalog.js
  ```
  Mover 7 archivos + actualizar todos los `import` que los referencian (dentro de ellos mismos y desde fuera, `RunnerScreen.jsx`/`LadyRunStandalone.jsx`). Puramente mecánico, sin cambiar comportamiento. Aparcado mientras se pule el tutorial.
- Pendiente (2026-09-17): la pantalla de Marcos (popover dentro de `LadyRunAvatarModal.jsx`) se queda pequeña, mejor convertirla en un modal propio a pantalla completa como el de Skins (flecha volver, título arriba, cards grandes tipo skin-card con secciones "Marco base"/"Marco Animado"). Aparcado porque afectaría al paso `avatar_marcos` del tutorial (el target/overlay apunta al popover actual), se retoma cuando el tutorial esté más asentado.

## PWA / Instalable

- Pendiente (2026-09-17): convertir Lady Run en webapp instalable (Add to Home Screen en Android/iOS), para que el jugador tenga un icono propio en vez de tener que buscar el link cada vez. Necesita `manifest.json` + icono cuadrado + meta tags en `index.html`. Decidido de momento SIN Service Worker (un SW mal llevado es la causa típica de que una PWA se quede pillada en una version vieja, justo el problema que ya cuesta evitar con `useNewVersionAvailable.js` - sin SW, en Android hay que darle a mano a "Añadir a pantalla de inicio" desde el menú en vez de salir un banner automático de instalar, pero se sigue pudiendo confiar en el sistema de deteccion de updates que ya existe).
- **Objetivo v0.2 (2026-09-22):** una vez hecho lo anterior (PWA instalable de verdad), empaquetarlo como **TWA (Trusted Web Activity)** para publicarlo en Google Play - envuelve la PWA ya existente en una cascara minima de Android, sin reescribir nada. Necesita ademas: verificacion de dominio (Digital Asset Links), cumplir las normas de calidad de Google Play para apps "envoltorio de web", y el empaquetado en si (Bubblewrap o PWABuilder). No es coger la web tal cual, depende de que el punto de arriba (PWA/manifest) este hecho primero.

## SEO / Analytics

- Hecho (2026-09-18): meta tags basicos, Open Graph, Twitter Card, JSON-LD, robots.txt, favicon, contenido crawleable de respaldo (`index.html`, oculto visualmente con la clase `seo-fallback` para que no se vea el flash al cargar, ver `feedback_css_selector_generico_root`).
- [x] Sitio dado de alta y verificado en Google Search Console (`ladyrun.jesusdev.es`), meta tag de verificacion puesto en `index.html`.
- [x] Google Analytics (GA4) integrado - `src/lib/loadGoogleAnalytics.js`, solo se carga si el jugador acepta el aviso de cookies (`CookieConsentBanner.jsx`).
- Pendiente: revisar en Netlify que no sirva la web duplicada en `www.ladyrun.jesusdev.es` ademas de `ladyrun.jesusdev.es` (contenido duplicado).
- Pendiente: no existe `sitemap.xml` (ni `robots.txt` referencia ninguno). Para una sola pagina real (`/privacidad` y `/terminos` no necesitan indexarse) el impacto es bajo, pero es lo unico que falta del checklist tecnico estandar de SEO.
- **Nivel actual (verificado 2026-09-22, no volver a preguntar sin comprobar primero si cambio):** SEO tecnico solido para una landing de una sola pagina - meta tags, OG, Twitter Card, JSON-LD, canonical, robots.txt, favicon, Search Console verificado, Analytics activo, contenido de respaldo crawleable. Solo faltan el sitemap y el tema del `www` duplicado, ambos de impacto bajo.
