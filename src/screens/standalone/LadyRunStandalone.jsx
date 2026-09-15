import { useState, useEffect } from 'react';
import RunnerScreen from '../modalRunner/RunnerScreen.jsx';
import LadyRunLanding from './LadyRunLanding.jsx';
import LadyRunUsernameScreen from './LadyRunUsernameScreen.jsx';
import { getDailyRotationKey } from '../../game/utils/dateRotation.js';
import CurrencyHud from '../../components/CurrencyHud.jsx';
import { useLadyRunTutorial } from '../../game/hooks/useLadyRunTutorial.js';
import { useLadyRunProfile } from '../../game/hooks/useLadyRunProfile.js';
import { usePreloadImages, prefetchImages } from '../../game/hooks/usePreloadImages.js';
import { RUNNER_CORE_PRELOAD_IMAGES, RUNNER_HISTORIA_PRELOAD_IMAGES } from '../modalRunner/runnerPreloadAssets.js';
import '../../styles/standalone/LadyRunStandalone.css';

const SAVE_KEY = 'ladyRunGame';

// Guardado propio de Lady Run, 100% independiente de Pata y Pico desde la separacion de repos (ver
// project_plan_separar_lady_run). Las 3 monedas ya NO viven aqui, viven en Supabase (profiles.chapas/
// tavern_coins/huesin, ver supabase/sql/008_profiles_currency.sql) para que no se puedan editar a
// mano desde el navegador - esto solo guarda el resto del progreso (perros desbloqueados, corazones
// en inventario, tutoriales, records...).
const loadSavedState = () => {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* save corrupto o inexistente: se empieza de cero */ }
    return {};
};

/**
 * Punto de entrada unico de Lady Run (proyecto independiente de Pata y Pico, solo comparten
 * estetica/assets). Ya no hay acceso "?lady-run" ni juego a cargar: esto ES la aplicacion.
 */
const LadyRunStandalone = () => {
    const [gameState, setGameState] = useState(loadSavedState);
    const [showLanding, setShowLanding] = useState(true);
    const loaded = usePreloadImages(RUNNER_CORE_PRELOAD_IMAGES);
    const { loading: profileLoading, initError: profileInitError, profile, claiming, claimError, claimUsername, equipAvatar, earnCurrency, spendCurrency } = useLadyRunProfile();
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

    if (!loaded || profileLoading) {
        return (
            <div className="lady-run-loading-screen">
                <div className="lady-run-loading-spinner" />
            </div>
        );
    }

    if (profileInitError) {
        return (
            <div className="lady-run-loading-screen">
                <p className="lady-run-loading-error">
                    No se pudo conectar con el servidor ({profileInitError}). Comprueba tu conexión y recarga.
                </p>
            </div>
        );
    }

    if (!profile) {
        return <LadyRunUsernameScreen onSubmit={claimUsername} submitting={claiming} errorMsg={claimError} />;
    }

    if (showLanding) {
        return <LadyRunLanding onPlay={() => setShowLanding(false)} />;
    }

    return (
        <>
            <CurrencyHud
                chapas={profile.chapas ?? 0}
                tavernCoins={profile.tavern_coins ?? 0}
                huesin={profile.huesin ?? 0}
                tutStep={ladyRunTutStep}
                onTutAdvance={advanceLadyRunTutorial}
            />
            <RunnerScreen
                belowHud
                avatarDogId={profile.avatar_dog_id}
                onEquipAvatar={equipAvatar}
                onEarnTavernCoins={(amount) => earnCurrency({ tavernCoins: amount })}
                onEarnChapas={(amount) => earnCurrency({ chapas: amount })}
                onEarnHuesin={(amount) => earnCurrency({ huesin: amount })}
                chapas={profile.chapas ?? 0}
                tavernCoins={profile.tavern_coins ?? 0}
                huesin={profile.huesin ?? 0}
                unlockedDogIds={gameState.ladyRunUnlockedDogs ?? []}
                onUnlockDog={(dogId) => {
                    const current = gameState.ladyRunUnlockedDogs ?? [];
                    if (current.includes(dogId)) return;
                    spendCurrency('unlock_dog').then(ok => {
                        if (!ok) return;
                        setGameState(prev => {
                            const cur = prev.ladyRunUnlockedDogs ?? [];
                            if (cur.includes(dogId)) return prev;
                            return { ...prev, ladyRunUnlockedDogs: [...cur, dogId] };
                        });
                    });
                }}
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
                onBuyItem={async (itemId, price) => {
                    if (itemId === 'corazon_magico' && (gameState.ladyRunMagicHearts ?? 0) >= 2) return;
                    if (itemId === 'corazon_verde' && (gameState.ladyRunGreenHearts ?? 0) >= 5) return;
                    if (price > 0) {
                        const ok = await spendCurrency(itemId);
                        if (!ok) return;
                    }
                    setGameState(prev => {
                        if (itemId === 'corazon_extra') {
                            return { ...prev, ladyRunPendingHearts: (prev.ladyRunPendingHearts ?? 0) + 1 };
                        }
                        if (itemId === 'corazon_magico') {
                            if ((prev.ladyRunMagicHearts ?? 0) >= 2) return prev;
                            return { ...prev, ladyRunMagicHearts: (prev.ladyRunMagicHearts ?? 0) + 1 };
                        }
                        if (itemId === 'corazon_verde') {
                            if ((prev.ladyRunGreenHearts ?? 0) >= 5) return prev;
                            return { ...prev, ladyRunGreenHearts: (prev.ladyRunGreenHearts ?? 0) + 1 };
                        }
                        return prev;
                    });
                }}
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
