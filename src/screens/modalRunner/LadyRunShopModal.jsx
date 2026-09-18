import { ArrowLeft } from 'lucide-react';
import { playLadyRunSfx } from '../../game/utils/ladyRunSfx.js';
import chapaIcon from '../../assets/ui/icons-hud/hud-modals/game-run/icons/hud/chapas.webp';
import tavernCoinIcon from '../../assets/ui/icons-hud/hud-principal/coin-tavern1.webp';
import redHeartIcon from '../../assets/ui/icons-hud/hud-modals/game-run/icons/hud/icons-life/life-dog/vida-base-2.webp';
import magicHeartIcon from '../../assets/ui/icons-hud/hud-modals/game-run/icons/hud/icons-life/life-dog/corazon-magico.webp';
import greenHeartIcon from '../../assets/ui/icons-hud/hud-modals/game-run/icons/hud/icons-life/life-dog/shield-green.webp';
import LadyRunTutorialCallout from '../../components/LadyRunTutorialCallout.jsx';
import '../../styles/modals/LadyRunShopModal.css';

// Tienda propia de Lady Run, separada de la de Pata y Pico para no tocar sus precios/economia.
// "Tienda" es nombre momentaneo.
// - corazon_extra: se gasta al momento, suma una vida inicial a la siguiente run (ladyRunPendingHearts).
// - corazon_magico: se guarda en inventario (tope 2, ladyRunMagicHearts), da 5s de invulnerabilidad
//   al usarlo en Modo Libre, se mantiene entre partidas si no se usa.
// - corazon_verde: se guarda en inventario (tope 5, ladyRunGreenHearts), solo Modo Libre. Al empezar
//   la run se activan todos como escudo extra: cada golpe consume 1 en vez de vida real, y se pierden
//   de verdad al gastarse (no vuelven). Si sobran al terminar la run, se quedan para la siguiente.
const HEART_ITEM = { id: 'corazon_extra', name: 'Corazón extra', desc: 'Una vida más al empezar. Lleva tantas como quieras', price: 10 };
const MAGIC_HEART_ITEM = { id: 'corazon_magico', name: 'Corazón mágico', desc: '5s de invulnerabilidad. Úsalo cuando quieras', price: 15 };
const MAGIC_HEART_MAX = 2;
const GREEN_HEART_ITEM = { id: 'corazon_verde', name: 'Escudo verde', desc: 'Absorbe 1 golpe sin perder vida', price: 15 };
const GREEN_HEART_MAX = 3; // si se cambia, actualizar tambien el mismo numero en RunnerScreen.jsx (huecos fijos en la fila de vidas)
// Cada corazon tiene su PROPIO cooldown de 24h independiente (no un unico "primero del dia"): puedes
// sacar 1 gratis de CADA uno el mismo dia si vas probando. El mismo boton de comprar de siempre pasa a
// "Gratis" solo mientras el cooldown de ese corazon esta cumplido, sin card ni resaltado aparte - la
// primera vez que ocurre para un jugador nuevo coincide con el paso del tutorial (ver tutStep abajo).
const DAILY_FREE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export default function LadyRunShopModal({
    onClose,
    chapas = 0,
    tavernCoins = 0,
    magicHearts = 0,
    greenHearts = 0,
    onBuyItem,
    dailyFreeClaimedAt = {},
    onClaimDailyFree,
    tutStep = null,
    onTutAdvance,
}) {
    const isFreeReady = (itemId) => {
        const last = dailyFreeClaimedAt[itemId];
        return !last || (Date.now() - last) >= DAILY_FREE_COOLDOWN_MS;
    };
    const extraFree = isFreeReady(HEART_ITEM.id);
    const magicFree = isFreeReady(MAGIC_HEART_ITEM.id);
    const greenFree = isFreeReady(GREEN_HEART_ITEM.id);

    const canAffordHeart = chapas >= HEART_ITEM.price;
    const magicHeartAtMax = magicHearts >= MAGIC_HEART_MAX;
    const canAffordMagicHeart = !magicHeartAtMax && tavernCoins >= MAGIC_HEART_ITEM.price;
    const greenHeartAtMax = greenHearts >= GREEN_HEART_MAX;
    const canAffordGreenHeart = !greenHeartAtMax && chapas >= GREEN_HEART_ITEM.price;

    // Si el boton real de comprar esta deshabilitado (al maximo, sin cooldown cumplido y sin pasta),
    // el tutorial no puede depender de que lo toques - por eso el callout ofrece "Entendido" en ese
    // caso exacto, la MISMA condicion que deshabilita cada boton, no solo "no esta gratis".
    const extraUsable = extraFree || canAffordHeart;
    const magicUsable = !magicHeartAtMax && (magicFree || canAffordMagicHeart);
    const greenUsable = !greenHeartAtMax && (greenFree || canAffordGreenHeart);

    const handleBuy = (item, isFree) => {
        onBuyItem?.(item.id, isFree ? 0 : item.price);
        if (isFree) { playLadyRunSfx('boneReward'); onClaimDailyFree?.(item.id); }
        else playLadyRunSfx('rewardGold');
        if (tutStep === item.id) onTutAdvance?.();
    };

    return (
        <div className="lady-run-shop-backdrop" onClick={onClose}>
            <div className="lady-run-shop-panel" onClick={e => e.stopPropagation()}>
                <button
                    className={`lady-run-back-btn${tutStep === 'salir_tienda' ? ' lady-run-tut-highlight' : ''}`}
                    onClick={() => { playLadyRunSfx('backButton'); if (tutStep === 'salir_tienda') onTutAdvance?.(); onClose(); }}
                >
                    <ArrowLeft size={16} />
                </button>
                <p className="runner-overlay-title">Tienda</p>

                <div className="lady-run-shop-content">
                    <div
                        className={`lady-run-shop-heart-card${tutStep === HEART_ITEM.id ? ' lady-run-tut-highlight' : ''}`}
                        data-tutorial="lady-run-tut-corazon_extra"
                    >
                        <img src={redHeartIcon} alt="" className="lady-run-shop-heart-card-icon" />
                        <span className="lady-run-shop-heart-card-name">{HEART_ITEM.name}</span>
                        <span className="lady-run-shop-heart-card-desc">{HEART_ITEM.desc}</span>
                        <button
                            className="runner-start-btn runner-start-btn-compact"
                            disabled={!extraUsable}
                            onClick={() => handleBuy(HEART_ITEM, extraFree)}
                        >
                            {extraFree ? 'Gratis' : (
                                <>
                                    <img src={chapaIcon} alt="Chapas" className="lady-run-shop-heart-card-buy-icon" />
                                    {HEART_ITEM.price}
                                </>
                            )}
                        </button>
                    </div>

                    <div
                        className={`lady-run-shop-heart-card${tutStep === MAGIC_HEART_ITEM.id ? ' lady-run-tut-highlight' : ''}`}
                        data-tutorial="lady-run-tut-corazon_magico"
                    >
                        <img src={magicHeartIcon} alt="" className="lady-run-shop-heart-card-icon" />
                        <span className="lady-run-shop-heart-card-name">{MAGIC_HEART_ITEM.name}</span>
                        <span className="lady-run-shop-heart-card-desc">{MAGIC_HEART_ITEM.desc}</span>
                        <button
                            className="runner-start-btn runner-start-btn-compact"
                            disabled={!magicUsable}
                            onClick={() => handleBuy(MAGIC_HEART_ITEM, magicFree)}
                        >
                            {magicHeartAtMax ? 'Máx. 2' : magicFree ? 'Gratis' : (
                                <>
                                    <img src={tavernCoinIcon} alt="Monedas" className="lady-run-shop-heart-card-buy-icon" />
                                    {MAGIC_HEART_ITEM.price}
                                </>
                            )}
                        </button>
                    </div>

                    <div
                        className={`lady-run-shop-heart-card${tutStep === GREEN_HEART_ITEM.id ? ' lady-run-tut-highlight' : ''}`}
                        data-tutorial="lady-run-tut-corazon_verde"
                    >
                        <img src={greenHeartIcon} alt="" className="lady-run-shop-heart-card-icon" />
                        <span className="lady-run-shop-heart-card-name">{GREEN_HEART_ITEM.name}</span>
                        <span className="lady-run-shop-heart-card-desc">{GREEN_HEART_ITEM.desc}</span>
                        <button
                            className="runner-start-btn runner-start-btn-compact"
                            disabled={!greenUsable}
                            onClick={() => handleBuy(GREEN_HEART_ITEM, greenFree)}
                        >
                            {greenHeartAtMax ? 'Máx. 3' : greenFree ? 'Gratis' : (
                                <>
                                    <img src={chapaIcon} alt="Chapas" className="lady-run-shop-heart-card-buy-icon" />
                                    {GREEN_HEART_ITEM.price}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Idea a futuro, sin funcionalidad todavia - sin icono. */}
                    <div className="lady-run-shop-heart-card">
                        <span className="lady-run-shop-heart-card-name">Bomba</span>
                        <span className="lady-run-shop-heart-card-desc">Placeholder</span>
                        <button className="runner-start-btn runner-start-btn-compact lady-run-shop-soon-btn" disabled>
                            Próx.
                        </button>
                    </div>
                </div>
            </div>

            {tutStep === HEART_ITEM.id && (
                <LadyRunTutorialCallout
                    targetSelector='[data-tutorial="lady-run-tut-corazon_extra"]'
                    title="Corazón extra"
                    text="Cómpralo con Chapas. Te da una vida más al empezar tu próxima carrera. Cógelo gratis esta vez."
                    actionLabel={extraUsable ? null : 'Entendido'}
                    onAction={extraUsable ? undefined : onTutAdvance}
                />
            )}
            {tutStep === MAGIC_HEART_ITEM.id && (
                <LadyRunTutorialCallout
                    targetSelector='[data-tutorial="lady-run-tut-corazon_magico"]'
                    title="Corazón mágico"
                    text="Cómpralo con Moneda. Te da unos segundos de invulnerabilidad al usarlo en la carrera."
                    actionLabel={magicUsable ? null : 'Entendido'}
                    onAction={magicUsable ? undefined : onTutAdvance}
                />
            )}
            {tutStep === GREEN_HEART_ITEM.id && (
                <LadyRunTutorialCallout
                    targetSelector='[data-tutorial="lady-run-tut-corazon_verde"]'
                    title="Escudo verde"
                    text="Cómpralo con Chapas. Te absorbe un golpe sin quitarte vida real, pero se gasta al usarlo."
                    actionLabel={greenUsable ? null : 'Entendido'}
                    onAction={greenUsable ? undefined : onTutAdvance}
                />
            )}
            {tutStep === 'daily_reminder' && (
                <LadyRunTutorialCallout
                    targetSelector='[data-tutorial="lady-run-tut-corazon_verde"]'
                    title="Vuelve cada día"
                    text="Cada uno se puede volver a coger gratis cada 24 horas. Vuelve mañana a por más."
                    actionLabel="Entendido"
                    onAction={onTutAdvance}
                />
            )}
        </div>
    );
}
