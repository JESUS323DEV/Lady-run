# Lady Run

Endless runner web para móvil, protagonizado por perros. Elige tu perro, corre esquivando obstáculos, consigue recompensas y compite en un ranking global online.

Jugable en: **https://ladyrun.jesusdev.es**

Proyecto de una sola persona, independiente de cualquier otro juego (nació como gancho de marketing de Pata y Pico/LadyHungry, separado a repo y subdominio propios desde entonces).

## Versión actual: v0.1

Primera versión publicable: cuentas online reales (invitado + login con Google), progreso sincronizado entre dispositivos, economía y compras protegidas server-side, y publicado en itch.io además de su web propia.

## Qué se puede hacer hoy

- **Modo Libre**: corre en distintos escenarios/biomas, con 3 dificultades, saltando obstáculos, recogiendo huesos y corazones (extra, mágico, verde).
- **Ranking global**: mejor distancia recorrida, por jugador, visible para cualquiera.
- **Perfil**: elige perro, marco de avatar (con variantes "Base" y "Animados"), y consulta tu progreso.
- **Skins**: cosméticos por perro, comprables con huesín, de distinta rareza.
- **Tienda**: corazón extra, corazón mágico, corazón verde (escudo), comprables con chapas/monedas.
- **Tutorial guiado**: paso a paso la primera vez, cubre avatar, HUD, tienda y la propia carrera.
- **Cuenta online**: cuenta anónima automática al entrar (sin contraseña), con un ID elegido por el jugador para el ranking. Se puede vincular a Google (o iniciar sesión con una cuenta ya vinculada desde otro dispositivo) para compartir todo el progreso entre navegadores/móviles.
- **Bloqueado / "Próximamente"**: Historia, Eventos, Torneo, Recompensas, Misiones - preparados en la UI pero sin contenido todavía.

## Stack técnico

- **React 19** + **Vite 7** (`@vitejs/plugin-react-swc`)
- **Supabase**: base de datos, autenticación (anónima + Google OAuth), y funciones server-side (`spend_currency`, `earn_currency`) para proteger la economía
- **Netlify**: hosting, con `public/_redirects` para el fallback de SPA
- **lucide-react**: iconos
- Sin router (una sola pantalla real + 2 páginas legales resueltas por `pathname` a mano en `App.jsx`)
- Sin backend propio: toda la lógica de servidor vive en funciones SQL de Supabase (`supabase/sql/`)

## Cuentas y datos

Cada jugador tiene una fila en `profiles` (Supabase), identificada por una cuenta anónima de Supabase Auth:

- `username`: el ID elegido para el ranking (público)
- `avatar_dog_id` / `avatar_frame_id` / `avatar_skin_id`: equipado actual (público, se ve en el Ranking)
- `chapas` / `tavern_coins` / `huesin`: las 3 monedas, solo modificables vía funciones RPC (`earn_currency`/`spend_currency`), nunca escribibles directo desde el cliente
- `progress` (jsonb): todo lo demás - tutorial completado, perros/marcos/skins desbloqueados, corazones en inventario, contadores diarios, récords locales por perro. Compras protegidas escriben aquí en la misma operación que el cobro (ver `022_progress_sync.sql`)

Vincular una cuenta de Google (`supabase.auth.linkIdentity`) añade esa identidad a la MISMA cuenta anónima, sin perder nada. Iniciar sesión con una cuenta de Google ya vinculada desde otro dispositivo (`signInWithOAuth`) sustituye la sesión de invitado local por la cuenta real.

## Estructura del proyecto

```
src/
  assets/       audio, fondos, iconos/UI
  components/   piezas compartidas (HUD de monedas, ajustes, tutorial...)
  game/
    config/     catálogos y constantes de balance
    hooks/      useLadyRunProfile, useLadyRunTutorial, etc.
    utils/      helpers (fechas, sonido, runs online...)
  lib/          clientes externos (supabase.js, analytics)
  screens/
    modalRunner/  pantallas del juego en sí (correr, tienda, skins, ranking...)
    standalone/   pantallas de entrada (landing, elegir ID, páginas legales)
  styles/       CSS por carpeta, en espejo de screens/components
supabase/sql/   migraciones SQL numeradas, aplicadas a mano en el SQL Editor de Supabase
public/         estáticos servidos tal cual (favicon, robots.txt, _redirects)
```

## Desarrollo local

```bash
npm install
npm run dev      # servidor local
npm run build    # build de producción
npm run lint     # eslint
```

Hace falta un `.env` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` (proyecto de Supabase propio).

## Ramas y despliegue

- `dev`: rama de trabajo, todo se prueba aquí primero.
- `main`: producción, desplegado automáticamente en Netlify. Se mezcla `dev` a `main` cuando una tanda de cambios está lista para publicarse.

## Pendiente

Ver `FEATURES.md` para el detalle completo de lo que falta, en marcha, o aparcado.
