// Sistema de SFX propio de Lady Run, independiente del de Pata y Pico (sfx.js): su propio
// AudioContext, su propia cache de buffers y su propia config, para no compartir nada entre
// los dos juegos (ver feedback_sistemas_aislados). Reutiliza algunos archivos .mp3 de Pata y
// Pico como fuente de sonido (mismo audio), pero sin tocar su config ni su gain.
import sfxDoubleJumpUrl   from '../../assets/audio/sfx/only-send-raid.mp3';
import sfxRewardGoldUrl   from '../../assets/audio/sfx/only-rewards-gold.mp3';
import sfxRewardCoinUrl   from '../../assets/audio/sfx/only-rewards-coin-tavern.mp3';
import sfxRewardShardsUrl from '../../assets/audio/sfx/only-rewards-shards.mp3';
import sfxHealUrl         from '../../assets/audio/lady-run/sfx/heal-sfx.mp3';
import sfxRouletteUrl     from '../../assets/audio/lady-run/sfx/ruleta-esenario-trim.mp3';
import sfxSelectSceneUrl  from '../../assets/audio/lady-run/sfx/select-esenario-trim.mp3';
import sfxHitPlayerUrl    from '../../assets/audio/lady-run/sfx/hit-pj-1-sfx-trim.mp3';
import sfxLoseGameUrl     from '../../assets/audio/lady-run/sfx/lose-game.mp3';
import sfxMagicHeartUrl   from '../../assets/audio/lady-run/sfx/corazon-magic.mp3';

let audioCtx = null;
const buffers = {};

const SFX_CONFIG = {
    doubleJump:  { offset: 0.0, gain: 1.0 },
    rewardGold:  { offset: 0.0, gain: 1.0 },
    rewardCoin:  { offset: 0.0, gain: 1.0 },
    boneReward:  { offset: 0.0, gain: 0.4 },
    heal:        { offset: 0.0, gain: 1.0 },
    roulette:    { offset: 0.0, gain: 1.0 },
    selectScene: { offset: 0.0, gain: 1.0 },
    hitPlayer:   { offset: 0.0, gain: 1.0 },
    loseGame:    { offset: 0.0, gain: 1.0 },
    // El clip solo tiene la parte buena en los primeros 1.3s (de 3s totales): se repite en bucle
    // durante los 5s que dura la invulnerabilidad (MAGIC_HEART_INVULN_MS en RunnerScreen.jsx),
    // luego se corta en seco. Si esa duracion cambia alli, actualizar stopAfter aqui tambien.
    magicHeart:  { offset: 0.0, gain: 1.0, loop: true, loopStart: 0.0, loopEnd: 1.3, stopAfter: 5.0 },
};

const SFX_SOURCES = {
    doubleJump:  sfxDoubleJumpUrl,
    rewardGold:  sfxRewardGoldUrl,
    rewardCoin:  sfxRewardCoinUrl,
    boneReward:  sfxRewardShardsUrl,
    heal:        sfxHealUrl,
    roulette:    sfxRouletteUrl,
    selectScene: sfxSelectSceneUrl,
    hitPlayer:   sfxHitPlayerUrl,
    loseGame:    sfxLoseGameUrl,
    magicHeart:  sfxMagicHeartUrl,
};

const ensureCtx = () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
};

const loadBuffer = async (key, url) => {
    if (buffers[key]) return;
    try {
        const ctx = ensureCtx();
        const res = await fetch(url);
        const data = await res.arrayBuffer();
        buffers[key] = await ctx.decodeAudioData(data);
    } catch { /* ignore decode errors */ }
};

export const ladyRunSfxReady = Promise.all(
    Object.entries(SFX_SOURCES).map(([key, url]) => loadBuffer(key, url))
).catch(() => {});

export const playLadyRunSfx = (key) => {
    if (!audioCtx || !buffers[key]) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const { offset = 0, duration, gain: gainMult = 1.0, loop = false, loopStart, loopEnd, stopAfter } = SFX_CONFIG[key] ?? {};
    const source = audioCtx.createBufferSource();
    source.buffer = buffers[key];
    if (loop) {
        source.loop = true;
        if (loopStart != null) source.loopStart = loopStart;
        if (loopEnd != null) source.loopEnd = loopEnd;
    }
    const gain = audioCtx.createGain();
    gain.gain.value = parseFloat(localStorage.getItem('sfx_volume_ladyrun') ?? '0.09') * gainMult;
    source.connect(gain);
    gain.connect(audioCtx.destination);
    source.start(0, offset);
    if (duration != null) source.stop(audioCtx.currentTime + duration);
    if (stopAfter != null) source.stop(audioCtx.currentTime + stopAfter);
};
