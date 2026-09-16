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

            const { data: profileRow, error: profileError } = await supabase
                .from('profiles')
                .select('id, username, avatar_dog_id, avatar_frame_id, chapas, tavern_coins, huesin')
                .eq('id', currentSession.user.id)
                .maybeSingle();

            if (!cancelled) {
                if (profileError) {
                    // Fallo real de conexion/consulta: nunca tratarlo como "no tienes perfil todavia",
                    // o mandaria a un jugador YA registrado a la pantalla de elegir ID otra vez.
                    setInitError(profileError.message);
                } else {
                    setProfile(profileRow ?? null);
                }
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
            .select('id, username, avatar_dog_id, avatar_frame_id, chapas, tavern_coins, huesin')
            .single();
        setClaiming(false);

        if (error) {
            setClaimError(error.code === '23505' ? 'Ese ID ya está en uso, prueba otro.' : 'No se pudo guardar, inténtalo de nuevo.');
            return false;
        }
        setProfile(data);
        return true;
    }, [session]);

    const equipAvatar = useCallback(async (dogId) => {
        if (!session) return false;
        const { data, error } = await supabase
            .from('profiles')
            .update({ avatar_dog_id: dogId })
            .eq('id', session.user.id)
            .select('id, username, avatar_dog_id')
            .single();

        if (error) return false;
        setProfile(data);
        return true;
    }, [session]);

    const equipAvatarFrame = useCallback(async (frameId) => {
        if (!session) return false;
        const { data, error } = await supabase
            .from('profiles')
            .update({ avatar_frame_id: frameId })
            .eq('id', session.user.id)
            .select('avatar_frame_id')
            .single();

        if (error) return false;
        setProfile(prev => (prev ? { ...prev, ...data } : prev));
        return true;
    }, [session]);

    // Suma moneda (recogida jugando) llamando a la funcion de Supabase, nunca escribiendo el
    // numero directamente - ver supabase/sql/008_profiles_currency.sql.
    const earnCurrency = useCallback(async ({ chapas = 0, tavernCoins = 0, huesin = 0 } = {}) => {
        if (!session) return false;
        const { data, error } = await supabase
            .rpc('earn_currency', { p_chapas: chapas, p_tavern_coins: tavernCoins, p_huesin: huesin })
            .single();
        if (error) return false;
        setProfile(prev => (prev ? { ...prev, ...data } : prev));
        return true;
    }, [session]);

    // Gasta moneda en un item del catalogo (precio fijo en el servidor). Devuelve false si no hay
    // saldo suficiente, sin tocar nada.
    const spendCurrency = useCallback(async (itemId) => {
        if (!session) return false;
        const { data, error } = await supabase
            .rpc('spend_currency', { p_item_id: itemId })
            .single();
        if (error) return false;
        setProfile(prev => (prev ? { ...prev, ...data } : prev));
        return true;
    }, [session]);

    return { loading, initError, profile, claiming, claimError, claimUsername, equipAvatar, equipAvatarFrame, earnCurrency, spendCurrency };
};
