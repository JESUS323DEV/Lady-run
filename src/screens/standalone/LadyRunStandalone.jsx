import { useState, useEffect } from 'react';
import RunnerScreen from '../modalRunner/RunnerScreen.jsx';
import LadyRunLanding from './LadyRunLanding.jsx';
import LadyRunUsernameScreen from './LadyRunUsernameScreen.jsx';
import { getDailyRotationKey } from '../../game/utils/dateRotation.js';
import CurrencyHud from '../../components/CurrencyHud.jsx';
import { useLadyRunTutorial } from '../../game/hooks/useLadyRunTutorial.js';
import { useLadyRunProfile } from '../../game/hooks/useLadyRunProfile.js';
import { usePreloadImages, prefetchImages, preloadImages } from '../../game/hooks/usePreloadImages.js';
import { RUNNER_CORE_PRELOAD_IMAGES, RUNNER_HISTORIA_PRELOAD_IMAGES } from '../modalRunner/runnerPreloadAssets.js';
import { AVATAR_FRAMES } from '../modalRunner/ladyRunAvatarFramesCatalog.js';
import { SKIN_CATALOG } from '../modalRunner/ladyRunSkinsCatalog.js';
import '../../styles/standalone/LadyRunStandalone.css';

const SAVE_KEY = 'ladyRunGame';

// Guardado propio de Lady Run, 100% independiente de Pata y Pico desde la separacion de repos (ver
// project_plan_separar_lady_run). Las 3 monedas viven en Supabase (profiles.chapas/tavern_coins/
// huesin, ver supabase/sql/008_profiles_currency.sql) desde el principio. El RESTO del progreso
// (perros/marcos/skins desbloqueados, corazones en inventario, tutoriales, records...) vivio SOLO
// en localStorage hasta ahora - ver 022_progress_sync.sql: ahora vive en profiles.progress, para que
// se comparta entre navegadores al vincular Google (antes cada navegador tenia su propio progreso
// aislado, ver project_lady_run_online_plan). loadLegacyLocalState solo se usa una vez, para migrar
// el progreso viejo de quien ya jugaba antes de este cambio (ver el useEffect de migracion abajo).
const loadLegacyLocalState = () => {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
            const { savedAt, ...rest } = JSON.parse(raw);
            return rest;
        }
    } catch { /* nada que migrar */ }
    return {};
};

/**
 * Punto de entrada unico de Lady Run (proyecto independiente de Pata y Pico, solo comparten
 * estetica/assets). Ya no hay acceso "?lady-run" ni juego a cargar: esto ES la aplicacion.
 */
const LadyRunStandalone = () => {
    const [showLanding, setShowLanding] = useState(true);
    // Elegir "Jugar" (sin tutorial) o "Jugar tutorial" se ofrece cada vez que se carga la app mientras
    // el tutorial principal no se haya completado NUNCA de verdad (no es un flag de "ya elegiste": si
    // hoy le das a "Jugar" y vuelves mañana sin haberlo completado, te lo vuelve a preguntar). Solo
    // dura la sesion (useState, no se guarda), por eso el tutorial arranca solo si activeTutorialChoice
    // es 'tutorial'.
    const [tutorialEntryChoice, setTutorialEntryChoice] = useState(null); // null | 'skip' | 'tutorial'
    const loaded = usePreloadImages(RUNNER_CORE_PRELOAD_IMAGES);
    const {
        loading: profileLoading, initError: profileInitError, profile, claiming, claimError, claimUsername,
        equipAvatar, equipAvatarFrame, equipAvatarSkin, earnCurrency, spendCurrency, updateProgress,
        googleLinked, linkGoogleAccount, signInWithGoogleAccount, signOut, linkGoogleIdentityExists, linkGoogleError,
    } = useLadyRunProfile();
    // gameState/setGameState mantienen la misma forma que antes (objeto plano + updater funcional
    // "prev => ({...prev, x: y})") para no tener que tocar cada sitio que ya los usaba asi - lo unico
    // que cambia es que ahora leen/escriben profiles.progress en vez de localStorage.
    const gameState = profile?.progress ?? {};
    const setGameState = updateProgress;
    const ladyRunTutorialCompleted = gameState.ladyRunTutorial?.completed ?? false;
    const { tutStep: ladyRunTutStep, setTutStep: setLadyRunTutStep, advanceTutorial: advanceLadyRunTutorial } = useLadyRunTutorial(
        ladyRunTutorialCompleted,
        () => setGameState(prev => ({ ...prev, ladyRunTutorial: { completed: true } })),
        loaded && !showLanding && (ladyRunTutorialCompleted || tutorialEntryChoice === 'tutorial'),
    );

    // Migracion de una sola vez POR NAVEGADOR (no por cuenta): si un jugador ya tenia progreso
    // guardado en localStorage de antes de este cambio (ver 022_progress_sync.sql) y su
    // profiles.progress en la nube llega vacio, se sube tal cual ese progreso local - asi no se
    // pierde nada al pasar a guardarlo en Supabase. El flag MIGRATED_KEY se guarda en localStorage
    // (no en un ref, que se resetea en cada recarga) para que esto no vuelva a dispararse nunca mas
    // en este navegador - sin el flag persistente, CUALQUIER cuenta nueva creada despues en el mismo
    // navegador heredaba restos de localStorage de una partida vieja ya abandonada (bug real
    // encontrado 2026-09-22: cuentas nuevas salian con marcos/skins sueltos que no deberian tener).
    const MIGRATED_KEY = 'ladyRunGameMigrated';
    useEffect(() => {
        if (!profile || localStorage.getItem(MIGRATED_KEY) === '1') return;
        localStorage.setItem(MIGRATED_KEY, '1');
        if (profile.progress && Object.keys(profile.progress).length > 0) return;
        const legacy = loadLegacyLocalState();
        if (Object.keys(legacy).length === 0) return;
        setGameState(() => legacy);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr una vez que el perfil carga, no en cada cambio de gameState/setGameState
    }, [profile]);

    // Historia esta bloqueada ahora mismo: no hace falta su contenido para jugar, asi que se
    // precarga de fondo (sin bloquear la pantalla) por si se desbloquea despues.
    useEffect(() => {
        if (!loaded) return;
        prefetchImages(RUNNER_HISTORIA_PRELOAD_IMAGES);
    }, [loaded]);

    // El marco y las skins equipadas salen de carpetas leidas por import.meta.glob (ver
    // ladyRunAvatarFramesCatalog.js/ladyRunSkinsCatalog.js), no pasan por RUNNER_CORE_PRELOAD_IMAGES.
    // Se precarga solo lo que el jugador tiene puesto ahora mismo (no el catalogo entero) en cuanto
    // se conoce su perfil. El marco se queda como precarga de fondo (no bloquea, pesa poco y no es
    // el sprite que se ve corriendo en pista); las skins SI bloquean la pantalla de carga (igual que
    // los obstaculos, ver runnerPreloadAssets.js) porque son el sprite del perro corriendo/saltando
    // de verdad, y un tironcito de decodificacion ahi se nota mucho mas jugando.
    const [equippedSkinLoaded, setEquippedSkinLoaded] = useState(false);
    useEffect(() => {
        if (!loaded || !profile) return;
        const frame = AVATAR_FRAMES.find(f => f.id === profile.avatar_frame_id) ?? AVATAR_FRAMES[0];
        prefetchImages([frame?.img].filter(Boolean));

        const equippedSkinUrls = Object.entries(gameState.ladyRunEquippedSkinByDog ?? {}).flatMap(([dogId, skinId]) => {
            const dogCatalog = SKIN_CATALOG[dogId];
            const skin = dogCatalog?.ultimate?.id === skinId ? dogCatalog.ultimate : dogCatalog?.normal.find(s => s.id === skinId);
            if (!skin) return [];
            return [skin.img, skin.runImg, skin.jumpImg];
        }).filter(Boolean);
        if (equippedSkinUrls.length === 0) { setEquippedSkinLoaded(true); return; }
        preloadImages(equippedSkinUrls).then(() => setEquippedSkinLoaded(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo hace falta disparar esto una vez que el perfil ya cargo, no en cada cambio de gameState
    }, [loaded, profile]);

    if (!loaded || profileLoading || (profile && !equippedSkinLoaded)) {
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

    // Una sola pantalla de aterrizaje, no dos seguidas: si el tutorial principal ya no esta pendiente
    // (completado, o esta sesion ya eligio "Jugar"/"Jugar tutorial"), solo se ofrece "Jugar" normal.
    if (showLanding) {
        return (
            <LadyRunLanding
                onPlay={() => { setShowLanding(false); if (!ladyRunTutorialCompleted) setTutorialEntryChoice('skip'); }}
                onPlayTutorial={!ladyRunTutorialCompleted ? () => { setShowLanding(false); setTutorialEntryChoice('tutorial'); } : undefined}
            />
        );
    }

    if (!profile) {
        return (
            <LadyRunUsernameScreen
                onSubmit={claimUsername}
                submitting={claiming}
                errorMsg={claimError}
                onRegisterGoogle={linkGoogleAccount}
                onSignInGoogle={signInWithGoogleAccount}
                linkGoogleIdentityExists={linkGoogleIdentityExists}
                linkGoogleError={linkGoogleError}
            />
        );
    }

    return (
        <>
            <CurrencyHud
                chapas={profile.chapas ?? 0}
                tavernCoins={profile.tavern_coins ?? 0}
                huesin={profile.huesin ?? 0}
                googleLinked={googleLinked}
                onLinkGoogle={linkGoogleAccount}
                onSignInGoogle={signInWithGoogleAccount}
                onSignOut={signOut}
                linkGoogleIdentityExists={linkGoogleIdentityExists}
                linkGoogleError={linkGoogleError}
                tutStep={ladyRunTutStep}
                onTutAdvance={advanceLadyRunTutorial}
            />
            <RunnerScreen
                belowHud
                username={profile.username}
                avatarDogId={profile.avatar_dog_id}
                onEquipAvatar={async (dogId) => {
                    const ok = await equipAvatar(dogId);
                    if (ok) equipAvatarSkin(gameState.ladyRunEquippedSkinByDog?.[dogId] ?? null);
                    return ok;
                }}
                avatarFrameId={profile.avatar_frame_id}
                onEquipFrame={equipAvatarFrame}
                unlockedFrames={gameState.ladyRunUnlockedFrames ?? []}
                onBuyFrame={async (frame) => {
                    const owned = gameState.ladyRunUnlockedFrames ?? [];
                    if (owned.includes(frame.id)) return true;
                    // El desbloqueo se guarda en la MISMA operacion que el pago (ver
                    // 022_progress_sync.sql) - asi no se puede pagar sin recibir nada, ni escribirse
                    // el desbloqueo sin pagar (spend_currency comprueba el precio en el servidor).
                    const ok = await spendCurrency(frame.itemId, { ladyRunUnlockedFrames: [...owned, frame.id] });
                    if (!ok) return false;
                    equipAvatarFrame(frame.id);
                    return true;
                }}
                eventosNodesDone={gameState.ladyRunEventosNodesDone ?? 0}
                onAdvanceEventosNode={(nodeIndex) => setGameState(prev => ({
                    ...prev,
                    ladyRunEventosNodesDone: Math.max(prev.ladyRunEventosNodesDone ?? 0, nodeIndex + 1),
                }))}
                eventosClaimedNodes={gameState.ladyRunEventosClaimedNodes ?? []}
                onClaimEventosNode={(nodeIndex) => setGameState(prev => {
                    const cur = prev.ladyRunEventosClaimedNodes ?? [];
                    if (cur.includes(nodeIndex)) return prev;
                    return { ...prev, ladyRunEventosClaimedNodes: [...cur, nodeIndex] };
                })}
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
                    spendCurrency('unlock_dog', { ladyRunUnlockedDogs: [...current, dogId] });
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
                    const patch = {};
                    if (itemId === 'corazon_extra') patch.ladyRunPendingHearts = (gameState.ladyRunPendingHearts ?? 0) + 1;
                    if (itemId === 'corazon_magico') patch.ladyRunMagicHearts = (gameState.ladyRunMagicHearts ?? 0) + 1;
                    if (itemId === 'corazon_verde') patch.ladyRunGreenHearts = (gameState.ladyRunGreenHearts ?? 0) + 1;
                    if (Object.keys(patch).length === 0) return;
                    if (price > 0) {
                        const ok = await spendCurrency(itemId, patch);
                        if (!ok) return;
                    } else {
                        setGameState(prev => ({ ...prev, ...patch }));
                    }
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
                ownedSkins={gameState.ladyRunOwnedSkins ?? {}}
                onBuySkin={async (dogId, skinId, tier, rarity) => {
                    const owned = gameState.ladyRunOwnedSkins?.[dogId] ?? [];
                    if (owned.includes(skinId)) return true;
                    const wasFirstSkin = owned.length === 0;
                    const patch = {
                        ladyRunOwnedSkins: { ...(gameState.ladyRunOwnedSkins ?? {}), [dogId]: [...owned, skinId] },
                    };
                    if (wasFirstSkin) {
                        patch.ladyRunEquippedSkinByDog = { ...(gameState.ladyRunEquippedSkinByDog ?? {}), [dogId]: skinId };
                    }
                    const ok = await spendCurrency(tier === 'ultimate' ? 'skin_ultimate' : `skin_${rarity ?? 'rare'}`, patch);
                    if (!ok) return false;
                    if (wasFirstSkin && dogId === profile.avatar_dog_id) equipAvatarSkin(skinId);
                    return true;
                }}
                equippedSkinByDog={gameState.ladyRunEquippedSkinByDog ?? {}}
                onEquipSkin={(dogId, skinId) => {
                    setGameState(prev => ({
                        ...prev,
                        ladyRunEquippedSkinByDog: { ...(prev.ladyRunEquippedSkinByDog ?? {}), [dogId]: skinId },
                    }));
                    if (dogId === profile.avatar_dog_id) equipAvatarSkin(skinId);
                }}
            />
        </>
    );
};

export default LadyRunStandalone;
