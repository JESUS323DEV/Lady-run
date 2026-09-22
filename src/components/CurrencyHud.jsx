import { formatNumber, formatNumber2 } from '../game/utils/formatters.js';
import chapaIcon from '../assets/ui/icons-hud/hud-modals/game-run/icons/hud/chapas.webp';
import coinTavern from '../assets/ui/icons-hud/hud-principal/coin-tavern1.webp';
import huesinCoin from '../assets/ui/icons-hud/hud-principal/huesin-coin.webp';
import LadyRunSoundSettings from './LadyRunSoundSettings.jsx';
import LadyRunTutorialCallout from './LadyRunTutorialCallout.jsx';
import '../styles/components/CurrencyHud.css';

/**
 * Barra de monedas (chapas, coin taberna, huesin), compartida por el acceso standalone y el
 * acceso embebido de Lady Run, que no tienen el HUD grande de Pata y Pico. Sin oro: en Lady Run
 * no se gana ni se usa.
 */
const CurrencyHud = ({
    chapas = 0, tavernCoins = 0, huesin = 0, tutStep = null, onTutAdvance,
    googleLinked = false, onLinkGoogle, onSignInGoogle, onSignOut, linkGoogleIdentityExists = false, linkGoogleError = null,
}) => {
    const tutActiveOnHud = tutStep === 'hud_chapas' || tutStep === 'hud_taberna' || tutStep === 'hud_huesin';

    return (
        <div className={`currency-hud${tutActiveOnHud ? ' lady-run-tut-active' : ''}`}>
            <div
                className={`currency-hud-item${tutStep === 'hud_chapas' ? ' lady-run-tut-highlight' : ''}`}
                data-tutorial="lady-run-tut-hud-chapas"
            >
                <img src={chapaIcon} alt="Chapas" />
                <span>{formatNumber2(chapas)}</span>
            </div>
            <div
                className={`currency-hud-item${tutStep === 'hud_taberna' ? ' lady-run-tut-highlight' : ''}`}
                data-tutorial="lady-run-tut-hud-taberna"
            >
                <img src={coinTavern} alt="Moneda" />
                <span>{formatNumber2(tavernCoins)}</span>
            </div>
            <div
                className={`currency-hud-item${tutStep === 'hud_huesin' ? ' lady-run-tut-highlight' : ''}`}
                data-tutorial="lady-run-tut-hud-huesin"
            >
                <img src={huesinCoin} alt="Huesín" />
                <span>{formatNumber(huesin)}</span>
            </div>
            <LadyRunSoundSettings
                googleLinked={googleLinked}
                onLinkGoogle={onLinkGoogle}
                onSignInGoogle={onSignInGoogle}
                onSignOut={onSignOut}
                linkGoogleIdentityExists={linkGoogleIdentityExists}
                linkGoogleError={linkGoogleError}
            />

            {tutStep === 'hud_chapas' && (
                <LadyRunTutorialCallout
                    targetSelector='[data-tutorial="lady-run-tut-hud-chapas"]'
                    title="Chapas"
                    text="Las consigues jugando. Gástalas en la Tienda para conseguir un corazón extra."
                    actionLabel="Continuar"
                    onAction={onTutAdvance}
                />
            )}
            {tutStep === 'hud_taberna' && (
                <LadyRunTutorialCallout
                    targetSelector='[data-tutorial="lady-run-tut-hud-taberna"]'
                    title="Moneda"
                    text="La consigues jugando. Gástala en la Tienda para comprar el Corazón mágico."
                    actionLabel="Continuar"
                    onAction={onTutAdvance}
                />
            )}
            {tutStep === 'hud_huesin' && (
                <LadyRunTutorialCallout
                    targetSelector='[data-tutorial="lady-run-tut-hud-huesin"]'
                    title="Huesín"
                    text="Gástala en Skins y marcos de avatar. Intenta conseguir todas las que puedas."
                    actionLabel="Continuar"
                    onAction={onTutAdvance}
                />
            )}
        </div>
    );
};

export default CurrencyHud;
