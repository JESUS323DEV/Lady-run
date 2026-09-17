import { X } from 'lucide-react';
import { playLadyRunSfx } from '../../game/utils/ladyRunSfx.js';
import { SKIN_CATALOG } from './ladyRunSkinsCatalog.js';
import '../../styles/modals/LadyRunSkinsModal.css';

// Inventario de skins de UN perro, popover pequeño (no pantalla completa) que se abre al tocar tu
// perro ya seleccionado en la rejilla de Modo Libre. Solo muestra las skins que ya tienes - equipar
// es instantaneo, sin paso de confirmar.
export default function LadyRunSkinEquipModal({ onClose, dogId, dogName, dogIcon, ownedSkinIds = [], equippedSkinId = null, onEquip }) {
    const catalog = SKIN_CATALOG[dogId];
    const ownedSkins = [
        ...(catalog?.ultimate && ownedSkinIds.includes(catalog.ultimate.id) ? [catalog.ultimate] : []),
        ...(catalog?.normal ?? []).filter(skin => ownedSkinIds.includes(skin.id)),
    ];
    const handleEquip = (skinId) => { playLadyRunSfx('buttonMode'); onEquip(skinId); onClose(); };

    return (
        <div className="lady-run-skin-equip-backdrop" onClick={onClose}>
            <div className="lady-run-skin-equip-popover" onClick={e => e.stopPropagation()}>
                <div className="lady-run-skin-equip-header">
                    <span className="lady-run-skin-equip-title">Skins de {dogName}</span>
                    <button className="lady-run-skin-equip-close" onClick={onClose}><X size={13} /></button>
                </div>

                <div className="lady-run-skin-equip-grid">
                    <button
                        className={`lady-run-skin-equip-item${equippedSkinId === null ? ' lady-run-skin-equip-item-active' : ''}`}
                        onClick={() => handleEquip(null)}
                    >
                        <img src={dogIcon} alt={dogName} className="lady-run-skin-equip-img" />
                        <span className="lady-run-skin-equip-name">Sin skin</span>
                    </button>
                    {ownedSkins.map(skin => (
                        <button
                            key={skin.id}
                            className={`lady-run-skin-equip-item${equippedSkinId === skin.id ? ' lady-run-skin-equip-item-active' : ''}`}
                            onClick={() => handleEquip(skin.id)}
                        >
                            <img src={skin.img} alt={skin.name} className="lady-run-skin-equip-img" />
                            <span className="lady-run-skin-equip-name">{skin.name}</span>
                        </button>
                    ))}
                </div>

                {ownedSkins.length === 0 && (
                    <p className="lady-run-skin-equip-empty">Todavía no tienes skins para {dogName}.</p>
                )}
            </div>
        </div>
    );
}
