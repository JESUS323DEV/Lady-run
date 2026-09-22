# Skins

Cosméticos por perro (no compartidos entre perros distintos), gestionados por `ladyRunSkinsCatalog.js` y `LadyRunSkinsModal.jsx`.

## Cómo se define el catálogo

Se construye leyendo la carpeta `src/assets/ui/dog-skins/` directamente (`import.meta.glob`), así que añadir una skin nueva (o un perro nuevo) es solo poner el archivo ahí - no hace falta tocar el catálogo a mano.

## Rareza

Por skin, no por perro (`SKIN_RARITY` en `ladyRunSkinsCatalog.js`): `rare`, `epic`, `legendary`. Cada perro tiene su propio set de skins con su propia rareza asignada. Existe también un tier `ultimate` aparte, con su propio marco especial, no entra en `SKIN_RARITY`.

## Precios

Ligados a la rareza vía `spend_currency` (`skin_rare`/`skin_epic`/`skin_legendary`/`skin_ultimate`, ver `docs/economia.md`). **Temporalmente a 0/gratis** en el catálogo del cliente mientras se prueban los primeros sprites reales (`010_skins_gratis_temporal.sql`) - pendiente reactivar precio real.

## Sprites en pista

La mayoría de skins hoy son solo icono. Cuando una skin trae sprite de correr/salto real (`dog-skins/<perro>/skins/<perro>-<skin>/`), se usa de verdad en pista al equiparla. Hay además una animación de "revelado" propia solo para el momento de comprar en la tienda (`dog-skins-run-card/`), sin relación con el sprite de pista.

## Equipar

Se guarda en dos sitios a la vez: `ladyRunEquippedSkinByDog` (en `progress`, todos los perros) y `avatar_skin_id` (columna propia en `profiles`, solo la del perro que es tu avatar actual - esa es la que se ve en el Ranking).
