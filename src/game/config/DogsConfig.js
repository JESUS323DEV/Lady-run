// Config propia de Lady Run: copia recortada del DogsConfig de Pata y Pico, con solo los campos
// que el runner usa de verdad (name/rarity/element). El resto (mineria, biomas, forja...) no
// existe aqui a proposito: Lady Run es un juego independiente, ver project_plan_separar_lady_run.
export const DogsConfig = {
    chihuahua: { id: 'chihuahua', name: 'Chihuahua', rarity: 'epic', element: 'oscuro', order: 0 },
    tuka:      { id: 'tuka',      name: 'Tuka',      rarity: 'legendary', element: 'tierra', order: 3 },
    muna:      { id: 'muna',      name: 'Muna',      rarity: 'legendary', element: 'agua', order: 2 },
    lady:      { id: 'lady',      name: 'Lady',      rarity: 'legendary', element: 'fuego', order: 1 },
    tokio:     { id: 'tokio',     name: 'Tokyo',     rarity: 'legendary', element: 'electrico', order: 4 },
    bully:     { id: 'bully',     name: 'Bully',     rarity: 'epic', element: 'tierra' },
    smoke:     { id: 'smoke',     name: 'Smoke',     rarity: 'epic', element: 'fuego' },
    nupito:    { id: 'nupito',    name: 'Nupito',    rarity: 'legendary', element: 'oscuro' },
    boxer:     { id: 'boxer',     name: 'Boxer',     rarity: 'rare', element: 'agua' },
    druh:      { id: 'druh',      name: 'Druh',      rarity: 'rare', element: 'electrico' },
    gordo:     { id: 'gordo',     name: 'Gordo',     rarity: 'rare', element: 'tierra' },
    zeus:      { id: 'zeus',      name: 'Zeus',      rarity: 'rare', element: 'oscuro' },
};
