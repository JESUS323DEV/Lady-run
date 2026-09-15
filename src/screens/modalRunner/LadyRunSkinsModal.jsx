import { useEffect, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import huesinIcon from '../../assets/ui/icons-hud/hud-principal/huesin-coin.webp';
import lockIcon from '../../assets/ui/icons-hud/hud-modals/rewards/icon-rewards/lock.webp';
import { SKIN_CATALOG } from './ladyRunSkinsCatalog.js';
import '../../styles/modals/LadyRunSkinsModal.css';

// TEMPORAL (ver FEATURES.md): a 0 mientras se prueban las primeras skins con sprite de correr de
// verdad, sin tener que farmear huesin. Cuando se decida el precio definitivo, volver a poner un
// numero aqui Y en spend_currency (supabase/sql/010_skins_gratis_temporal.sql).
const SKIN_PRICES = { normal: 0, ultimate: 0 };
const RARITY_LABEL = { legendary: 'Legendaria', epic: 'Épica', rare: 'Rara' };

// Tienda de skins de Lady Run, inspirada en la de Pata y Pico (SkinShopModal.jsx): tocar una skin
// abre un preview grande con marco de rareza/particulas, comprar hace un fundido + giro de revelado.
// Sin la fase de "el perro corriendo" del original (necesitaria mapear ~40 assets con nombres poco
// consistentes) y sin animaciones en pista todavia - esto solo guarda que la tienes.
export default function LadyRunSkinsModal({ onClose, dogIcons = {}, dogNames = {}, dogRarities = {}, ownedSkins = {}, onBuySkin }) {
    const dogIds = Object.keys(SKIN_CATALOG);
    const [selectedDog, setSelectedDog] = useState(dogIds[0] ?? null);
    const [preview, setPreview] = useState(null); // { dogId, skin, tier } | null
    const [purchaseAnim, setPurchaseAnim] = useState(null); // null | 'fading' | 'reveal'
    const [justBought, setJustBought] = useState(false);
    const [buyError, setBuyError] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [shockwave, setShockwave] = useState(null);

    useEffect(() => {
        setJustBought(false);
        setBuyError(false);
        setPurchaseAnim(null);
    }, [preview]);

    const dogCatalog = selectedDog ? SKIN_CATALOG[selectedDog] : null;
    const ownedForDog = ownedSkins[selectedDog] ?? [];

    const handlePreviewTap = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;
        setTilt({ x: -(relY - 0.5) * 26, y: (relX - 0.5) * 26 });
        setShockwave({ x: relX * 100, y: relY * 100, id: Date.now() });
        setTimeout(() => setTilt({ x: 0, y: 0 }), 400);
    };

    const handleBuy = async () => {
        const { dogId, skin, tier } = preview;
        setBuyError(false);
        setPurchaseAnim('fading');
        const ok = await onBuySkin?.(dogId, skin.id, tier);
        if (!ok) {
            setPurchaseAnim(null);
            setBuyError(true);
            return;
        }
        setTimeout(() => setPurchaseAnim('reveal'), 250);
        setTimeout(() => { setPurchaseAnim(null); setJustBought(true); }, 1150);
    };

    return (
        <div className="lady-run-shop-backdrop" onClick={onClose}>
            <div className="lady-run-shop-panel" onClick={e => e.stopPropagation()}>
                <button className="lady-run-back-btn" onClick={onClose}><ArrowLeft size={16} /></button>
                <p className="runner-overlay-title">Skins</p>

                <div className="lady-run-skins-dogs">
                    {dogIds.map(dogId => (
                        <button
                            key={dogId}
                            className={`lady-run-skins-dog-btn${dogId === selectedDog ? ' lady-run-skins-dog-btn-active' : ''}`}
                            onClick={() => setSelectedDog(dogId)}
                        >
                            {dogIcons[dogId] && <img src={dogIcons[dogId]} alt={dogNames[dogId] ?? dogId} />}
                        </button>
                    ))}
                </div>

                {dogCatalog && (
                    <div className="lady-run-skins-grid">
                        {dogCatalog.ultimate && (
                            <SkinCard
                                skin={dogCatalog.ultimate}
                                owned={ownedForDog.includes(dogCatalog.ultimate.id)}
                                locked={!dogCatalog.ultimate.runImg}
                                ultimate
                                onOpen={() => setPreview({ dogId: selectedDog, skin: dogCatalog.ultimate, tier: 'ultimate' })}
                            />
                        )}
                        {dogCatalog.normal.map(skin => (
                            <SkinCard
                                key={skin.id}
                                skin={skin}
                                owned={ownedForDog.includes(skin.id)}
                                locked={!skin.runImg}
                                onOpen={() => setPreview({ dogId: selectedDog, skin, tier: 'normal' })}
                            />
                        ))}
                    </div>
                )}

                {preview && (() => {
                    const owned = ownedSkins[preview.dogId] ?? [];
                    const isOwned = owned.includes(preview.skin.id) || justBought;
                    const isUltimate = preview.tier === 'ultimate';
                    const rarity = dogRarities[preview.dogId] ?? 'rare';
                    const price = SKIN_PRICES[preview.tier];
                    const dogName = dogNames[preview.dogId] ?? preview.dogId;

                    return (
                        <div className="lady-run-skin-preview-overlay" onClick={e => { e.stopPropagation(); setPreview(null); }}>
                            <div
                                className={`lady-run-skin-preview-frame${isUltimate ? ' lady-run-skin-preview-frame-ultimate' : ` dog-rarity-${rarity}`}`}
                                onClick={e => e.stopPropagation()}
                            >
                                <button className="lady-run-skin-preview-close" onClick={() => setPreview(null)}><X size={16} /></button>
                                <div className="lady-run-skin-preview-darken" />
                                {isUltimate && <div className="lady-run-skin-preview-glow" />}
                                <div className="lady-run-skin-preview-particles">
                                    <span></span><span></span><span></span><span></span><span></span><span></span>
                                </div>

                                <h2 className="lady-run-skin-preview-title">{dogName} {preview.skin.name}</h2>
                                <span className="lady-run-skin-preview-rarity">
                                    {isUltimate ? 'Ultimate' : RARITY_LABEL[rarity]}
                                </span>

                                <div className="lady-run-skin-preview-img-slot" onClick={handlePreviewTap} style={{ transform: `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
                                    {purchaseAnim === 'reveal' ? (
                                        <img src={preview.skin.img} alt="" className="lady-run-skin-preview-img lady-run-skin-preview-reveal-spin" />
                                    ) : isUltimate ? (
                                        <>
                                            <img src={preview.skin.img} alt="" className={`lady-run-skin-preview-img lady-run-skin-preview-fase1${purchaseAnim === 'fading' ? ' lady-run-skin-preview-fade-out' : ''}`} />
                                            {preview.skin.img2 && (
                                                <img src={preview.skin.img2} alt="" className={`lady-run-skin-preview-img lady-run-skin-preview-fase2${purchaseAnim === 'fading' ? ' lady-run-skin-preview-fade-out' : ''}`} />
                                            )}
                                        </>
                                    ) : (
                                        <img src={preview.skin.img} alt="" className={`lady-run-skin-preview-img${purchaseAnim === 'fading' ? ' lady-run-skin-preview-fade-out' : ''}`} />
                                    )}
                                    {shockwave && (
                                        <span
                                            key={shockwave.id}
                                            className="lady-run-skin-preview-shockwave"
                                            style={{ left: `${shockwave.x}%`, top: `${shockwave.y}%` }}
                                            onAnimationEnd={() => setShockwave(null)}
                                        />
                                    )}
                                </div>

                                <button
                                    className={`runner-start-btn runner-start-btn-compact lady-run-skin-preview-buy-btn${isOwned ? ' lady-run-skin-preview-owned' : ''}`}
                                    disabled={isOwned}
                                    onClick={handleBuy}
                                >
                                    {isOwned ? 'Adquirida' : price === 0 ? 'Gratis' : (
                                        <>
                                            <img src={huesinIcon} alt="Huesín" className="lady-run-shop-heart-card-buy-icon" />
                                            {price}
                                        </>
                                    )}
                                </button>
                                {buyError && <p className="lady-run-skin-preview-error">No se pudo comprar, inténtalo de nuevo.</p>}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}

function SkinCard({ skin, owned, ultimate, locked, onOpen }) {
    const price = SKIN_PRICES[ultimate ? 'ultimate' : 'normal'];
    return (
        <button
            className={`lady-run-skin-card${ultimate ? ' lady-run-skin-card-ultimate' : ''}${locked ? ' lady-run-skin-card-locked' : ''}`}
            onClick={locked ? undefined : onOpen}
            disabled={locked}
        >
            {ultimate && skin.img2 ? (
                <span className="lady-run-skin-card-loop">
                    <img src={skin.img} alt={skin.name} className="lady-run-skin-card-img lady-run-skin-card-fase1" />
                    <img src={skin.img2} alt={skin.name} className="lady-run-skin-card-img lady-run-skin-card-fase2" />
                </span>
            ) : (
                <img src={skin.img} alt={skin.name} className="lady-run-skin-card-img" />
            )}
            {locked && <img src={lockIcon} alt="Bloqueada" className="lady-run-skin-card-lock" />}
            <span className="lady-run-skin-card-name">{skin.name}</span>
            {locked ? (
                <span className="lady-run-skin-card-price">Próximamente</span>
            ) : owned ? (
                <span className="lady-run-skin-card-owned">Adquirida</span>
            ) : price === 0 ? (
                <span className="lady-run-skin-card-price">Gratis</span>
            ) : (
                <span className="lady-run-skin-card-price">
                    <img src={huesinIcon} alt="Huesín" className="lady-run-shop-heart-card-buy-icon" />
                    {price}
                </span>
            )}
        </button>
    );
}
