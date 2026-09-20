import { useCallback, useEffect, useRef, useState } from 'react';

// Orden completo del tutorial de Lady Run: primero el avatar (icono del HUD, elegir perro, marco
// opcional, volver), luego la barra de monedas de arriba (CurrencyHud, un sub-paso por moneda),
// luego el boton de Tienda, los 3 corazones dentro de ella (ver LadyRunShopModal.jsx), y por ultimo
// Skins (entrar, ver, volver). Paso unico compartido por hook entre el acceso standalone y el
// embebido (ambos renderizan CurrencyHud + RunnerScreen como hermanos), para no duplicar la secuencia
// en los 2 sitios. Aislado del tutorial de Pata y Pico, ver feedback_lady_run_independiente_de_patapico.
const STEP_ORDER = [
    'avatar_hud', 'avatar_perro', 'avatar_marcos', 'avatar_volver',
    'hud_chapas', 'hud_taberna', 'hud_huesin', 'tienda',
    'corazon_extra', 'corazon_magico', 'corazon_verde', 'daily_reminder', 'salir_tienda',
    'skins_entrar', 'skins_volver',
];

// `active` indica si CurrencyHud ya esta realmente en pantalla (en el acceso standalone siempre lo
// esta; en el embebido dentro de Raids, solo cuando se abre "Carrera") - sin esto, el tutorial
// arrancaria y oscureceria la pantalla en cuanto se monta el hook, aunque la barra de monedas todavia
// no exista en el DOM.
export const useLadyRunTutorial = (completed, onComplete, active = true) => {
    const [tutStep, setTutStep] = useState(null);
    const startedRef = useRef(false);

    useEffect(() => {
        if (!active || completed || tutStep !== null || startedRef.current) return;
        startedRef.current = true;
        const t = setTimeout(() => setTutStep(STEP_ORDER[0]), 500);
        return () => clearTimeout(t);
    }, [active, completed, tutStep]);

    // No se llama a onComplete desde dentro del updater de setTutStep: React avisa ("Cannot update a
    // component while rendering a different component") si un setState de OTRO componente (el del
    // padre, aqui) se dispara desde el actualizador funcional de este. Se lee tutStep directo y se
    // decide fuera, antes de llamar a setTutStep.
    const advanceTutorial = useCallback(() => {
        const idx = STEP_ORDER.indexOf(tutStep);
        if (idx === -1 || idx === STEP_ORDER.length - 1) {
            onComplete?.();
            setTutStep(null);
        } else {
            setTutStep(STEP_ORDER[idx + 1]);
        }
    }, [tutStep, onComplete]);

    return { tutStep, setTutStep, advanceTutorial };
};
