import { useState, useEffect } from 'react';
import RunnerScreen from '../modalRunner/RunnerScreen.jsx';
import LadyRunLanding from './LadyRunLanding.jsx';
import { getDailyRotationKey } from '../../game/utils/dateRotation.js';
import CurrencyHud from '../../components/CurrencyHud.jsx';
import { useLadyRunTutorial } from '../../game/hooks/useLadyRunTutorial.js';
import { usePreloadImages, prefetchImages } from '../../game/hooks/usePreloadImages.js';
import { RUNNER_CORE_PRELOAD_IMAGES, RUNNER_HISTORIA_PRELOAD_IMAGES } from '../modalRunner/runnerPreloadAssets.js';
import '../../styles/standalone/LadyRunStandalone.css';

const SAVE_KEY = 'ladyRunGame';

// Guardado propio de Lady Run: economia (chapas/tavernCoins/huesin) y progreso 100% independientes
// de Pata y Pico desde la separacion de repos, ver project_plan_separar_lady_run.
const loadSavedState = () => {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* save corrupto o inexistente: se empieza de cero */ }
    return {
        chapas: 0,
        tavernCoins: 0,
        huesin: 0,
    };
};

/**
 * Punto de entrada unico de Lady Run (proyecto independiente de Pata y Pico, solo comparten
 * estetica/assets). Ya no hay acceso "?lady-run" ni juego a cargar: esto ES la aplicacion.
 */
const LadyRunStandalone = () => {
    const [gameState, setGameState] = useState(loadSavedState);
    const [showLanding, setShowLanding] = useState(true);
    const loaded = usePreloadImages(RUNNER_CORE_PRELOAD_IMAGES);
    const { tutStep: ladyRunTutStep, setTutStep: setLadyRunTutStep, advanceTutorial: advanceLadyRunTutorial } = useLadyRunTutorial(
        gameState.ladyRunTutorial?.completed ?? false,
        () => setGameState(prev => ({ ...prev, ladyRunTutorial: { completed: true } })),
        loaded && !showLanding,
    );

    useEffect(() => {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ ...gameState, savedAt: Date.now() }));
    }, [gameState]);

    // Historia esta bloqueada ahora mismo: no hace falta su contenido para jugar, asi que se
    // precarga de fondo (sin bloquear la pantalla) por si se desbloquea despues.
    useEffect(() => {
        if (!loaded) return;
        prefetchImages(RUNNER_HISTORIA_PRELOAD_IMAGES);
    }, [loaded]);

    if (!loaded) {
        return (
            <div className="lady-run-loading-screen">
                <div className="lady-run-loading-spinner" />
            </div>
        );
    }

    if (showLanding) {
        return <LadyRunLanding onPlay={() => setShowLanding(false)} />;
    }

    return (
        <>
            <CurrencyHud
                chapas={gameState.chapas}
                tavernCoins={gameState.tavernCoins}
                huesin={gameState.huesin}
                tutStep={ladyRunTutStep}
                onTutAdvance={advanceLadyRunTutorial}
            />
            <RunnerScreen
                belowHud
                onEarnTavernCoins={(amount) => setGameState(prev => ({ ...prev, tavernCoins: (prev.tavernCoins ?? 0) + amount }))}
                onEarnChapas={(amount) => setGameState(prev => ({ ...prev, chapas: (prev.chapas ?? 0) + amount }))}
                onEarnHuesin={(amount) => setGameState(prev => ({ ...prev, huesin: (prev.huesin ?? 0) + amount }))}
                chapas={gameState.chapas ?? 0}
                tavernCoins={gameState.tavernCoins ?? 0}
                huesin={gameState.huesin ?? 0}
                unlockedDogIds={gameState.ladyRunUnlockedDogs ?? []}
                onUnlockDog={(dogId) => setGameState(prev => {
                    if ((prev.huesin ?? 0) < 10 || (prev.tavernCoins ?? 0) < 5) return prev;
                    const current = prev.ladyRunUnlockedDogs ?? [];
                    if (current.includes(dogId)) return prev;
                    return {
                        ...prev,
                        huesin: prev.huesin - 10,
                        tavernCoins: prev.tavernCoins - 5,
                        ladyRunUnlockedDogs: [...current, dogId],
                    };
                })}
                pendingHeartsBonus={gameState.ladyRunPendingHearts ?? 0}
                onConsumePendingHearts={() => setGameState(prev => ({ ...prev, ladyRunPendingHearts: 0 }))}
                magicHearts={gameState.ladyRunMagicHearts ?? 0}
                onUseMagicHeart={() => setGameState(prev => ({ ...prev, ladyRunMagicHearts: Math.max(0, (prev.ladyRunMagicHearts ?? 0) - 1) }))}
                greenHearts={gameState.ladyRunGreenHearts ?? 0}
                onConsumeGreenHeart={() => setGameState(prev => ({ ...prev, ladyRunGreenHearts: Math.max(0, (prev.ladyRunGreenHearts ?? 0) - 1) }))}
                dailyFreeClaimedAt={gameState.ladyRunDailyFreeClaimedAt ?? {}}
                onClaimDailyFree={(itemId) => setGameState(prev => ({
                    ...prev,
                    ladyRunDailyFreeClaimedAt: { ...(prev.ladyRunDailyFreeClaimedAt ?? {}), [itemId]: Date.now() },
                }))}
                ladyRunTutStep={ladyRunTutStep}
                setLadyRunTutStep={setLadyRunTutStep}
                advanceLadyRunTutorial={advanceLadyRunTutorial}
                ladyRunLibreTutorialCompleted={gameState.ladyRunLibreTutorial?.completed ?? false}
                onCompleteLadyRunLibreTutorial={() => setGameState(prev => ({ ...prev, ladyRunLibreTutorial: { completed: true } }))}
                ladyRunRunTutorialCompleted={gameState.ladyRunRunTutorial?.completed ?? false}
                onCompleteLadyRunRunTutorial={() => setGameState(prev => ({ ...prev, ladyRunRunTutorial: { completed: true } }))}
                onBuyItem={(itemId, price) => setGameState(prev => {
                    if (itemId === 'corazon_extra') {
                        if ((prev.chapas ?? 0) < price) return prev;
                        return { ...prev, chapas: prev.chapas - price, ladyRunPendingHearts: (prev.ladyRunPendingHearts ?? 0) + 1 };
                    }
                    if (itemId === 'corazon_magico') {
                        if ((prev.ladyRunMagicHearts ?? 0) >= 2 || (prev.tavernCoins ?? 0) < price) return prev;
                        return { ...prev, tavernCoins: prev.tavernCoins - price, ladyRunMagicHearts: (prev.ladyRunMagicHearts ?? 0) + 1 };
                    }
                    if (itemId === 'corazon_verde') {
                        if ((prev.ladyRunGreenHearts ?? 0) >= 5 || (prev.chapas ?? 0) < price) return prev;
                        return { ...prev, chapas: prev.chapas - price, ladyRunGreenHearts: (prev.ladyRunGreenHearts ?? 0) + 1 };
                    }
                    return prev;
                })}
                fullLootRunsByDifficulty={(() => {
                    const key = getDailyRotationKey(gameState.debugDayOffset ?? 0);
                    const byDiff = gameState.ladyRunDailyRuns ?? {};
                    return {
                        facil: byDiff.facil?.rotationKey === key ? (byDiff.facil.count ?? 0) : 0,
                        medio: byDiff.medio?.rotationKey === key ? (byDiff.medio.count ?? 0) : 0,
                        dificil: byDiff.dificil?.rotationKey === key ? (byDiff.dificil.count ?? 0) : 0,
                    };
                })()}
                onGameOverRun={(diff) => setGameState(prev => {
                    const key = getDailyRotationKey(prev.debugDayOffset ?? 0);
                    const byDiff = prev.ladyRunDailyRuns ?? {};
                    const current = byDiff[diff]?.rotationKey === key ? byDiff[diff].count : 0;
                    return { ...prev, ladyRunDailyRuns: { ...byDiff, [diff]: { rotationKey: key, count: current + 1 } } };
                })}
                dailyTramosClaimedByDifficulty={(() => {
                    const key = getDailyRotationKey(gameState.debugDayOffset ?? 0);
                    const byDiff = gameState.ladyRunDailyTramos ?? {};
                    return {
                        facil: byDiff.facil?.rotationKey === key ? (byDiff.facil.count ?? 0) : 0,
                        medio: byDiff.medio?.rotationKey === key ? (byDiff.medio.count ?? 0) : 0,
                        dificil: byDiff.dificil?.rotationKey === key ? (byDiff.dificil.count ?? 0) : 0,
                    };
                })()}
                onClaimDailyTramos={(diff, count) => setGameState(prev => {
                    const key = getDailyRotationKey(prev.debugDayOffset ?? 0);
                    const byDiff = prev.ladyRunDailyTramos ?? {};
                    return { ...prev, ladyRunDailyTramos: { ...byDiff, [diff]: { rotationKey: key, count } } };
                })}
                bestDistanceByDog={gameState.ladyRunBestDistance ?? {}}
                onNewDistanceRecord={(dogId, meters) => setGameState(prev => ({
                    ...prev,
                    ladyRunBestDistance: { ...(prev.ladyRunBestDistance ?? {}), [dogId]: meters },
                }))}
            />
        </>
    );
};

export default LadyRunStandalone;
