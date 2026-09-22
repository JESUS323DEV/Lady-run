# Tutorial

Hay 3 tutoriales independientes, cada uno con su propio flag en `profiles.progress` y su propio hook/estado. No se solapan ni comparten pasos.

## 1. Tutorial principal (`ladyRunTutorial`)

El primero que ve un jugador nuevo, gestionado por `useLadyRunTutorial.js`. Arranca solo 500ms después de montar, si `!completed` y el HUD de monedas ya está en pantalla (`active`).

Orden de pasos (`STEP_ORDER`):

```
avatar_hud → avatar_perro → avatar_marcos → avatar_volver →
hud_chapas → hud_taberna → hud_huesin → tienda →
corazon_extra → corazon_magico → corazon_verde → daily_reminder → salir_tienda
```

Cubre: abrir el Perfil, elegir perro, elegir marco, volver; la barra de monedas; entrar a la Tienda y sus 3 corazones; el aviso de recompensa diaria; salir de la tienda.

**Skins queda bloqueado hasta completar TODO este tutorial** (hasta `salir_tienda`), sin tener su propio paso dedicado - antes lo tenía (`skins_entrar`/`skins_volver`), se simplificó.

## 2. Tutorial de Modo Libre (`ladyRunLibreTutorial`)

Gestionado dentro de `RunnerScreen.jsx` (`libreTutStep`), se dispara en la pantalla de selección de dificultad/escenario de Modo Libre, la primera vez que se llega ahí.

## 3. Tutorial dentro de la carrera (`ladyRunRunTutorial`)

También en `RunnerScreen.jsx` (`runTutStep`), pasos: `huesos → pata → salto → corazon_magico`. Se dispara la primera vez que se entra a jugar una carrera de verdad en Modo Libre. Mientras no esté completo, el botón de Ranking queda bloqueado (`!ladyRunRunTutorialCompleted`).

## Cómo se muestran los pasos

`LadyRunTutorialCallout.jsx`: una cajita de texto que se reposiciona sola según dónde esté el elemento señalado (`targetSelector`, vía `getBoundingClientRect`). Por defecto calcula sola si cabe mejor arriba o abajo del objetivo; el prop `forcePosition="above"|"below"` fuerza una posición cuando el cálculo automático no basta (usado en el paso `pata`, cuyo contenido es más alto de lo que el cálculo por defecto preveía, y se cortaba en móviles con menos alto de pantalla).

## Resetear un tutorial (para probar)

```js
const g = JSON.parse(localStorage.getItem('ladyRunGame'));
g.ladyRunTutorial = { completed: false };
g.ladyRunLibreTutorial = { completed: false };
g.ladyRunRunTutorial = { completed: false };
localStorage.setItem('ladyRunGame', JSON.stringify(g));
location.reload();
```

Ojo: esto solo funciona si el progreso sigue viviendo en `localStorage` de verdad (por ejemplo, antes de vincular Google). Si el progreso ya vive en Supabase, hay que tocar `profiles.progress` desde el SQL Editor en su lugar.
