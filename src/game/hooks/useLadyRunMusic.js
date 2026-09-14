import { useEffect, useRef } from 'react';

// Musica de fondo de Lady Run: a diferencia de useBackgroundMusic (playlist aleatoria compartida con
// Pata y Pico), aqui la pista la decide quien llama al hook segun el escenario actual, en bucle
// continuo mientras no cambie. Mismo patron de desbloqueo por primera interaccion (autoplay bloqueado
// por el navegador hasta el primer click/touch).
export const useLadyRunMusic = (trackUrl, volume = 0.06) => {
    const audioRef = useRef(null);
    const volumeRef = useRef(volume);
    const trackUrlRef = useRef(trackUrl);
    const startedRef = useRef(false);

    const getAudio = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
        }
        return audioRef.current;
    };

    useEffect(() => {
        volumeRef.current = volume;
        getAudio().volume = volume;
    }, [volume]);

    useEffect(() => {
        trackUrlRef.current = trackUrl;
        if (!trackUrl) {
            audioRef.current?.pause();
            return;
        }
        const audio = getAudio();
        audio.src = trackUrl;
        audio.volume = volumeRef.current;
        audio.play().then(() => { startedRef.current = true; }).catch(() => {});
    }, [trackUrl]);

    // Cambio de volumen en vivo desde el panel de ajustes de Lady Run (componente separado, sin
    // prop compartida): escucha un evento global en vez de esperar a que este componente re-renderice.
    useEffect(() => {
        const handleVolumeEvent = (e) => {
            volumeRef.current = e.detail;
            getAudio().volume = e.detail;
        };
        window.addEventListener('ladyrun-music-volume', handleVolumeEvent);
        return () => window.removeEventListener('ladyrun-music-volume', handleVolumeEvent);
    }, []);

    useEffect(() => {
        const tryStart = () => {
            if (startedRef.current || !trackUrlRef.current) return;
            getAudio().play().then(() => { startedRef.current = true; }).catch(() => {});
        };
        document.addEventListener('click', tryStart);
        document.addEventListener('touchstart', tryStart);
        return () => {
            document.removeEventListener('click', tryStart);
            document.removeEventListener('touchstart', tryStart);
        };
    }, []);

    useEffect(() => () => {
        audioRef.current?.pause();
    }, []);
};
