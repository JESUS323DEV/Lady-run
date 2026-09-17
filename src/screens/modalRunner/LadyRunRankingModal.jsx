import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { AVATAR_FRAMES } from './ladyRunAvatarFramesCatalog.js';
import { SKIN_CATALOG } from './ladyRunSkinsCatalog.js';
import LadyRunTutorialCallout from '../../components/LadyRunTutorialCallout.jsx';
import trophyGold from '../../assets/ui/icons-hud/hud-modals/rankings/copa-oro.webp';
import trophySilver from '../../assets/ui/icons-hud/hud-modals/rankings/copa-plata.webp';
import trophyBronze from '../../assets/ui/icons-hud/hud-modals/rankings/copa-bronze.webp';
import '../../styles/modals/LadyRunRankingModal.css';

const LEADERBOARD_LIMIT = 20;
const TROPHY_BY_POSITION = [trophyGold, trophySilver, trophyBronze]; // solo top 3, index 0/1/2

const DIFFICULTIES = [
    { id: 'facil', label: 'Fácil' },
    { id: 'medio', label: 'Medio' },
    { id: 'dificil', label: 'Difícil' },
];

// Ranking de Lady Run (v1): un listado por mayor recorrido de Modo Libre, separado por dificultad,
// sin separar por escenario todavia (ver FEATURES.md). Lee la vista leaderboard (MAX(distance) por
// jugador+dificultad, ver supabase/sql/007_leaderboard_por_dificultad.sql), no la tabla runs directamente.
export default function LadyRunRankingModal({ onClose, dogIcons = {}, dogRunSprites = {}, tutEpilogue = null, onTutEpilogueAdvance }) {
    const [difficulty, setDifficulty] = useState('facil');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    // Paso "ranking_close" del epilogo del Tutorial 3: tras unos segundos leyendo el intro, se
    // resalta la flecha de volver (sin texto, se cierra cuando el jugador quiera).
    const [tutCloseReady, setTutCloseReady] = useState(false);
    useEffect(() => {
        if (tutEpilogue !== 'ranking_close') return undefined;
        const t = setTimeout(() => setTutCloseReady(true), 2500);
        return () => clearTimeout(t);
    }, [tutEpilogue]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('leaderboard')
                .select('profile_id, username, avatar_dog_id, avatar_frame_id, avatar_skin_id, last_dog_id, best_distance')
                .eq('difficulty', difficulty)
                .order('best_distance', { ascending: false })
                .limit(LEADERBOARD_LIMIT);
            if (cancelled) return;
            if (error) setErrorMsg('No se pudo cargar el ranking.');
            else setRows(data ?? []);
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, [difficulty]);

    // En ranking_intro (mensaje "Continuar" obligatorio) y en ranking_close antes de los 2.5s
    // (tutCloseReady, momento en el que empieza a brillar), ni la flecha ni el fondo cierran esto.
    const rankingTutLocked = tutEpilogue === 'ranking_intro' || (tutEpilogue === 'ranking_close' && !tutCloseReady);
    const handleRankingClose = () => {
        if (rankingTutLocked) return;
        if (tutEpilogue === 'ranking_close' && tutCloseReady) onTutEpilogueAdvance?.('final');
        onClose();
    };

    return (
        <div className="lady-run-shop-backdrop" onClick={handleRankingClose}>
            <div className="lady-run-shop-panel" onClick={e => e.stopPropagation()}>
                {!rankingTutLocked && (
                    <button
                        className={`lady-run-back-btn${tutEpilogue === 'ranking_close' ? ' lady-run-tut-highlight' : ''}`}
                        onClick={handleRankingClose}
                    ><ArrowLeft size={16} /></button>
                )}
                <p className="runner-overlay-title">Ranking</p>

                {tutEpilogue === 'ranking_intro' && (
                    <LadyRunTutorialCallout
                        title="Compite de verdad"
                        text="Aquí ves a los mejores corredores. El ranking se divide por dificultad: fácil, medio y difícil."
                        actionLabel="Continuar"
                        onAction={() => onTutEpilogueAdvance?.('ranking_close')}
                    />
                )}

                <div className="lady-run-ranking-difficulty">
                    {DIFFICULTIES.map(d => (
                        <button
                            key={d.id}
                            className={`runner-difficulty-btn${difficulty === d.id ? ' runner-difficulty-active' : ''}`}
                            onClick={() => setDifficulty(d.id)}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>

                <div className="lady-run-ranking-list">
                    {loading && <p className="lady-run-ranking-status">Cargando...</p>}
                    {!loading && errorMsg && <p className="lady-run-ranking-status">{errorMsg}</p>}
                    {!loading && !errorMsg && rows.length === 0 && (
                        <p className="lady-run-ranking-status">Todavía no hay partidas registradas.</p>
                    )}
                    {!loading && !errorMsg && rows.map((row, index) => {
                        const frame = AVATAR_FRAMES.find(f => f.id === row.avatar_frame_id) ?? AVATAR_FRAMES[0];
                        const catalog = SKIN_CATALOG[row.avatar_dog_id];
                        const equippedSkin = row.avatar_skin_id
                            ? [catalog?.ultimate, ...(catalog?.normal ?? [])].find(s => s?.id === row.avatar_skin_id)
                            : null;
                        return (
                        <div key={row.profile_id} className="lady-run-ranking-row">
                            <span className="lady-run-ranking-position">{index + 1}</span>
                            <span className="lady-run-ranking-avatar">
                                {frame && <img src={frame.img} alt="" className="lady-run-ranking-avatar-frame" />}
                                {row.avatar_dog_id && dogIcons[row.avatar_dog_id] && (
                                    <img
                                        src={equippedSkin?.img ?? dogIcons[row.avatar_dog_id]}
                                        alt=""
                                        className={`lady-run-ranking-avatar-photo${frame?.folder === 'marco-fondo' ? ' lady-run-ranking-avatar-photo-bottom' : ''}`}
                                    />
                                )}
                            </span>
                            <span className="lady-run-ranking-username-cell">
                                <span className="lady-run-ranking-username">{row.username}</span>
                                {TROPHY_BY_POSITION[index] && <img src={TROPHY_BY_POSITION[index]} alt="" className="lady-run-ranking-trophy" />}
                            </span>
                            <span className="lady-run-ranking-last-dog">
                                {row.last_dog_id && dogRunSprites[row.last_dog_id] && (
                                    <img src={dogRunSprites[row.last_dog_id]} alt="" />
                                )}
                            </span>
                            <span className="lady-run-ranking-distance">{row.best_distance} m</span>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
