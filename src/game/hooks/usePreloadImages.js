import { useState, useEffect } from 'react';

// decode() de verdad rasteriza la imagen (no solo descarga los bytes) antes de dar por terminada
// la carga - sin esto, la primera vez que una imagen se pinta de verdad en pantalla (ej. un
// obstaculo nunca visto en esa sesion) puede dar un tironcito de decodificacion en pleno juego. No
// todos los navegadores tienen decode(), y puede fallar (imagen ya descartada, etc.) - en ambos
// casos se sigue igual, no bloquea la carga por eso.
const loadOne = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
        if (img.decode) img.decode().then(resolve).catch(resolve);
        else resolve();
    };
    img.onerror = resolve;
    img.src = src;
});

// Descarga + decodifica una lista de imagenes, resuelve cuando TODAS estan listas para pintar sin
// tironcito. Compartido entre usePreloadImages (lista fija, conocida al montar) y cualquier caso
// dinamico que necesite esperar a un set de imagenes que se sabe mas tarde (ej. la skin equipada de
// cada jugador, que depende de su perfil).
export const preloadImages = (images) => Promise.all(images.map(loadOne)).then(() => {});

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
        preloadImages(images).then(() => setLoaded(true));
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
    images.forEach(loadOne);
};
