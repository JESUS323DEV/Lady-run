import { useState, useEffect } from 'react';

/**
 * Version ligera de usePreloader (Preloader.jsx) para precargar solo una lista
 * concreta de imagenes, en vez de las ~500 del juego completo. Pensado para
 * puntos de entrada aislados (ej. LadyRunStandalone) que no deben arrastrar
 * el preloader global.
 */
export const usePreloadImages = (images) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (images.length === 0) {
            setLoaded(true);
            return;
        }
        let done = 0;
        images.forEach(src => {
            const img = new Image();
            img.onload = img.onerror = () => {
                done++;
                if (done === images.length) setLoaded(true);
            };
            img.src = src;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- la lista se construye una vez en el llamador, no debe re-disparar la precarga
    }, []);

    return loaded;
};

/**
 * Precarga una lista de imagenes en segundo plano, sin bloquear nada ni devolver estado: solo
 * dispara la descarga para que el navegador las tenga en cache si hacen falta mas tarde (ej.
 * contenido bloqueado que podria desbloquearse durante la sesion).
 */
export const prefetchImages = (images) => {
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};
