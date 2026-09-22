# Tienda

`LadyRunShopModal.jsx`, vende los 3 corazones (ver `docs/modo-libre.md` para qué hace cada uno):

- **Corazón extra**: 10 chapas.
- **Corazón mágico**: 15 monedas taberna (máx. 2 en inventario).
- **Corazón verde** (escudo): 15 chapas (máx. 5 en inventario).

También hay un corazón gratis reclamable una vez al día (`ladyRunDailyFreeClaimedAt` en `progress`, ver `docs/progreso.md`).

Todas las compras pasan por `spend_currency` (ver `docs/economia.md`) - precio fijo en el servidor, nunca decidido por el cliente.

Es uno de los pasos del tutorial principal (`tienda`, `corazon_extra`, `corazon_magico`, `corazon_verde`, `salir_tienda` - ver `docs/tutorial.md`).
