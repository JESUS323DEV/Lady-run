// Catalogo de marcos de avatar: igual que ladyRunSkinsCatalog.js, se lee la carpeta
// src/assets/ui/marcos-avatar directamente (import.meta.glob), asi que anadir un marco nuevo es
// solo poner el archivo en su carpeta (marcos-avatar/<marco>/<archivo>.webp), no hace falta tocar
// este archivo cada vez.
const frameModules = import.meta.glob('../../assets/ui/marcos-avatar/*/*.webp', { eager: true, import: 'default' });

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Carpetas en uso ahora mismo: marco-base (6 variantes, todas seleccionables para probarlas) y
// marco-fondo (todavia sin assets). marco-bronze/marco-celeste/marco-plata se desactivan (fuera de
// esta lista) sin borrar los archivos, listos para eliminarse mas adelante.
const ACTIVE_FRAME_FOLDERS = ['marco-base', 'marco-fondo'];

export const AVATAR_FRAMES = Object.entries(frameModules)
    .map(([path, img]) => {
        const match = path.match(/marcos-avatar\/([^/]+)\/([^/]+)\.webp$/);
        if (!match) return null;
        const [, folder, fileName] = match;
        return { id: fileName, name: capitalize(fileName), img, folder };
    })
    .filter(Boolean)
    .filter(frame => ACTIVE_FRAME_FOLDERS.includes(frame.folder));
