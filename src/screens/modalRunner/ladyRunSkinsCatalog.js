// Catalogo de skins de Lady Run: se construye leyendo la carpeta src/assets/ui/dog-skins directamente
// (import.meta.glob), asi que anadir una skin nueva -o un perro nuevo- es solo poner el archivo ahi,
// no hace falta tocar este archivo cada vez. La mayoria de skins todavia son solo icono (ver
// FEATURES.md), pero cuando una skin trae sprite de correr/salto de verdad (carpeta
// dog-skins/<perro>/skins/<perro>-<skin>/), se recoge aqui en runImg/jumpImg para poder usarlo en
// pista al equiparla (ver RunnerScreen.jsx).
const normalModules = import.meta.glob('../../assets/ui/dog-skins/*/*.webp', { eager: true, import: 'default' });
const ultimateFase1Modules = import.meta.glob('../../assets/ui/dog-skins/*/ultimate-skin/*-fase-1.webp', { eager: true, import: 'default' });
const ultimateFase2Modules = import.meta.glob('../../assets/ui/dog-skins/*/ultimate-skin/*-fase-2.webp', { eager: true, import: 'default' });
const runOverrideModules = import.meta.glob('../../assets/ui/dog-skins/*/skins/*/*.webp', { eager: true, import: 'default' });

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// La carpeta de assets usa el nombre "bonito" del perro, que no siempre coincide con su id interno
// (DogsConfig/DOG_ICONS) - Tokyo es 'tokio' en el resto del juego. Alias para que no se pierda.
const FOLDER_ID_ALIASES = { tokyo: 'tokio' };
const toDogId = (rawDogId) => FOLDER_ID_ALIASES[rawDogId] ?? rawDogId;

const catalog = {};

for (const [path, img] of Object.entries(normalModules)) {
    const match = path.match(/dog-skins\/([^/]+)\/([^/]+)\.webp$/);
    if (!match) continue;
    const [, rawDogId, fileName] = match;
    const dogId = toDogId(rawDogId);
    const skinId = fileName.replace(`${rawDogId}-`, '');
    catalog[dogId] ??= { normal: [], ultimate: null };
    catalog[dogId].normal.push({ id: skinId, name: capitalize(skinId), img });
}

for (const [path, img] of Object.entries(ultimateFase1Modules)) {
    const match = path.match(/dog-skins\/([^/]+)\/ultimate-skin\//);
    if (!match) continue;
    const dogId = toDogId(match[1]);
    catalog[dogId] ??= { normal: [], ultimate: null };
    catalog[dogId].ultimate = { id: 'ultimate', name: 'Ultimate', img, img2: null };
}

for (const [path, img2] of Object.entries(ultimateFase2Modules)) {
    const match = path.match(/dog-skins\/([^/]+)\/ultimate-skin\//);
    if (!match) continue;
    const dogId = toDogId(match[1]);
    if (catalog[dogId]?.ultimate) catalog[dogId].ultimate.img2 = img2;
}

for (const [path, img] of Object.entries(runOverrideModules)) {
    const match = path.match(/dog-skins\/([^/]+)\/skins\/([^/]+)\/([^/]+)\.webp$/);
    if (!match) continue;
    const [, rawDogId, , fileName] = match;
    const dogId = toDogId(rawDogId);
    const isJump = fileName.endsWith('-salto');
    const skinId = fileName.replace(`${rawDogId}-run-`, '').replace(/-salto$/, '');
    const skin = catalog[dogId]?.normal.find(s => s.id === skinId);
    if (!skin) continue;
    if (isJump) skin.jumpImg = img;
    else skin.runImg = img;
}

export const SKIN_CATALOG = catalog;
