// Catalogo de marcos de avatar: igual que ladyRunSkinsCatalog.js, se lee la carpeta
// src/assets/ui/marcos-avatar directamente (import.meta.glob), asi que anadir un marco nuevo es
// solo poner el archivo en su carpeta (marcos-avatar/<marco>/<archivo>.webp), no hace falta tocar
// este archivo cada vez. marco-bronze/marco-celeste/marco-plata se desactivaron (fuera de
// FRAME_GROUPS) sin borrar los archivos, listos para eliminarse mas adelante.
const frameModules = import.meta.glob('../../assets/ui/marcos-avatar/*/*.webp', { eager: true, import: 'default' });

// Grupos activos, cada uno con su titulo de seccion en el picker y el prefijo de nombre (el archivo
// no trae copy definitivo todavia, ver FEATURES.md). itemId es el que se manda a spend_currency
// (precios ver 016_marcos_precios_v2.sql). Marco base: mismo precio para las variantes de pago,
// Marco-1/2/3 gratis - sin cambios.
const FRAME_GROUPS = {
    'marco-base': { label: 'Marco base', namePrefix: 'Marco', itemId: 'marco_base', freeCount: 3, price: { chapas: 50 } },
    'marco-fondo': { label: 'Marco Animado', namePrefix: 'Fondo', freeCount: 0 },
};

// Marco Animado: solo Fondo-1 se puede comprar en tienda, a MARCO_FONDO_PRICE monedas. Fondo-2 en
// adelante (y cualquier marco nuevo que se meta sin tocar este archivo) se queda sin purchasable:
// no sale boton de compra, solo se consigue como recompensa de Eventos (que nodo/orden da cada uno
// todavia sin definir). spend_currency rechaza explicitamente cualquier marco_fondo_N por encima de
// MARCO_FONDO_PURCHASABLE_MAX, ver 024_marco_fondo_solo_1_a_3.sql.
const MARCO_FONDO_PURCHASABLE_MAX = 1;
const MARCO_FONDO_PRICE = 100;

// El nombre del archivo no tiene un orden fiable como string (marco-avatar-1-2 ordena antes que
// marco-avatar-1 porque '-' < '.'), asi que el numero de variante se saca del sufijo "-N" del
// nombre (sin sufijo = variante 1, ej. marco-avatar-fondo-animado1).
const variantNumber = (fileName) => {
    const m = fileName.match(/-(\d+)$/);
    return m ? parseInt(m[1], 10) : 1;
};

const byFolder = {};
for (const [path, img] of Object.entries(frameModules)) {
    const match = path.match(/marcos-avatar\/([^/]+)\/([^/]+)\.webp$/);
    if (!match) continue;
    const [, folder, fileName] = match;
    if (!FRAME_GROUPS[folder]) continue;
    byFolder[folder] ??= [];
    byFolder[folder].push({ fileName, img, n: variantNumber(fileName) });
}

export const AVATAR_FRAMES = Object.entries(byFolder).flatMap(([folder, frames]) => {
    const group = FRAME_GROUPS[folder];
    const isMarcoFondo = folder === 'marco-fondo';
    return frames
        .sort((a, b) => a.n - b.n)
        .map(frame => {
            const free = frame.n <= group.freeCount;
            const purchasable = isMarcoFondo ? frame.n <= MARCO_FONDO_PURCHASABLE_MAX : true;
            const price = isMarcoFondo ? { tavernCoins: MARCO_FONDO_PRICE } : group.price;
            const itemId = isMarcoFondo ? `marco_fondo_${frame.n}` : group.itemId;
            return {
                id: frame.fileName,
                name: `${group.namePrefix}-${frame.n}`,
                img: frame.img,
                folder,
                groupLabel: group.label,
                free,
                purchasable,
                itemId,
                price: free ? null : price,
            };
        });
});

// Todas las imagenes del catalogo, para precarga (ver runnerPreloadAssets.js).
export const AVATAR_FRAMES_PRELOAD_IMAGES = AVATAR_FRAMES.map(frame => frame.img);
