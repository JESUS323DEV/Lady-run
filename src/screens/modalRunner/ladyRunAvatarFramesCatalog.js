// Catalogo de marcos de avatar: igual que ladyRunSkinsCatalog.js, se lee la carpeta
// src/assets/ui/marcos-avatar directamente (import.meta.glob), asi que anadir un marco nuevo es
// solo poner el archivo en su carpeta (marcos-avatar/<marco>/<archivo>.webp), no hace falta tocar
// este archivo cada vez.
const frameModules = import.meta.glob('../../assets/ui/marcos-avatar/*/*.webp', { eager: true, import: 'default' });

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Solo se deja disponible el "-1" de cada marco (variante unica por ahora, ver FEATURES.md); si un
// marco trae mas variantes (ej. celeste-2) se quedan en la carpeta pero no salen en la lista.
export const AVATAR_FRAMES = Object.entries(frameModules)
    .map(([path, img]) => {
        const match = path.match(/marcos-avatar\/[^/]+\/([^/]+)\.webp$/);
        if (!match) return null;
        return { id: match[1], name: capitalize(match[1]), img };
    })
    .filter(Boolean)
    .filter(frame => frame.id.endsWith('-1'));
