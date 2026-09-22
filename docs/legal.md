# Páginas legales

`LadyRunLegalPage.jsx`, reachable en `https://ladyrun.jesusdev.es/privacidad` y `/terminos`. Sin router: `App.jsx` decide qué mostrar según `window.location.pathname`, y `public/_redirects` (`/* /index.html 200`) hace que Netlify no dé 404 al entrar directo por esa URL en vez de navegar desde dentro del juego.

## Por qué existen

Exigidas por Google para poder publicar el proveedor de login en Google Cloud (`Google Auth Platform → Información de la marca`, campos "Vínculo a la Política de Privacidad"/"Vínculo a las Condiciones del Servicio").

## Enlaces visibles

Desde Ajustes (el engranaje), debajo de la sección Cuenta - se abren en la MISMA pestaña (no `target="_blank"`), así que "Volver a Lady Run" es un enlace normal a `/`, sin necesidad de `window.close()` ni nada especial.

## Scroll en móvil

`html`/`body` tienen `overflow: hidden` a nivel global (pensado para el juego, que gestiona su propio scroll interno) - la pantalla legal gestiona su propio scroll aparte (`height: 100vh; overflow-y: auto` en `.lady-run-legal-screen`), o el contenido largo no se podría leer entero en móvil.

## Contenido

Describe qué datos se guardan (ID, avatar, monedas, progreso, email/nombre si se vincula Google), que no se venden ni comparten datos con terceros para publicidad, los servicios externos usados (Supabase, Google, Netlify), cómo pedir el borrado de la cuenta, y contacto (`jtipian90@gmail.com`).
