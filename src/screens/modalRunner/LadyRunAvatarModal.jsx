import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { AVATAR_FRAMES } from './ladyRunAvatarFramesCatalog.js';
import { SKIN_CATALOG } from './ladyRunSkinsCatalog.js';
import LadyRunSkinEquipModal from './LadyRunSkinEquipModal.jsx';
import '../../styles/modals/LadyRunAvatarModal.css';
import '../../styles/modals/LadyRunSkinsModal.css';

// Pantalla de avatar de Lady Run: circulo grande con el avatar equipado + rejilla de perros ya
// desbloqueados para elegir uno nuevo (se guarda en profiles.avatar_dog_id, ver
// supabase/sql/004_profiles_avatar.sql). Mismo avatar que luego se ve en el Ranking.
// El marco (AVATAR_FRAMES) es aparte: de momento todos disponibles sin bloqueo, solo para probar
// como quedan visualmente, no se persiste en Supabase todavia (ver FEATURES.md).
export default function LadyRunAvatarModal({
    onClose, currentAvatarDogId, avatarOptions, onEquip, frameId, onEquipFrame,
    ownedSkins = {}, equippedSkinByDog = {}, onEquipSkin,
}) {
    const currentDog = avatarOptions.find(dog => dog.id === currentAvatarDogId);
    const currentFrame = AVATAR_FRAMES.find(frame => frame.id === frameId) ?? AVATAR_FRAMES[0];
    const [framePickerOpen, setFramePickerOpen] = useState(false);
    const [variantsDogId, setVariantsDogId] = useState(null);

    // Foto a usar para un perro: la skin equipada (misma que se ve corriendo en pista, ver
    // ladyRunSkinsCatalog.js) si tiene una, si no el icono base del perro.
    const dogPhoto = (dogId, baseIcon) => {
        const skinId = equippedSkinByDog[dogId];
        if (!skinId) return baseIcon;
        const catalog = SKIN_CATALOG[dogId];
        const skin = catalog?.ultimate?.id === skinId ? catalog.ultimate : catalog?.normal.find(s => s.id === skinId);
        return skin?.img ?? baseIcon;
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
                            <div className="lady-run-skin-equip-grid">
                                {AVATAR_FRAMES.map(frame => (
                                    <button
                                        key={frame.id}
                                        className={`lady-run-skin-equip-item${frame.id === currentFrame?.id ? ' lady-run-skin-equip-item-active' : ''}`}
                                        onClick={() => { onEquipFrame?.(frame.id); setFramePickerOpen(false); }}
                                    >
                                        <img src={frame.img} alt={frame.name} className="lady-run-skin-equip-img" />
                                        <span className="lady-run-skin-equip-name">{frame.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

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
