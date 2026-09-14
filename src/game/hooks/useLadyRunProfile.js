import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';

// Identidad de Lady Run: cuenta anonima de Supabase creada sola (sin password ni email reales),
// mas un ID elegido por el jugador para el ranking global (tabla profiles, 1 fila por usuario,
// ver supabase/sql/001_profiles.sql). Mas adelante, si hace falta password/email de verdad,
// se puede "reclamar" esta misma cuenta anonima (supabase.auth.updateUser) sin perder el ID.
export const useLadyRunProfile = () => {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initError, setInitError] = useState(null);
    const [claiming, setClaiming] = useState(false);
    const [claimError, setClaimError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            let { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
                const { data, error } = await supabase.auth.signInAnonymously();
                if (error) {
                    if (!cancelled) { setInitError(error.message); setLoading(false); }
                    return;
                }
                if (cancelled) return;
                currentSession = data.session;
            }
            if (cancelled) return;
            setSession(currentSession);

            const { data: profileRow } = await supabase
                .from('profiles')
                .select('id, username')
                .eq('id', currentSession.user.id)
                .maybeSingle();

            if (!cancelled) {
                setProfile(profileRow ?? null);
                setLoading(false);
            }
        };

        init();
        return () => { cancelled = true; };
    }, []);

    const claimUsername = useCallback(async (username) => {
        if (!session) return false;
        setClaiming(true);
        setClaimError(null);
        const { data, error } = await supabase
            .from('profiles')
            .insert({ id: session.user.id, username })
            .select('id, username')
            .single();
        setClaiming(false);

        if (error) {
            setClaimError(error.code === '23505' ? 'Ese ID ya está en uso, prueba otro.' : 'No se pudo guardar, inténtalo de nuevo.');
            return false;
        }
        setProfile(data);
        return true;
    }, [session]);

    return { loading, initError, profile, claiming, claimError, claimUsername };
};
