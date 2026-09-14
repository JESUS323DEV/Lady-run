import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import '../../styles/modals/LadyRunRankingModal.css';

const LEADERBOARD_LIMIT = 20;

// Ranking global de Lady Run (v1): un unico listado por mayor recorrido de Modo Libre, sin separar
// por escenario todavia (ver FEATURES.md). Lee la vista leaderboard (MAX(distance) por jugador,
// ver supabase/sql/003_leaderboard.sql), no la tabla runs directamente.
export default function LadyRunRankingModal({ onClose }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('profile_id, username, best_distance')
                .order('best_distance', { ascending: false })
                .limit(LEADERBOARD_LIMIT);
            if (cancelled) return;
            if (error) setErrorMsg('No se pudo cargar el ranking.');
            else setRows(data ?? []);
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="lady-run-shop-backdrop" onClick={onClose}>
            <div className="lady-run-shop-panel" onClick={e => e.stopPropagation()}>
                <button className="lady-run-back-btn" onClick={onClose}><ArrowLeft size={16} /></button>
                <p className="runner-overlay-title">Ranking</p>

                <div className="lady-run-ranking-list">
                    {loading && <p className="lady-run-ranking-status">Cargando...</p>}
                    {!loading && errorMsg && <p className="lady-run-ranking-status">{errorMsg}</p>}
                    {!loading && !errorMsg && rows.length === 0 && (
                        <p className="lady-run-ranking-status">Todavía no hay partidas registradas.</p>
                    )}
                    {!loading && !errorMsg && rows.map((row, index) => (
                        <div key={row.profile_id} className="lady-run-ranking-row">
                            <span className="lady-run-ranking-position">{index + 1}</span>
                            <span className="lady-run-ranking-avatar" />
                            <span className="lady-run-ranking-username">{row.username}</span>
                            <span className="lady-run-ranking-distance">{row.best_distance} m</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
