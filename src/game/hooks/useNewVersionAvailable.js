import { useEffect, useState } from 'react';

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // cada 5 min
const MODULE_SRC_REGEX = /<script[^>]*type="module"[^>]*src="([^"]+)"/i;

// Detecta si Netlify ha desplegado una build nueva mientras el jugador sigue con la pestaña abierta
// (Vite no usa service worker aqui, asi que sin esto el navegador nunca se entera solo). Compara el
// script de entrada (con su hash de contenido) que cargo esta pagina contra el que referencia el
// index.html real ahora mismo. No recarga nada solo: solo avisa (ver UpdateBanner.jsx), la decision de
// cuando recargar es del jugador, para no cortarle una partida en curso.
export const useNewVersionAvailable = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);

    useEffect(() => {
        if (!import.meta.env.PROD) return undefined;

        const initialSrc = document.querySelector('script[type="module"]')?.getAttribute('src') ?? null;
        if (!initialSrc) return undefined;

        let cancelled = false;
        const checkForUpdate = async () => {
            try {
                const res = await fetch(`/index.html?_=${Date.now()}`, { cache: 'no-store' });
                const html = await res.text();
                const latestSrc = html.match(MODULE_SRC_REGEX)?.[1];
                if (!cancelled && latestSrc && latestSrc !== initialSrc) {
                    setUpdateAvailable(true);
                    clearInterval(interval);
                }
            } catch {
                // Sin conexion o fallo de red: no pasa nada, se reintenta en el siguiente ciclo.
            }
        };

        const interval = setInterval(checkForUpdate, CHECK_INTERVAL_MS);
        const onVisible = () => { if (document.visibilityState === 'visible') checkForUpdate(); };
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            cancelled = true;
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, []);

    return updateAvailable;
};
