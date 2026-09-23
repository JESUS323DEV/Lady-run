// Catalogo de marcos de avatar: igual que ladyRunSkinsCatalog.js, se lee la carpeta
// src/assets/ui/marcos-avatar directamente (import.meta.glob), asi que anadir un marco nuevo es
// solo poner el archivo en su carpeta (marcos-avatar/<marco>/<archivo>.webp), no hace falta tocar
// este archivo cada vez. marco-bronze/marco-celeste/marco-plata se desactivaron (fuera de
// FRAME_GROUPS) sin borrar los archivos, listos para eliminarse mas adelante.
const frameModules = import.meta.glob('../../assets/ui/marcos-avatar/*/*.webp', { eager: true, import: 'default' });

// Grupos activos, cada uno con su titulo de seccion en el picker y el prefijo de nombre (el archivo
// no trae copy definitivo todavia, ver FEATURES.md). itemId es el que se manda a spend_currency
// (precios ver 016_marcos_precios_v2.sql). Marco base: mismo precio para las 3 variantes de pago
// (Marco-4/5/6), Marco-1/2/3 gratis. Marco Animado: precio individual por variante (no hay un unico
// precio de grupo), ver MARCO_FONDO_PRICE_BY_VARIANT.
const FRAME_GROUPS = {
    'marco-base': { label: 'Marco base', namePrefix: 'Marco', itemId: 'marco_base', freeCount: 3, price: { chapas: 50 } },
    'marco-fondo': { label: 'Marco Animado', namePrefix: 'Fondo', freeCount: 0 },
};

// Precio + item_id propio por variante de Fondo, porque cada uno cuesta distinto y spend_currency
// cobra un precio fijo por item_id (no lee lo que calcule el cliente).
const MARCO_FONDO_PRICE_BY_VARIANT = {
    1: { tavernCoins: 20, itemId: 'marco_fondo_1' },
    2: { tavernCoins: 100, itemId: 'marco_fondo_2' },
    3: { tavernCoins: 40, itemId: 'marco_fondo_3' },
    4: { tavernCoins: 100, itemId: 'marco_fondo_4' },
};

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
    return frames
        .sort((a, b) => a.n - b.n)
        .map(frame => {
            const free = frame.n <= group.freeCount;
            const variantPrice = folder === 'marco-fondo' ? MARCO_FONDO_PRICE_BY_VARIANT[frame.n] : null;
            const price = variantPrice ? { tavernCoins: variantPrice.tavernCoins } : group.price;
            const itemId = variantPrice ? variantPrice.itemId : group.itemId;
            return {
                id: frame.fileName,
                name: `${group.namePrefix}-${frame.n}`,
                img: frame.img,
                folder,
                groupLabel: group.label,
                free,
                itemId,
                price: free ? null : price,
            };
        });
});

// Todas las imagenes del catalogo, para precarga (ver runnerPreloadAssets.js).
export const AVATAR_FRAMES_PRELOAD_IMAGES = AVATAR_FRAMES.map(frame => frame.img);
