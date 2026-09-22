# SEO y Analytics

## SEO técnico (en `index.html`)

- Meta tags básicos, `<title>`, `<meta name="description">`, `<link rel="canonical">`.
- Open Graph completo (título, descripción, imagen 1200x630 con alt, url).
- Twitter Card (`summary_large_image`).
- JSON-LD (`schema.org` tipo `VideoGame`).
- `robots.txt` (`public/robots.txt`): `Allow: /` para todos los user-agents.
- Favicon.
- Contenido de respaldo crawleable: un `<h1>`/`<p>` dentro de `#root`, con clase `seo-fallback` (oculto visualmente pero presente en el DOM, técnica estándar de accesibilidad) - para que buscadores que no ejecuten JS igual vean texto real, sin que un humano vea el "flash" antes de que React monte el juego de verdad.

**Importante para cualquier cambio futuro en ese bloque**: nunca usar un selector CSS por tag genérico (`#root p`, `#root h1`) para tocar solo ese contenido - toda la app de React vive dentro de `#root`, así que un selector así afecta a TODOS los `<p>`/`<h1>` de todas las pantallas del juego. Usar siempre una clase propia (`.seo-fallback`).

## Pendiente

- `sitemap.xml` (no existe, y `robots.txt` no referencia ninguno) - impacto bajo con solo 3 páginas reales.
- Revisar que `www.ladyrun.jesusdev.es` no sirva contenido duplicado además de `ladyrun.jesusdev.es`.

## Search Console

Sitio dado de alta y verificado (`ladyrun.jesusdev.es`), meta tag de verificación puesto en `index.html`.

## Analytics

Google Analytics (GA4) vía `src/lib/loadGoogleAnalytics.js` - el script solo se carga si el jugador acepta el aviso de cookies (`CookieConsentBanner.jsx`, guardado en `localStorage` para no volver a preguntar). Si rechaza, no se carga nada de analítica.
