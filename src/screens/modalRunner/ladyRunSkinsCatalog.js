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
// Pose "corriendo" para la animacion de comprar en la tienda (fundido -> corriendo -> revelado, ver
// LadyRunSkinsModal.jsx). Nada que ver con runOverrideModules de arriba: esto NUNCA se usa en pista,
// solo en el momento de comprar. 4 frames base por perro (dog-N.webp) + una pose propia por skin
// cuando existe (dog-run-skin.webp), si no hay pose propia se usan los 4 frames base como relleno.
const purchaseAnimModules = import.meta.glob('../../assets/ui/dog-skins-run-card/*-run-skin/*.webp', { eager: true, import: 'default' });

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Rareza por skin (no por perro), copiada de DogSkinsConfig.js de Pata y Pico - mismo concepto de
// skin, misma rareza en los dos juegos. Smoke se deja fuera a proposito (sin datos, pendiente de
// rehacer alli tambien). Los "ultimate" no entran aqui, tienen su propio marco especial aparte.
const SKIN_RARITY = {
    druh:   { cascos: 'epic', mago: 'epic', minero: 'rare', rey: 'rare', señor: 'legendary' },
    gordo:  { mago: 'epic', cascos: 'epic', chef: 'legendary', gafas: 'legendary', rey: 'rare', señor: 'legendary' },
    lady:   { capucha: 'legendary', cascos: 'epic', gafas: 'legendary', minera: 'rare', pirata: 'legendary', reina: 'rare' },
    muna:   { cascos: 'epic', minera: 'rare', piloto: 'legendary', pirata: 'legendary', reina: 'rare' },
    nupito: { mago: 'epic', minero: 'rare', rey: 'rare', sherif: 'legendary' },
    tokio:  { capucha: 'legendary', cascos: 'epic', gafas: 'legendary', minera: 'rare', reina: 'rare' },
    tuka:   { capucha: 'legendary', cascos: 'epic', chef: 'legendary', gafas: 'legendary', maga: 'epic', reina: 'rare', minera: 'rare' },
    zeus:   { chef: 'legendary', mago: 'epic', minero: 'rare', rey: 'rare', sherif: 'legendary' },
};

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
    catalog[dogId].normal.push({ id: skinId, name: capitalize(skinId), img, rarity: SKIN_RARITY[dogId]?.[skinId] });
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

export const PURCHASE_BASE_FRAMES = {};
const purchaseSkinOverrides = {}; // { [dogId]: { [skinId]: img } }

for (const [path, img] of Object.entries(purchaseAnimModules)) {
    const match = path.match(/dog-skins-run-card\/([^/]+)-run-skin\/([^/]+)\.webp$/);
    if (!match) continue;
    const [, rawDogId, fileName] = match;
    const dogId = toDogId(rawDogId);
    const frameMatch = fileName.match(/^[^-]+-(\d)$/);
    if (frameMatch) {
        PURCHASE_BASE_FRAMES[dogId] ??= [];
        PURCHASE_BASE_FRAMES[dogId][Number(frameMatch[1]) - 1] = img;
        continue;
    }
    const skinId = fileName.replace(`${rawDogId}-run-`, '');
    purchaseSkinOverrides[dogId] ??= {};
    purchaseSkinOverrides[dogId][skinId] = img;
}

for (const dogId of Object.keys(catalog)) {
    const overrides = purchaseSkinOverrides[dogId] ?? {};
    if (catalog[dogId].ultimate && overrides[catalog[dogId].ultimate.id]) {
        catalog[dogId].ultimate.purchaseRunImg = overrides[catalog[dogId].ultimate.id];
    }
    for (const skin of catalog[dogId].normal) {
        if (overrides[skin.id]) skin.purchaseRunImg = overrides[skin.id];
    }
}

export const SKIN_CATALOG = catalog;
