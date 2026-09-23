import { useEffect, useState } from 'react';
import logoLadyRun1 from '../../assets/ui/icons-hud/hud-modals/game-run/logo/logo-lady-run1.webp';
import logoLadyRun2Loop from '../../assets/ui/icons-hud/hud-modals/game-run/logo/logo-lady-run-2-loop-final2.webp';
import { useNewVersionAvailable } from '../../game/hooks/useNewVersionAvailable.js';
import { playLadyRunSfx } from '../../game/utils/ladyRunSfx.js';
import '../../styles/standalone/LadyRunLanding.css';

const LOGO_SWAP_DELAY_MS = 4000;

// Pantalla previa de Lady Run (solo standalone), propia y aislada de la de Pata y Pico. El logo
// cambia solo (de la version 1 a la version animada en bucle) a los 11s, pero la pantalla en si
// nunca avanza sola: solo el boton "Jugar" lleva al juego de verdad. Si hay una build nueva
// desplegada mientras se ve esta pantalla, el mismo boton pasa a "Actualizar" (recarga) en vez de
// "Jugar", y vuelve a ser "Jugar" normal en cuanto se recarga con la version nueva.
const LadyRunLanding = ({ onPlay, onPlayTutorial }) => {
    const [showLoop, setShowLoop] = useState(false);
    const updateAvailable = useNewVersionAvailable();

    useEffect(() => {
        const t = setTimeout(() => setShowLoop(true), LOGO_SWAP_DELAY_MS);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="lady-run-landing">
            <img src={showLoop ? logoLadyRun2Loop : logoLadyRun1} alt="Lady Run" className="lady-run-landing-logo" />
            <button
                className="lady-run-landing-play-btn"
                onClick={updateAvailable ? () => window.location.reload() : () => { playLadyRunSfx('buttonMode'); onPlay(); }}
            >
                {updateAvailable ? 'Actualizar' : 'Jugar'}
            </button>
            {/* Elegir entrar directo o con el tutorial guiado: solo se ofrece hasta que el tutorial
                se completa una vez de verdad (ver LadyRunStandalone.jsx), no es un flag de "ya elegiste". */}
            {onPlayTutorial && !updateAvailable && (
                <button
                    className="lady-run-landing-play-btn lady-run-landing-play-btn-secondary"
                    onClick={() => { playLadyRunSfx('buttonMode'); onPlayTutorial(); }}
                >
                    Jugar tutorial
                </button>
            )}
        </div>
    );
};

export default LadyRunLanding;
