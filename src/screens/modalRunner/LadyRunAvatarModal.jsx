import { useState } from 'react';
import { ArrowLeft, X, Percent } from 'lucide-react';
import { AVATAR_FRAMES } from './ladyRunAvatarFramesCatalog.js';
import { SKIN_CATALOG } from './ladyRunSkinsCatalog.js';
import LadyRunSkinEquipModal from './LadyRunSkinEquipModal.jsx';
import tavernCoinIcon from '../../assets/ui/icons-hud/hud-principal/coin-tavern1.webp';
import huesinIcon from '../../assets/ui/icons-hud/hud-principal/huesin-coin.webp';
import lockIcon from '../../assets/ui/icons-hud/hud-modals/rewards/icon-rewards/lock.webp';
import '../../styles/modals/LadyRunAvatarModal.css';
import '../../styles/modals/LadyRunSkinsModal.css';

// Grupos del picker de marcos, en el orden en que se muestran (ver ladyRunAvatarFramesCatalog.js
// para el precio/gratis de cada uno).
const FRAME_GROUP_ORDER = ['marco-base', 'marco-fondo'];

// Pantalla de avatar de Lady Run: circulo grande con el avatar equipado + rejilla de perros ya
// desbloqueados para elegir uno nuevo (se guarda en profiles.avatar_dog_id, ver
// supabase/sql/004_profiles_avatar.sql). Mismo avatar que luego se ve en el Ranking.
export default function LadyRunAvatarModal({
    onClose, currentAvatarDogId, avatarOptions, onEquip, frameId, onEquipFrame,
    ownedSkins = {}, equippedSkinByDog = {}, onEquipSkin,
    unlockedFrames = [], onBuyFrame,
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

    const isFrameUnlocked = frame => frame.free || unlockedFrames.includes(frame.id);

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

    const handleFrameAction = async () => {
        if (!framePreview) return;
        if (isFrameUnlocked(framePreview)) {
            onEquipFrame?.(framePreview.id);
            setFramePreview(null);
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
        setTimeout(() => {
            setFrameBuying(false);
            setFramePreview(null);
        }, 900);
    };

    const variantsDog = avatarOptions.find(dog => dog.id === variantsDogId);

    return (
        <div className="lady-run-shop-backdrop" onClick={onClose}>
            <div className="lady-run-shop-panel" onClick={e => e.stopPropagation()}>
                <button className="lady-run-back-btn" onClick={onClose}><ArrowLeft size={16} /></button>
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

                <button className="runner-start-btn runner-start-btn-compact lady-run-avatar-frame-btn" onClick={() => setFramePickerOpen(true)}>
                    Marcos
                </button>

                <div className="lady-run-avatar-grid">
                    {avatarOptions.map(dog => (
                        <div
                            key={dog.id}
                            className={`lady-run-avatar-option${dog.id === currentAvatarDogId ? ' lady-run-avatar-option-active' : ''}`}
                        >
                            <button className="lady-run-avatar-option-select" onClick={() => onEquip(dog.id)}>
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

                {framePickerOpen && (
                    <div className="lady-run-skin-equip-backdrop" onClick={() => setFramePickerOpen(false)}>
                        <div className="lady-run-skin-equip-popover" onClick={e => e.stopPropagation()}>
                            <div className="lady-run-skin-equip-header">
                                <span className="lady-run-skin-equip-title">Marcos</span>
                                <button className="lady-run-skin-equip-close" onClick={() => setFramePickerOpen(false)}><X size={13} /></button>
                            </div>
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
                                                        className={`lady-run-skin-equip-item${frame.id === currentFrame?.id ? ' lady-run-skin-equip-item-active' : ''}${!unlocked ? ' lady-run-skin-equip-item-locked' : ''}`}
                                                        onClick={() => openFramePreview(frame)}
                                                    >
                                                        <img src={frame.img} alt={frame.name} className="lady-run-skin-equip-img" />
                                                        {frame.offer && <span className="lady-run-frame-offer-badge"><Percent size={10} /></span>}
                                                        {!unlocked && (
                                                            <>
                                                                <img src={lockIcon} alt="Bloqueado" className="lady-run-skin-card-lock" />
                                                                <span className="lady-run-frame-price-badge">
                                                                    <img src={frame.price.huesin > 0 ? huesinIcon : tavernCoinIcon} alt="" />
                                                                    {frame.price.huesin > 0 ? frame.price.huesin : frame.price.tavernCoins}
                                                                </span>
                                                            </>
                                                        )}
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
                                    disabled={isEquipped || frameBuying}
                                    onClick={handleFrameAction}
                                >
                                    {isEquipped ? 'Equipado' : !unlocked ? (
                                        <>
                                            <img src={framePreview.price.huesin > 0 ? huesinIcon : tavernCoinIcon} alt="" className="lady-run-shop-heart-card-buy-icon" />
                                            {framePreview.price.huesin > 0 ? framePreview.price.huesin : framePreview.price.tavernCoins}
                                        </>
                                    ) : 'Equipar'}
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
