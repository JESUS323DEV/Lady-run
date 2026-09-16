// Catalogo de marcos de avatar: igual que ladyRunSkinsCatalog.js, se lee la carpeta
// src/assets/ui/marcos-avatar directamente (import.meta.glob), asi que anadir un marco nuevo es
// solo poner el archivo en su carpeta (marcos-avatar/<marco>/<archivo>.webp), no hace falta tocar
// este archivo cada vez. marco-bronze/marco-celeste/marco-plata se desactivaron (fuera de
// FRAME_GROUPS) sin borrar los archivos, listos para eliminarse mas adelante.
const frameModules = import.meta.glob('../../assets/ui/marcos-avatar/*/*.webp', { eager: true, import: 'default' });

// Grupos activos, cada uno con su titulo de seccion en el picker y el prefijo de nombre (el archivo
// no trae copy definitivo todavia, ver FEATURES.md). itemId es el que se manda a spend_currency
// para las variantes de pago (precio MOMENTANEO, primera tanda, ver 014_marcos_avatar_precios.sql).
const FRAME_GROUPS = {
    'marco-base': { label: 'Marco base', namePrefix: 'Marco', itemId: 'marco_base', freeCount: 3, price: { tavernCoins: 30, huesin: 0 } },
    'marco-fondo': { label: 'Marco Animado', namePrefix: 'Fondo', itemId: 'marco_fondo', freeCount: 0, price: { tavernCoins: 0, huesin: 10 } },
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
            // Oferta permanente (no momentanea como el resto de precios): Fondo-1 a mitad de precio.
            const offer = folder === 'marco-fondo' && frame.n === 1;
            const price = offer
                ? { tavernCoins: Math.round(group.price.tavernCoins / 2), huesin: Math.round(group.price.huesin / 2) }
                : group.price;
            return {
                id: frame.fileName,
                name: `${group.namePrefix}-${frame.n}`,
                img: frame.img,
                folder,
                groupLabel: group.label,
                free,
                offer,
                // Precio de la oferta va a un item_id propio en spend_currency (no el generico del
                // grupo), porque el servidor cobra por item_id fijo, no por el precio que se calcule
                // aqui en el cliente - ver 015_marco_fondo_oferta.sql.
                itemId: offer ? `${group.itemId}_oferta` : group.itemId,
                price: free ? null : price,
            };
        });
});
