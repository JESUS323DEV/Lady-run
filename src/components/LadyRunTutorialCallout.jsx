import { useEffect, useState } from 'react';
import { playLadyRunSfx } from '../game/utils/ladyRunSfx.js';
import '../styles/components/LadyRunTutorialCallout.css';

// Cajita de texto del tutorial de Lady Run, propia y aislada de la de Pata y Pico (ver
// feedback_lady_run_independiente_de_patapico). Se reposiciona sola segun donde este el elemento
// real senalado (targetSelector via data-tutorial), igual tecnica que el resto del juego
// (getBoundingClientRect, ver feedback_tutorial_positioning). Sin targetSelector (mensaje de cierre,
// sin nada concreto que señalar) se muestra centrada en pantalla en vez de buscar un elemento.
const LadyRunTutorialCallout = ({ targetSelector, title, text, subtext, actionLabel, onAction }) => {
    const [dialogStyle, setDialogStyle] = useState({});
    const [targetFound, setTargetFound] = useState(!targetSelector);

    useEffect(() => {
        if (!targetSelector) return undefined;
        setTargetFound(false);
        const el = document.querySelector(targetSelector);
        if (!el) return undefined;
        setTargetFound(true);

        const recalc = () => {
            const rect = el.getBoundingClientRect();
            const DIALOG_H = 150;
            const GAP = 10;
            const vh = window.innerHeight;
            if (rect.bottom + DIALOG_H + GAP <= vh) {
                setDialogStyle({ top: `${rect.bottom + GAP}px`, bottom: 'auto' });
            } else {
                setDialogStyle({ bottom: `${vh - rect.top + GAP}px`, top: 'auto' });
            }
        };

        recalc();
        const observer = new ResizeObserver(recalc);
        observer.observe(el);
        window.addEventListener('resize', recalc);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', recalc);
        };
    }, [targetSelector]);

    if (!targetFound) return null;

    return (
        <>
            <div className="lady-run-tut-overlay" onClick={e => e.stopPropagation()} />
            {title && (
                <div
                    className={`lady-run-tut-dialog${!targetSelector ? ' lady-run-tut-dialog-centered' : ''}`}
                    style={targetSelector ? dialogStyle : undefined}
                    onClick={e => e.stopPropagation()}
                >
                    <p className="lady-run-tut-dialog-title">{title}</p>
                    <p className="lady-run-tut-dialog-text">{text}</p>
                    {subtext && <p className="lady-run-tut-dialog-subtext">{subtext}</p>}
                    {actionLabel && (
                        <div className="lady-run-tut-dialog-actions">
                            <button className="lady-run-tut-dialog-btn" onClick={() => { playLadyRunSfx('buttonMode'); onAction?.(); }}>{actionLabel}</button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default LadyRunTutorialCallout;
