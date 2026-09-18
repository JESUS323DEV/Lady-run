import { useEffect, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { playLadyRunSfx } from '../../game/utils/ladyRunSfx.js';
import { AVATAR_FRAMES } from './ladyRunAvatarFramesCatalog.js';
import { SKIN_CATALOG } from './ladyRunSkinsCatalog.js';
import LadyRunSkinEquipModal from './LadyRunSkinEquipModal.jsx';
import LadyRunTutorialCallout from '../../components/LadyRunTutorialCallout.jsx';
import chapaIcon from '../../assets/ui/icons-hud/hud-modals/game-run/icons/hud/chapas.webp';
import tavernCoinIcon from '../../assets/ui/icons-hud/hud-principal/coin-tavern1.webp';
import huesinIcon from '../../assets/ui/icons-hud/hud-principal/huesin-coin.webp';
import lockIcon from '../../assets/ui/icons-hud/hud-modals/rewards/icon-rewards/lock.webp';
import '../../styles/modals/LadyRunAvatarModal.css';
import '../../styles/modals/LadyRunSkinsModal.css';

// Grupos del picker de marcos, en el orden en que se muestran (ver ladyRunAvatarFramesCatalog.js
// para el precio/gratis de cada uno).
const FRAME_GROUP_ORDER = ['marco-base', 'marco-fondo'];

// Cada marco tiene su precio en UNA sola moneda (chapas los base, monedas los animados) - ver
// ladyRunAvatarFramesCatalog.js. Resuelve icono + numero segun cual de las 3 venga rellena.
const framePriceIconAndValue = (price) => {
    if (price.chapas > 0) return [chapaIcon, price.chapas];
    if (price.huesin > 0) return [huesinIcon, price.huesin];
    return [tavernCoinIcon, price.tavernCoins];
};

// Pantalla de avatar de Lady Run: circulo grande con el avatar equipado + rejilla de perros ya
// desbloqueados para elegir uno nuevo (se guarda en profiles.avatar_dog_id, ver
// supabase/sql/004_profiles_avatar.sql). Mismo avatar que luego se ve en el Ranking.
export default function LadyRunAvatarModal({
    onClose, currentAvatarDogId, avatarOptions, onEquip, frameId, onEquipFrame,
    ownedSkins = {}, equippedSkinByDog = {}, onEquipSkin,
    unlockedFrames = [], onBuyFrame,
    chapas = 0, tavernCoins = 0, huesin = 0,
    tutStep = null, onTutAdvance,
}) {
    const currentDog = avatarOptions.find(dog => dog.id === currentAvatarDogId);
    const currentFrame = AVATAR_FRAMES.find(frame => frame.id === frameId) ?? AVATAR_FRAMES[0];
    const [framePickerOpen, setFramePickerOpen] = useState(false);
    const [variantsDogId, setVariantsDogId] = useState(null);
    // Preview grande al tocar un marco (bloqueado o no), igual que el flujo de compra de Skins:
    // se ve el marco con tu avatar actual dentro, y el boton de abajo compra o equipa segun toque.
    const [framePreview, setFramePreview] = useState(null); // frame | null
    const [frameBuying, setFrameBuying] = useState(false); // giro de compra en curso
    const [frameBuyError, setFrameBuyError] = useState(false);
    // Paso "avatar_marcos" del tutorial: el mensaje sale YA CON el picker abierto (no antes de
    // tocar "Marcos"), al tocar Continuar espera unos segundos y resalta la X para cerrar.
    const [marcosTutContinued, setMarcosTutContinued] = useState(false);
    const [marcosTutCloseReady, setMarcosTutCloseReady] = useState(false);
    useEffect(() => {
        if (!marcosTutContinued) return undefined;
        const t = setTimeout(() => setMarcosTutCloseReady(true), 2500);
        return () => clearTimeout(t);
    }, [marcosTutContinued]);

    // Durante avatar_perro/avatar_marcos el tutorial es obligatorio: ni la flecha de volver del
    // modal ni el fondo oscuro pueden cerrarlo, solo se libera al llegar a avatar_volver.
    const avatarTutLocked = tutStep === 'avatar_perro' || tutStep === 'avatar_marcos';
    const handleAvatarClose = () => {
        if (avatarTutLocked) return;
        if (tutStep === 'avatar_volver') onTutAdvance?.();
        onClose();
    };

    // Igual para el picker de Marcos: la X y el fondo del popover no cierran hasta que pasen los
    // 2.5s de "marcosTutCloseReady" (momento en el que empieza a brillar). Cerrar aqui YA NO hace
    // avanzar el tutorial (ver handleFrameAction) - cerrar sin equipar solo te deja salir a mirar.
    const marcosCloseReady = tutStep !== 'avatar_marcos' || marcosTutCloseReady;
    const handleMarcosClose = () => {
        if (!marcosCloseReady) return;
        setFramePickerOpen(false);
    };

    // Si el picker se cierra sin haber equipado nada (X, fondo, etc.) estando todavia en
    // 'avatar_marcos', resetea el estado del tutorial para que la proxima vez que se abra Marcos
    // se vea limpio desde el principio en vez de quedarse en un estado a medias.
    useEffect(() => {
        if (framePickerOpen || tutStep !== 'avatar_marcos') return;
        setMarcosTutContinued(false);
        setMarcosTutCloseReady(false);
    }, [framePickerOpen, tutStep]);

    const isFrameUnlocked = frame => frame.free || unlockedFrames.includes(frame.id);
    const canAffordFrame = frame => (frame.price.chapas ?? 0) <= chapas && (frame.price.tavernCoins ?? 0) <= tavernCoins && (frame.price.huesin ?? 0) <= huesin;

    // Foto a usar para un perro: la skin equipada (misma que se ve corriendo en pista, ver
    // ladyRunSkinsCatalog.js) si tiene una, si no el icono base del perro.
    const dogPhoto = (dogId, baseIcon) => {
        const skinId = equippedSkinByDog[dogId];
        if (!skinId) return baseIcon;
        const catalog = SKIN_CATALOG[dogId];
        const skin = catalog?.ultimate?.id === skinId ? catalog.ultimate : catalog?.normal.find(s => s.id === skinId);
        return skin?.img ?? baseIcon;
    };

    const openFramePreview = frame => {
        setFrameBuyError(false);
        setFrameBuying(false);
        setFramePreview(frame);
    };

    // Marca el paso "avatar_marcos" del tutorial como completo: equipar un marco de verdad (no
    // cerrar el popover) es lo que hace avanzar el tutorial, y cerramos el popover nosotros mismos
    // en el momento - evita depender del evento de cierre, que fallaba en iPhone.
    const advanceMarcosTutIfNeeded = () => {
        if (tutStep !== 'avatar_marcos') return;
        onTutAdvance?.();
        setFramePickerOpen(false);
    };

    const handleFrameAction = async () => {
        if (!framePreview) return;
        if (isFrameUnlocked(framePreview)) {
            playLadyRunSfx('buttonMode');
            onEquipFrame?.(framePreview.id);
            setFramePreview(null);
            advanceMarcosTutIfNeeded();
            return;
        }
        setFrameBuyError(false);
        setFrameBuying(true);
        const ok = await onBuyFrame?.(framePreview);
        if (!ok) {
            setFrameBuying(false);
            setFrameBuyError(true);
            return;
        }
        playLadyRunSfx('rewardGold');
        advanceMarcosTutIfNeeded();
        setTimeout(() => {
            setFrameBuying(false);
            setFramePreview(null);
        }, 900);
    };

    const variantsDog = avatarOptions.find(dog => dog.id === variantsDogId);

    return (
        <div className="lady-run-shop-backdrop" onClick={handleAvatarClose}>
            <div className="lady-run-shop-panel" onClick={e => e.stopPropagation()}>
                {!avatarTutLocked && (
                    <button
                        className={`lady-run-back-btn${tutStep === 'avatar_volver' ? ' lady-run-tut-highlight' : ''}`}
                        data-tutorial="lady-run-tut-avatar-volver"
                        onClick={() => { playLadyRunSfx('backButton'); handleAvatarClose(); }}
                    ><ArrowLeft size={16} /></button>
                )}
                <p className="runner-overlay-title">Tu avatar</p>

                <div className="lady-run-avatar-preview">
                    {currentFrame && <img src={currentFrame.img} alt="" className="lady-run-avatar-preview-frame" />}
                    {currentDog ? (
                        <img
                            src={dogPhoto(currentDog.id, currentDog.icon)}
                            alt={currentDog.name}
                            className={`lady-run-avatar-preview-photo${currentFrame?.folder === 'marco-fondo' ? ' lady-run-avatar-preview-photo-bottom' : ''}`}
                        />
                    ) : null}
                </div>

                <button
                    className={`runner-start-btn runner-start-btn-compact lady-run-avatar-frame-btn${tutStep === 'avatar_marcos' && !framePickerOpen ? ' lady-run-tut-highlight' : ''}`}
                    data-tutorial="lady-run-tut-avatar-marcos"
                    onClick={() => {
                        playLadyRunSfx('buttonMode');
                        setMarcosTutContinued(false);
                        setMarcosTutCloseReady(false);
                        setFramePickerOpen(true);
                    }}
                >
                    Marcos
                </button>

                {tutStep === 'avatar_marcos' && !framePickerOpen && (
                    <LadyRunTutorialCallout targetSelector='[data-tutorial="lady-run-tut-avatar-marcos"]' />
                )}

                <div
                    className={`lady-run-avatar-grid${tutStep === 'avatar_perro' ? ' lady-run-tut-highlight' : ''}`}
                    data-tutorial="lady-run-tut-avatar-perros"
                >
                    {avatarOptions.map(dog => (
                        <div
                            key={dog.id}
                            className={`lady-run-avatar-option${dog.id === currentAvatarDogId ? ' lady-run-avatar-option-active' : ''}`}
                        >
                            <button
                                className="lady-run-avatar-option-select"
                                onClick={() => {
                                    playLadyRunSfx('doubleJump');
                                    onEquip(dog.id);
                                    if (tutStep === 'avatar_perro') onTutAdvance?.();
                                }}
                            >
                                <img src={dogPhoto(dog.id, dog.icon)} alt={dog.name} className="lady-run-avatar-option-icon" />
                                <span className="lady-run-avatar-option-name">{dog.name}</span>
                            </button>
                            <button
                                className="lady-run-avatar-option-variants"
                                disabled={(ownedSkins[dog.id] ?? []).length === 0}
                                onClick={() => setVariantsDogId(dog.id)}
                            >
                                Variantes
                            </button>
                        </div>
                    ))}
                </div>

                {tutStep === 'avatar_perro' && (
                    <LadyRunTutorialCallout
                        targetSelector='[data-tutorial="lady-run-tut-avatar-perros"]'
                        title="Elige tu perro"
                        text="Este será tu avatar, se verá en el Ranking."
                    />
                )}

                {framePickerOpen && (
                    <div className="lady-run-skin-equip-backdrop" onClick={e => { e.stopPropagation(); handleMarcosClose(); }}>
                        <div className="lady-run-skin-equip-popover" onClick={e => e.stopPropagation()}>
                            <div className="lady-run-skin-equip-header">
                                <span className="lady-run-skin-equip-title">Marcos</span>
                                {marcosCloseReady && (
                                    <button
                                        className={`lady-run-skin-equip-close${tutStep === 'avatar_marcos' ? ' lady-run-tut-highlight' : ''}`}
                                        data-tutorial="lady-run-tut-avatar-marcos-cerrar"
                                        onClick={handleMarcosClose}
                                    ><X size={13} /></button>
                                )}
                            </div>

                            {tutStep === 'avatar_marcos' && !marcosTutContinued && (
                                <LadyRunTutorialCallout
                                    title="Personaliza tu avatar"
                                    text="Elige un marco para destacar en el Ranking."
                                    actionLabel="Continuar"
                                    onAction={() => setMarcosTutContinued(true)}
                                />
                            )}
                            {FRAME_GROUP_ORDER.map(folder => {
                                const framesInGroup = AVATAR_FRAMES.filter(frame => frame.folder === folder);
                                if (framesInGroup.length === 0) return null;
                                return (
                                    <div key={folder}>
                                        <span className="lady-run-skins-section-title">{framesInGroup[0].groupLabel}</span>
                                        <div className="lady-run-skin-equip-grid">
                                            {framesInGroup.map(frame => {
                                                const unlocked = isFrameUnlocked(frame);
                                                return (
                                                    <button
                                                        key={frame.id}
                                                        className={`lady-run-skin-equip-item lady-run-frame-equip-item${frame.id === currentFrame?.id ? ' lady-run-skin-equip-item-active' : ''}`}
                                                        onClick={() => openFramePreview(frame)}
                                                    >
                                                        {!unlocked && <img src={lockIcon} alt="Bloqueado" className="lady-run-skin-card-lock" />}
                                                        <img src={frame.img} alt={frame.name} className="lady-run-skin-equip-img lady-run-frame-equip-img" />
                                                        <span className="lady-run-skin-equip-name">{frame.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {framePreview && (() => {
                    const unlocked = isFrameUnlocked(framePreview);
                    const canAfford = unlocked || canAffordFrame(framePreview);
                    const isEquipped = framePreview.id === currentFrame?.id;
                    const isBottom = framePreview.folder === 'marco-fondo';
                    return (
                        <div className="lady-run-skin-preview-overlay" onClick={() => { if (!frameBuying) setFramePreview(null); }}>
                            <div className="lady-run-frame-preview-panel" onClick={e => e.stopPropagation()}>
                                <button className="lady-run-skin-preview-close" onClick={() => setFramePreview(null)}><X size={16} /></button>
                                <div className="lady-run-skin-preview-darken" />
                                <div className="lady-run-skin-preview-particles">
                                    <span></span><span></span><span></span><span></span><span></span><span></span>
                                </div>

                                <h2 className="lady-run-skin-preview-title">{framePreview.name}</h2>
                                <span className="lady-run-skin-preview-rarity">{framePreview.groupLabel}</span>

                                <div className="lady-run-avatar-preview lady-run-avatar-preview-big">
                                    <img
                                        src={framePreview.img}
                                        alt=""
                                        className={`lady-run-avatar-preview-frame${frameBuying ? ' lady-run-skin-preview-reveal-spin' : ''}`}
                                    />
                                    {currentDog && (
                                        <img
                                            src={dogPhoto(currentDog.id, currentDog.icon)}
                                            alt={currentDog.name}
                                            className={`lady-run-avatar-preview-photo${isBottom ? ' lady-run-avatar-preview-photo-bottom' : ''}`}
                                        />
                                    )}
                                </div>

                                <button
                                    className={`runner-start-btn runner-start-btn-compact lady-run-skin-preview-buy-btn${isEquipped ? ' lady-run-skin-preview-owned' : ''}`}
                                    disabled={isEquipped || frameBuying || !canAfford}
                                    onClick={handleFrameAction}
                                >
                                    {isEquipped ? 'Equipado' : !unlocked ? (() => {
                                        const [priceIcon, priceValue] = framePriceIconAndValue(framePreview.price);
                                        return (
                                            <>
                                                <img src={priceIcon} alt="" className="lady-run-shop-heart-card-buy-icon" />
                                                {priceValue}
                                            </>
                                        );
                                    })() : 'Equipar'}
                                </button>
                                {frameBuyError && <p className="lady-run-skin-preview-error">No se pudo comprar, inténtalo de nuevo.</p>}
                            </div>
                        </div>
                    );
                })()}

                {variantsDog && (
                    <LadyRunSkinEquipModal
                        onClose={() => setVariantsDogId(null)}
                        dogId={variantsDog.id}
                        dogName={variantsDog.name}
                        dogIcon={variantsDog.icon}
                        ownedSkinIds={ownedSkins[variantsDog.id] ?? []}
                        equippedSkinId={equippedSkinByDog[variantsDog.id] ?? null}
                        onEquip={(skinId) => onEquipSkin?.(variantsDog.id, skinId)}
                    />
                )}
            </div>
        </div>
    );
}
