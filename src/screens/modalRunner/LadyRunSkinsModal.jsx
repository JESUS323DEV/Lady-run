import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { playLadyRunSfx } from '../../game/utils/ladyRunSfx.js';
import huesinIcon from '../../assets/ui/icons-hud/hud-principal/huesin-coin.webp';
import lockIcon from '../../assets/ui/icons-hud/hud-modals/rewards/icon-rewards/lock.webp';
import { SKIN_CATALOG, PURCHASE_BASE_FRAMES } from './ladyRunSkinsCatalog.js';
import '../../styles/modals/LadyRunSkinsModal.css';

// MOMENTANEO (ver FEATURES.md): primera tanda de precios para ver como reacciona la gente, por
// rareza en vez de por tier normal/ultimate. Ultimate se queda a 0 porque ninguna tiene sprite de
// correr real todavia (no hay forma de comprarla aun). Si cambia, tambien hay que tocar
// spend_currency (supabase/sql/013_skins_precios_rareza.sql).
const SKIN_PRICES = { rare: 5, epic: 10, legendary: 20, ultimate: 0 };
const RARITY_LABEL = { legendary: 'Legendaria', epic: 'Épica', rare: 'Rara' };

// Orden pedido para los circulos de arriba y las secciones de la tienda: Lady y Nupito primero, el
// resto se queda en el orden que ya trae el catalogo.
const DOG_ORDER = ['lady', 'nupito'];

// Tienda de skins de Lady Run, inspirada en la de Pata y Pico (SkinShopModal.jsx): scroll continuo
// con todos los perros como secciones (en vez de obligar a elegir uno primero), los circulos de
// arriba sirven de salto rapido a la seccion de ese perro (quedan fijos arriba mientras se hace
// scroll). Tocar una skin abre un preview grande con marco de rareza/particulas, comprar hace
// fundido -> el perro corriendo (pose propia de la skin si existe, si no los 4 frames base del
// perro) -> revelado con giro.
export default function LadyRunSkinsModal({ onClose, dogIcons = {}, dogNames = {}, ownedSkins = {}, onBuySkin, huesin = 0, tutStep = null, onTutAdvance }) {
    const catalogDogIds = Object.keys(SKIN_CATALOG);
    const dogIds = [...DOG_ORDER.filter(id => catalogDogIds.includes(id)), ...catalogDogIds.filter(id => !DOG_ORDER.includes(id))];
    const [activeDog, setActiveDog] = useState(dogIds[0] ?? null);
    // Paso "skins_volver" del tutorial: tras unos segundos viendo la tienda, se resalta la flecha
    // de volver para cerrar el ultimo paso.
    const [tutBackReady, setTutBackReady] = useState(false);
    useEffect(() => {
        if (tutStep !== 'skins_volver') return undefined;
        const t = setTimeout(() => setTutBackReady(true), 2500);
        return () => clearTimeout(t);
    }, [tutStep]);
    // En skins_volver el modal es obligatorio hasta que pasen los 2.5s (momento en el que la
    // flecha empieza a brillar): ni la flecha ni el fondo oscuro cierran antes de eso.
    const skinsCloseReady = tutStep !== 'skins_volver' || tutBackReady;
    const handleSkinsClose = () => {
        if (!skinsCloseReady) return;
        if (tutStep === 'skins_volver') onTutAdvance?.();
        onClose();
    };
    const [preview, setPreview] = useState(null); // { dogId, skin, tier } | null
    const [purchaseAnim, setPurchaseAnim] = useState(null); // null | 'fading' | 'running' | 'reveal'
    const [justBought, setJustBought] = useState(false);
    const [buyError, setBuyError] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [shockwave, setShockwave] = useState(null);
    const [frameIndex, setFrameIndex] = useState(0);
    const sectionRefs = useRef({});

    useEffect(() => {
        setJustBought(false);
        setBuyError(false);
        setPurchaseAnim(null);
    }, [preview]);

    useEffect(() => {
        const t = setInterval(() => setFrameIndex(prev => (prev + 1) % 4), 150);
        return () => clearInterval(t);
    }, []);

    const jumpToDog = (dogId) => {
        setActiveDog(dogId);
        sectionRefs.current[dogId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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
        const ok = await onBuySkin?.(dogId, skin.id, tier, skin.rarity ?? 'rare');
        if (!ok) {
            setPurchaseAnim(null);
            setBuyError(true);
            return;
        }
        setTimeout(() => setPurchaseAnim('running'), 250);
        setTimeout(() => setPurchaseAnim('reveal'), 3050);
        setTimeout(() => { setPurchaseAnim(null); setJustBought(true); }, 3950);
    };

    return (
        <div className="lady-run-shop-backdrop" onClick={handleSkinsClose}>
            <div className="lady-run-shop-panel lady-run-skins-panel" onClick={e => e.stopPropagation()}>
                {skinsCloseReady && (
                    <button
                        className={`lady-run-back-btn${tutStep === 'skins_volver' ? ' lady-run-tut-highlight' : ''}`}
                        data-tutorial="lady-run-tut-skins-volver"
                        onClick={() => { playLadyRunSfx('backButton'); handleSkinsClose(); }}
                    ><ArrowLeft size={16} /></button>
                )}
                <p className="runner-overlay-title">Skins</p>


                <div className="lady-run-skins-dogs">
                    {dogIds.map(dogId => (
                        <button
                            key={dogId}
                            className={`lady-run-skins-dog-btn${dogId === activeDog ? ' lady-run-skins-dog-btn-active' : ''}`}
                            onClick={() => jumpToDog(dogId)}
                        >
                            {dogIcons[dogId] && <img src={dogIcons[dogId]} alt={dogNames[dogId] ?? dogId} />}
                        </button>
                    ))}
                </div>

                <div className="lady-run-skins-scroll">
                    {dogIds.map(dogId => {
                        const dogCatalog = SKIN_CATALOG[dogId];
                        const allSkins = [
                            ...(dogCatalog.ultimate ? [{ ...dogCatalog.ultimate, isUltimate: true }] : []),
                            ...dogCatalog.normal,
                        ];
                        const unlockedSkins = allSkins.filter(skin => skin.runImg);
                        const lockedSkins = allSkins.filter(skin => !skin.runImg);

                        return (
                            <div key={dogId} ref={el => { sectionRefs.current[dogId] = el; }} className="lady-run-skins-dog-section">
                                <span className="lady-run-skins-section-title lady-run-skins-dog-title">{dogNames[dogId] ?? dogId}</span>
                                {unlockedSkins.length > 0 && (
                                    <div className="lady-run-skins-grid">
                                        {unlockedSkins.map(skin => (
                                            <SkinCard
                                                key={skin.id}
                                                skin={skin}
                                                ultimate={skin.isUltimate}
                                                rarity={skin.rarity}
                                                owned={(ownedSkins[dogId] ?? []).includes(skin.id)}
                                                onOpen={() => setPreview({ dogId, skin, tier: skin.isUltimate ? 'ultimate' : 'normal' })}
                                            />
                                        ))}
                                    </div>
                                )}
                                {lockedSkins.length > 0 && (
                                    <>
                                        <span className="lady-run-skins-section-title">Próximamente</span>
                                        <div className="lady-run-skins-grid">
                                            {lockedSkins.map(skin => (
                                                <SkinCard
                                                    key={skin.id}
                                                    skin={skin}
                                                    ultimate={skin.isUltimate}
                                                    rarity={skin.rarity}
                                                    locked
                                                    onOpen={() => setPreview({ dogId, skin, tier: skin.isUltimate ? 'ultimate' : 'normal' })}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {preview && (() => {
                    const owned = ownedSkins[preview.dogId] ?? [];
                    const isOwned = owned.includes(preview.skin.id) || justBought;
                    const isUltimate = preview.tier === 'ultimate';
                    const rarity = preview.skin.rarity ?? 'rare';
                    const price = isUltimate ? SKIN_PRICES.ultimate : SKIN_PRICES[rarity];
                    const canAfford = price === 0 || huesin >= price;
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
                                    {purchaseAnim === 'running' ? (
                                        <img
                                            src={preview.skin.purchaseRunImg ?? PURCHASE_BASE_FRAMES[preview.dogId]?.[frameIndex]}
                                            alt=""
                                            className="lady-run-skin-preview-run-sprite"
                                        />
                                    ) : purchaseAnim === 'reveal' ? (
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
                                    disabled={isOwned || !canAfford}
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

// "locked" (sin arte todavia, seccion "Proximamente") bloquea el click de verdad. "owned" es aparte:
// solo pinta el candado como aviso de que no la has comprado, la card sigue siendo tocable para
// abrir el preview y comprarla (igual que en Marcos, ver LadyRunAvatarModal.jsx).
function SkinCard({ skin, ultimate, locked, owned = true, rarity, onOpen }) {
    return (
        <button
            className={`lady-run-skin-card${ultimate ? ' lady-run-skin-card-ultimate' : rarity ? ` dog-rarity-${rarity}` : ''}${locked ? ' lady-run-skin-card-locked' : ''}`}
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
            {(locked || !owned) && <img src={lockIcon} alt="Bloqueada" className="lady-run-skin-card-lock" />}
            <span className="lady-run-skin-card-name">{skin.name}</span>
        </button>
    );
}
