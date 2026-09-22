# Economía y monedas

## Las 3 monedas

Viven como columnas propias en `profiles` (no dentro de `progress`), protegidas con `check (>= 0)`:

- **Chapas** (`chapas`): se consiguen jugando Modo Libre.
- **Moneda taberna** (`tavern_coins`): se consiguen jugando.
- **Huesín** (`huesin`): se consigue jugando, se gasta en skins y marcos animados.

## Protección server-side

Ninguna moneda es escribible directamente desde el cliente (no hay `grant update` sobre esas columnas). Solo se pueden tocar vía dos funciones SQL `security definer` en Supabase (`supabase/sql/008_profiles_currency.sql`, precios actualizados en `019_corazones_precios_bajos.sql`):

- **`earn_currency(chapas, tavern_coins, huesin)`**: suma, nunca acepta negativos. La llama el cliente al recoger monedas jugando (`onEarnChapas`/`onEarnTavernCoins`/`onEarnHuesin` en `LadyRunStandalone.jsx`).
- **`spend_currency(item_id, progress_patch?)`**: resta según un precio FIJO en el servidor (el cliente nunca manda el precio), falla con `insufficient_funds` si no llega el saldo. Desde `022_progress_sync.sql` acepta también un `progress_patch` (jsonb) que se fusiona con `profiles.progress` en la MISMA transacción que el cobro - así comprar un perro/marco/skin no se puede separar en "pagar sin recibir nada".

## Precios actuales (`spend_currency`, ver el SQL para la versión más reciente)

| `item_id` | Precio |
|---|---|
| `corazon_extra` | 10 chapas |
| `corazon_magico` | 15 monedas taberna |
| `corazon_verde` | 15 chapas |
| `unlock_dog` | 5 monedas taberna + 10 huesín |
| `skin_rare` | 5 huesín |
| `skin_epic` | 10 huesín |
| `skin_legendary` | 20 huesín |
| `skin_ultimate` | gratis (0) |
| `marco_base` | 50 chapas (mismo precio para las 3 variantes de pago) |
| `marco_fondo_1` | 20 monedas taberna |
| `marco_fondo_2` | 100 monedas taberna |
| `marco_fondo_3` | 40 monedas taberna |
| `marco_fondo_4` | 100 monedas taberna |

Nota: los precios de skins están temporalmente a **0** en el catálogo del cliente (`ladyRunSkinsCatalog.js`) mientras se prueban los primeros sprites reales, aunque la función del servidor ya tiene los precios reales listos para cuando se reactiven - ver `FEATURES.md`.

## Hueco de seguridad conocido

`spend_currency` valida el PRECIO en el servidor, pero no valida que el `progress_patch` que manda el cliente corresponda exactamente al item pagado (por ejemplo, alguien con la consola del navegador podría pagar `skin_rare` pero mandar un patch que desbloquea una skin `legendary`). Solo afecta a la propia cuenta del jugador, nunca a otros ni al dinero real. Ver `FEATURES.md` / sección Seguridad.
